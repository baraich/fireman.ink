import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { LanguageModelV1, streamText, tool } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { readFileSync } from "fs";
import path from "path";
import { tools } from "./tools";

/**
 * Configuration interface for initializing the FiremanAgent.
 * Defines the structure for passing a custom model, with a fallback to a default if not provided.
 */
interface FiremanAgentConfig {
  /**
   * Optional custom AI model to use instead of the default Google Gemini model.
   * Must conform to the LanguageModelV1 interface from the 'ai' package.
   */
  model?: LanguageModelV1;
}

/**
 * FiremanAgent class escapulates the logic for interacting with the AI model,
 * providing a structured way to handle thought generation and completions.
 */
class FiremanAgent {
  private model: LanguageModelV1;
  private triggers = ["thinking"] as const;
  private subscriptions: Map<string, ((chunk: string) => void)[]> = new Map();

  /**
   * Constructor initializes the agent with a specific AI model.
   * This provides the flexibility to change models using configuration.
   * After setting the model, we initialize the subscription system.
   * @param configuration
   */
  constructor(configuration: FiremanAgentConfig) {
    this.model = configuration.model || this.initializeDefaultModel();
    this.initializeSubscriptionsBaseline();
  }

  /**
   * Initalizes the default Google Gemini model when no custom model is provided in the configuration.
   * This method escapulates the default model setup logic for better maintainability.
   * @returns A LanguageModelV1 instance configured with the Google Gemini API.
   * @throws Error if the GEMINI_API_KEY environment variable is not defined.
   */
  private initializeDefaultModel(): LanguageModelV1 {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error(
        "GEMINI_API_KEY environment variable is required for default model initialization."
      );
    }
    const geminiProvider = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
    return geminiProvider("gemini-2.0-flash-exp");
  }

  /**
   * Sets up the baselien subscription map for the agent's triggers.
   * We iterate over the predefined triggers (e.g., "thinking") and
   * initialize subscribers for each trigger.
   */
  private initializeSubscriptionsBaseline() {
    this.triggers.map((trigger) => {
      this.subscriptions.set(trigger, []);
    });
  }

  /**
   * Allows external components to subscribe to the specific triggers (e.g., "thinking"),
   * enabling real-time notifications immediately as the data changes.
   */
  public subscribe(
    trigger: (typeof this.triggers)[number],
    callback: (chunk: string) => void
  ): void {
    const subscriptions = this.subscriptions.get(trigger);
    if (subscriptions) {
      subscriptions.push(callback);
    }
  }

  /**
   * Generates a stream of thoughts based on the provided messsage.
   * This method is private as it's an itnernal helper for the completion process.
   */
  private async think(message: string) {
    const stream = streamText({
      maxTokens: 2048,
      model: this.model,
      messages: [
        {
          role: "system",
          content: readFileSync(path.join(__dirname, "thinking.prompt.file"), {
            encoding: "utf-8",
          }),
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    let contents = "";
    const subscribers = this.subscriptions.get("thinking") || [];
    for await (const chuck of stream.textStream) {
      contents += chuck;
      subscribers.forEach((subscriber) => subscriber(chuck));
    }

    return contents;
  }

  /**
   * Public method to initiate the thought process for a given message.
   * Handles errors gracefully and ensures the agent remains usable.
   * @param message The user's input to process
   */
  public processMessage(
    message: string,
    history: { role: "user" | "assistant"; content: string }[],
    projectId: string
  ) {
    try {
      return streamText({
        model: this.model,
        maxSteps: 3,
        tools: {
          think: tool({
            parameters: z.object({
              message: z.string().min(1),
            }),
            description: "Allows you to think about your given task.",
            execute: async ({ message }) => await this.think(message),
          }),
          ...tools,
        },
        messages: [
          {
            role: "system",
            content:
              readFileSync(path.join(__dirname, "agent.prompt.file"), {
                encoding: "utf-8",
              }) +
              " and your project Id is " +
              projectId,
          },
          ...history.slice(-4),
          {
            role: "user",
            content: message,
          },
        ],
      });
    } catch (error) {
      console.error("Error processing message:", error);
      throw new Error("Failed to generate thoughts. Please try again.");
    }
  }

  /**
   * Helper method to remove extra whitespace from the message.
   */
  stripExtraWhiteSpace(message: string): string {
    return message.trim();
  }
}

export { FiremanAgent, FiremanAgentConfig };
export const defaultFiremanAgent = new FiremanAgent({
  model: createAnthropic({
    apiKey: process.env.CLAUDE_API_KEY,
  })("claude-3-haiku-20240307"),
});
