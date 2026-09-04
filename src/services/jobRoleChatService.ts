import type { JobRoleDetailedResponse } from "../models/jobRoleDetailedResponse.js";
import type { JobRoleResponse } from "../models/jobRoleResponse.js";
import type { AzureOpenAIService } from "./azureOpenAIService.js";
import type { JobRolesService } from "./jobRolesService.js";

const MAX_MATCHED_ROLES = 3;
const OUT_OF_SCOPE_ANSWER =
	"I can only help with questions about the available job roles.";
const JOB_ROLE_TERMS = new Set([
	"application",
	"apply",
	"band",
	"benefits",
	"capability",
	"career",
	"careers",
	"closing",
	"deadline",
	"description",
	"job",
	"jobs",
	"location",
	"open",
	"position",
	"positions",
	"responsibilities",
	"responsibility",
	"role",
	"roles",
	"salary",
	"vacancies",
	"vacancy",
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
	"role",
	"roles",
	"the",
	"there",
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

		const matchedRoles = this.selectRoles(message, roles);
		const detailedRoles = await Promise.all(
			matchedRoles.map((role) =>
				this.jobRolesService.findById(role.jobRoleId),
			),
		);
		const answer = await this.aiService.answer(
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
			[
				role.roleName,
				role.capabilityName,
				role.bandName,
				role.locationName,
			]
				.join(" ")
				.toLowerCase()
				.split(/[^a-z0-9]+/)
				.some((term) => term.length > 2 && terms.includes(term)),
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
		const scoredRoles = roles
			.map((role) => {
				const searchableFields = [
					role.roleName,
					role.capabilityName,
					role.bandName,
					role.locationName,
					role.statusName,
				]
					.join(" ")
					.toLowerCase();
				const score = terms.filter((term) => searchableFields.includes(term)).length;
				const exactRoleBonus = normalizedMessage.includes(
					role.roleName.toLowerCase(),
				)
					? 10
					: 0;
				return { role, score: score + exactRoleBonus };
			})
			.sort((left, right) => right.score - left.score);
		const relevantRoles = scoredRoles.filter(({ score }) => score > 0);

		return (relevantRoles.length > 0 ? relevantRoles : scoredRoles)
			.slice(0, MAX_MATCHED_ROLES)
			.map(({ role }) => role);
	}

	private buildSystemPrompt(roles: JobRoleDetailedResponse[]): string {
		return [
			"You answer applicant questions about Kainos job roles.",
			"Use only the job role JSON below. Never infer or invent missing facts.",
			"If the JSON does not answer the question, say that the current job role information does not include it.",
			"Keep the answer to one or two short sentences.",
			"Do not make a list or repeat location, status, vacancies, or closing dates because the interface displays those facts separately.",
			`Job roles: ${JSON.stringify(roles)}`,
		].join("\n");
	}
}