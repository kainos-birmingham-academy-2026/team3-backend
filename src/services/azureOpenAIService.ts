import {
	DefaultAzureCredential,
	getBearerTokenProvider,
} from "@azure/identity";
import { AzureOpenAI } from "openai";

const AZURE_OPENAI_SCOPE = "https://cognitiveservices.azure.com/.default";
const MAX_OUTPUT_TOKENS = 250;

export class AzureOpenAIService {
	private readonly client: AzureOpenAI;
	private readonly deployment: string;

	constructor() {
		const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
		const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;

		if (!endpoint || !deployment) {
			throw new Error("Azure OpenAI configuration is missing");
		}

		this.deployment = deployment;
		this.client = new AzureOpenAI({
			endpoint,
			apiVersion: process.env.AZURE_OPENAI_API_VERSION ?? "2025-04-01-preview",
			azureADTokenProvider: getBearerTokenProvider(
				new DefaultAzureCredential(),
				AZURE_OPENAI_SCOPE,
			),
		});
	}

	async answer(systemPrompt: string, question: string): Promise<string> {
		const response = await this.client.responses.create({
			model: this.deployment,
			instructions: systemPrompt,
			input: question,
			reasoning: { effort: "minimal" },
			max_output_tokens: MAX_OUTPUT_TOKENS,
			store: false,
		});

		return response.output_text.trim();
	}
}
