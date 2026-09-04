import {
	DefaultAzureCredential,
	getBearerTokenProvider,
} from "@azure/identity";
import { AzureOpenAI } from "openai";

const AZURE_OPENAI_SCOPE = "https://cognitiveservices.azure.com/.default";
const MAX_OUTPUT_TOKENS = 250;

export class AzureOpenAIService {
	private client?: AzureOpenAI;
	private deployment?: string;

	private getConfiguration(): {
		client: AzureOpenAI;
		deployment: string;
	} {
		if (this.client && this.deployment) {
			return { client: this.client, deployment: this.deployment };
		}

		const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
		const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;

		if (!endpoint || !deployment) {
			throw new Error("Azure OpenAI configuration is missing");
		}

		this.client = new AzureOpenAI({
			endpoint,
			apiVersion: process.env.AZURE_OPENAI_API_VERSION ?? "2025-04-01-preview",
			azureADTokenProvider: getBearerTokenProvider(
				new DefaultAzureCredential(),
				AZURE_OPENAI_SCOPE,
			),
		});
		this.deployment = deployment;

		return { client: this.client, deployment };
	}

	async answer(systemPrompt: string, question: string): Promise<string> {
		const { client, deployment } = this.getConfiguration();
		const response = await client.responses.create({
			model: deployment,
			instructions: systemPrompt,
			input: question,
			reasoning: { effort: "minimal" },
			max_output_tokens: MAX_OUTPUT_TOKENS,
			store: false,
		});

		return response.output_text.trim();
	}
}
