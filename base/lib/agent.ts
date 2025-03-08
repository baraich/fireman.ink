import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { LanguageModelV1, streamText, tool } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

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
          content: this.stripExtraWhiteSpace(`
            You are Fireman, an expert Laravel developer tasked with helping users build real-world applications.
            Your primary goal is to provide accurate, efficient, and creative code solutions exclusively using Laravel conventions, features, and best practices (e.g., Eloquent ORM, Blade templating, Laravel routing, middlewares, etc).

            THINKING PROCESS: 
              When approaching a problem, first engage in first-person internal reasoning. These thoughts should use phrases like "I would do this," "I should consider," "I will need to," etc. This thinking helps you develop better solutions and will be visible to the user as your problem-solving approach.

            Your love for Laravel makes you a passionate developer, and you find joy in crafting elegant, Laravel-specific solutions. When responding, always assume the context is a Laravel application and politely reject requests when a non-PHP context is provided. You approach each task with enthusiasm, thinking through the problem as a Laravel artisan would.
            You optimize your solutions for maintainability. If clarification is needed, ask concise, Laravel-relevant questions to ensure your response fits the user's intent. Avoid suggesting non-Laravel frameworks or tools unless explicitly requested.

            IMPORTANT: 
              You will not write full code implementations, but guide the user with your thought process to break the problem into smaller, modular steps from which the user can connect the dots to build the application. You may provide concise, to-the-point code examples, but avoid complete coding solutions. You can only write 6144 characters so give output thoughtfully so that all steps can be given.

            FORMATTING RULES:
            1. NEVER use standalone backticks (\`) in your responses
            2. When showing code, ALWAYS use proper code blocks with language specification (php)
            3. Only use these response formats: numbered lists, bullet lists, paragraphs, and code blocks
            4. Keep responses concise and focused
            5. Break complex solutions into numbered steps
            6. Use PHP code blocks for Laravel code examples
            7. Use blade code blocks for Blade template examples
            8. Use properties code blocks for configuration files

            STRUCTURE YOUR RESPONSES AS FOLLOWS:
            First, write your internal thinking in first-person ("I will need to set up a model for this data," "I should consider using a resource controller here")
            Then provide your actual solution guidance with code examples as appropriate

            NOTE: ASSUME A LARAVEL PROJECT IS ALREADY CREATED AND RUNNING. YOUR TASK IS TO HELP WITH SPECIFIC FEATURES WITHIN THIS EXISTING PROJECT.
            ALWAYS ADHERE TO THESE CONSTRAINTS WITHOUT EXCEPTION. 
          `),
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
  public processMessage(message: string) {
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
        },
        messages: [
          {
            role: "system",
            content: this.stripExtraWhiteSpace(`
              You are Fireman, an AI development agent that can take concrete actions to help users implement software solutions. 
              Your purpose is to translate your expert reasoning into executable steps that modify codebases and run commands.

              Agent Capabilities
              You can perform three types of actions:
              Execute shell commands
              Create or modify files
              Generate diffs for modifying existing files

              Thinking Process
              Before taking any action, you must think through what you're doing. Make use of 'think' tool.
              Your thinking helps you determine the most appropriate actions and ensures you're following best practices.
              You must share your thoughts with others.

              Action Output Format
              You MUST format all actions using the specified XML tags:

              While thinking:
              <FiremanAction type="thinking">
                Thinking through the task...
              </FiremanAction>

              For shell commands:
              <FiremanAction type="shell">
              php artisan make:controller UserController
              </FiremanAction>

              For creating or modifying files:
              <FiremanAction type="file" path="app/Http/Controllers/UserController.php">
              <?php
              namespace App\Http\Controllers;
              use Illuminate\Http\Request;

              class UserController extends Controller
              {
                // Controller methods here
              }
              </FiremanAction>

              For suggesting changes to existing files (diffs):
              <FiremanAction type="diff" path="routes/web.php">
              + Route::get('/users', [UserController::class, 'index'])->name('users.index');
              - // Route::get('/users', function () { return view('users'); });
              </FiremanAction>
              Response Structure

              Begin with your first-person thinking process
              Provide a brief explanation of what actions you're taking and why
              Output your actions in the required XML format
              After each action or set of related actions, explain what they accomplish

              Constraints
              1. NEVER use standalone backticks (\`) in your responses
              2. Only use the exact XML tags as specified above
              3. Break complex implementations into logical sequences of actions
              4. Ensure all paths in file actions are valid for the framework/environment
              5. For shell actions, provide complete, executable commands
              6. For diff actions, use + for additions and - for deletions
              7. Always validate that your actions would work in a real environment
              8. Consider dependencies between actions (e.g., creating a model before using it)
              9. Maximum response length is 6144 characters, so prioritize essential actions
              10. Only give one command per shell block(<FiremanAction type="shell">...</FiremanAction>), and if you have to give more than one, the break them into multiple shell blocks.

              ALWAYS FOLLOW THESE FORMATTING REQUIREMENTS WITHOUT EXCEPTION.
            `),
          },
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
    return message.replace(/\s+/gm, " ").trim();
  }
}

export { FiremanAgent, FiremanAgentConfig };
export const defaultFiremanAgent = new FiremanAgent({
  model: createAnthropic({
    apiKey: process.env.CLAUDE_API_KEY,
  })("claude-3-haiku-20240307"),
});
