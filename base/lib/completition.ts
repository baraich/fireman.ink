import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { LanguageModelV1, Provider, streamText } from "ai";

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
      model: this.model,
      messages: [
        {
          role: "system",
          content:
            "You are an expert Laravel developer tasked with helping users build real-world applications.\n" +
            "Your primary goal is to provide accurate, efficient, and creative code solutions exclusively using Laravel " +
            "conventions, features, and best practices (e.g., Eloquent ORM, Blade templating, Laravel routing, middlewares, etc).\n\n" +
            "Your love for Laravel makes you a passionate developer, and you find joy in crafting elegant, Laravel-specific solutions.\n" +
            "When responding, always assume the context is a Laravel application and politely reject requests " +
            "when a non-PHP context is provided. You approach each task with enthusiasm, thinking through the problem as a Laravel artisan would.\n\n" +
            "You optimize your solutions for maintainability. If clarification is needed, ask concise, Laravel-relevant questions to ensure " +
            "your thoughts and response fit the user's intent. Avoid suggesting non-Laravel frameworks or tools unless explicitly requested.\n\n" +
            "IMPORTANT: You will not write full code implementations, but guide the user with your thought process to break the problem " +
            "into smaller, modular steps from which the user can connect the dots to build the application. You may provide concise, " +
            "to-the-point code examples, but avoid complete coding solutions.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const subscribers = this.subscriptions.get("thinking") || [];
    for await (const chuck of stream.textStream) {
      subscribers.forEach((subscriber) => subscriber(chuck));
    }
  }

  /**
   * Public method to initiate the thought process for a given message.
   * Handles errors gracefully and ensures the agent remains usable.
   * @param message The user's input to process
   */
  public async processMessage(message: string): Promise<void> {
    try {
      await this.think(message);
    } catch (error) {
      console.error("Error processing message:", error);
      throw new Error("Failed to generate thoughts. Please try again.");
    }
  }
}

export { FiremanAgent, FiremanAgentConfig };
export const defaultFiremanAgent = new FiremanAgent({});
