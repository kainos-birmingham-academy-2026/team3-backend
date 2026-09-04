import type { JobRoleDetailedResponse } from "../models/jobRoleDetailedResponse.js";
import type { JobRoleResponse } from "../models/jobRoleResponse.js";
import type { AzureOpenAIService } from "./azureOpenAIService.js";
import type { JobRolesService } from "./jobRolesService.js";

const MAX_MATCHED_ROLES = 3;
const ROLE_FILTER_FIELDS = [
	"roleName",
	"capabilityName",
	"bandName",
	"locationName",
	"statusName",
] as const;
const METADATA_QUERIES = [
	{ terms: ["band", "bands"], field: "bandName", label: "bands" },
	{
		terms: ["capability", "capabilities"],
		field: "capabilityName",
		label: "capabilities",
	},
	{
		terms: ["location", "locations"],
		field: "locationName",
		label: "locations",
	},
	{ terms: ["status", "statuses"], field: "statusName", label: "statuses" },
] as const;
const OUT_OF_SCOPE_ANSWER =
	"I can only help with questions about the available job roles.";
const JOB_ROLE_TERMS = new Set([
	"application",
	"apply",
	"band",
	"bands",
	"benefits",
	"capability",
	"capabilities",
	"career",
	"careers",
	"closing",
	"deadline",
	"describe",
	"description",
	"job",
	"jobs",
	"location",
	"locations",
	"open",
	"position",
	"positions",
	"responsibilities",
	"responsibility",
	"requirements",
	"role",
	"roles",
	"salary",
	"status",
	"statuses",
	"vacancies",
	"vacancy",
]);
const ROLE_DETAIL_TERMS = new Set([
	"application",
	"apply",
	"benefits",
	"closing",
	"deadline",
	"describe",
	"description",
	"requirements",
	"responsibilities",
	"responsibility",
	"salary",
]);
const DETAIL_QUESTION_NOISE_TERMS = new Set([
	"date",
	"details",
	"how",
	"know",
	"much",
	"please",
	"tell",
	"when",
]);
const DISCOVERY_NOISE_TERMS = new Set([
	"all",
	"any",
	"available",
	"based",
	"currently",
	"career",
	"careers",
	"find",
	"located",
	"near",
	"now",
	"please",
	"right",
	"show",
	"us",
]);
const STOP_WORDS = new Set([
	"a",
	"about",
	"an",
	"and",
	"are",
	"can",
	"do",
	"for",
	"have",
	"i",
	"in",
	"is",
	"job",
	"jobs",
	"me",
	"of",
	"on",
	"or",
	"role",
	"roles",
	"the",
	"there",
	"these",
	"to",
	"what",
	"which",
	"with",
]);

export interface JobRoleChatResponse {
	answer: string;
	roles: Array<{
		jobRoleId: number;
		roleName: string;
		location: string;
		status: string;
		openPositions: number;
		closingDate: Date | null;
	}>;
}

export class JobRoleChatService {
	constructor(
		private readonly jobRolesService: JobRolesService,
		private readonly aiService: AzureOpenAIService,
	) {}

	async answer(message: string): Promise<JobRoleChatResponse> {
		const roles = await this.jobRolesService.findAll();
		if (!this.isJobRoleQuestion(message, roles)) {
			return { answer: OUT_OF_SCOPE_ANSWER, roles: [] };
		}
		const metadataAnswer = this.buildMetadataAnswer(message, roles);
		if (metadataAnswer) {
			return { answer: metadataAnswer, roles: [] };
		}
		if (this.needsRoleClarification(message, roles)) {
			return {
				answer: "Which role would you like to know about?",
				roles: [],
			};
		}

		const matchedRoles = this.selectRoles(message, roles);
		if (matchedRoles.length === 0) {
			return { answer: this.buildDiscoveryAnswer(0, message), roles: [] };
		}
		const detailedRoles = await Promise.all(
			matchedRoles.map((role) => this.jobRolesService.findById(role.jobRoleId)),
		);
		const answer = this.isRoleDiscoveryQuestion(message)
			? this.buildDiscoveryAnswer(detailedRoles.length, message)
			: await this.aiService.answer(
					this.buildSystemPrompt(detailedRoles),
					message,
				);

		return {
			answer:
				answer ||
				"I couldn't find that information in the current job role details.",
			roles: detailedRoles.map(
				({
					jobRoleId,
					roleName,
					locationName,
					statusName,
					numberOfOpenPositions,
					closingDate,
				}) => ({
					jobRoleId,
					roleName,
					location: locationName,
					status: statusName,
					openPositions: numberOfOpenPositions,
					closingDate,
				}),
			),
		};
	}

	private isRoleDiscoveryQuestion(message: string): boolean {
		const terms = message
			.toLowerCase()
			.split(/[^a-z0-9]+/)
			.filter(Boolean);
		if (terms.some((term) => ROLE_DETAIL_TERMS.has(term))) {
			return false;
		}

		return terms.some((term) =>
			[
				"career",
				"careers",
				"job",
				"jobs",
				"position",
				"positions",
				"open",
				"role",
				"roles",
				"vacancies",
				"vacancy",
			].includes(term),
		);
	}

	private buildDiscoveryAnswer(roleCount: number, message: string): string {
		if (roleCount === 0) {
			const requestedLocation = message
				.match(/\bin\s+([a-z][a-z -]*?)[?.!]*$/i)?.[1]
				.trim();
			if (requestedLocation) {
				return `I couldn't find any jobs in ${requestedLocation}.`;
			}
			return "I couldn't find any matching roles.";
		}

		return roleCount === 1 ? "Here is 1 role." : `Here are ${roleCount} roles.`;
	}

	private isJobRoleQuestion(
		message: string,
		roles: JobRoleResponse[],
	): boolean {
		const normalizedMessage = message.toLowerCase();
		const terms = normalizedMessage.split(/[^a-z0-9]+/).filter(Boolean);
		if (terms.some((term) => JOB_ROLE_TERMS.has(term))) {
			return true;
		}

		return roles.some((role) =>
			[role.roleName, role.capabilityName, role.bandName, role.locationName]
				.join(" ")
				.toLowerCase()
				.split(/[^a-z0-9]+/)
				.some((term) => term.length > 2 && terms.includes(term)),
		);
	}

	private buildMetadataAnswer(
		message: string,
		roles: JobRoleResponse[],
	): string | null {
		const normalizedMessage = message.toLowerCase();
		const terms = normalizedMessage.split(/[^a-z0-9]+/).filter(Boolean);
		const query = METADATA_QUERIES.find(({ terms: queryTerms }) =>
			queryTerms.some((term) => terms.includes(term)),
		);
		if (!query) return null;

		if (this.mentionsSpecificValue(normalizedMessage, roles)) return null;

		const values = [...new Set(roles.map((role) => role[query.field]))].sort(
			(left, right) => left.localeCompare(right),
		);
		return values.length > 0
			? `Available ${query.label}: ${values.join(", ")}.`
			: `There are no available ${query.label}.`;
	}

	private needsRoleClarification(
		message: string,
		roles: JobRoleResponse[],
	): boolean {
		const normalizedMessage = message.toLowerCase();
		const terms = normalizedMessage.split(/[^a-z0-9]+/).filter(Boolean);
		return (
			terms.some((term) => ROLE_DETAIL_TERMS.has(term)) &&
			!this.mentionsSpecificValue(normalizedMessage, roles) &&
			terms.every(
				(term) =>
					term.length <= 1 ||
					ROLE_DETAIL_TERMS.has(term) ||
					DETAIL_QUESTION_NOISE_TERMS.has(term) ||
					STOP_WORDS.has(term),
			)
		);
	}

	private mentionsSpecificValue(
		normalizedMessage: string,
		roles: JobRoleResponse[],
	): boolean {
		return roles.some((role) =>
			ROLE_FILTER_FIELDS.some((field) =>
				normalizedMessage.includes(role[field].toLowerCase()),
			),
		);
	}

	private selectRoles(
		message: string,
		roles: JobRoleResponse[],
	): JobRoleResponse[] {
		const normalizedMessage = message.toLowerCase();
		const terms = normalizedMessage
			.split(/[^a-z0-9]+/)
			.filter((term) => term.length > 1 && !STOP_WORDS.has(term));
		const searchableRoles = roles.map((role) => ({
			role,
			fields: Object.fromEntries(
				ROLE_FILTER_FIELDS.map((field) => [field, role[field].toLowerCase()]),
			) as Record<(typeof ROLE_FILTER_FIELDS)[number], string>,
		}));
		const categoryFilters = ROLE_FILTER_FIELDS.map((field) => ({
			field,
			terms: terms.filter((term) =>
				searchableRoles.some(({ fields }) => fields[field].includes(term)),
			),
		})).filter(({ terms: categoryTerms }) => categoryTerms.length > 0);
		const recognizedTerms = new Set(
			categoryFilters.flatMap(({ terms: categoryTerms }) => categoryTerms),
		);
		const unmatchedTerms = terms.filter(
			(term) =>
				!DISCOVERY_NOISE_TERMS.has(term) &&
				!ROLE_DETAIL_TERMS.has(term) &&
				!recognizedTerms.has(term),
		);
		const hasIdentifyingFilter = categoryFilters.some(
			({ field }) => field !== "statusName",
		);
		if (
			unmatchedTerms.length > 0 &&
			(this.isRoleDiscoveryQuestion(message) || !hasIdentifyingFilter)
		) {
			return [];
		}

		const matchingRoles = searchableRoles.filter(({ fields }) =>
			categoryFilters.every(({ field, terms: categoryTerms }) =>
				categoryTerms.some((term) => fields[field].includes(term)),
			),
		);
		const scoredRoles = matchingRoles
			.map((role) => {
				const score = categoryFilters.filter(
					({ field, terms: categoryTerms }) =>
						categoryTerms.some((term) => role.fields[field].includes(term)),
				).length;
				const exactRoleBonus = normalizedMessage.includes(
					role.role.roleName.toLowerCase(),
				)
					? 10
					: 0;
				return { role: role.role, score: score + exactRoleBonus };
			})
			.sort((left, right) => right.score - left.score);

		return scoredRoles.slice(0, MAX_MATCHED_ROLES).map(({ role }) => role);
	}

	private buildSystemPrompt(roles: JobRoleDetailedResponse[]): string {
		return [
			"You answer applicant questions about Kainos job roles.",
			"Use only the job role JSON below. Never infer or invent missing facts.",
			"If the JSON does not answer the question, say that the current job role information does not include it.",
			"Keep the answer to one or two short sentences.",
			"Do not make a list or repeat location, status, vacancies, or closing dates because the interface displays those facts separately.",
			"Do not add follow-up guidance asking the applicant to choose a role.",
			`Job roles: ${JSON.stringify(roles)}`,
		].join("\n");
	}
}
