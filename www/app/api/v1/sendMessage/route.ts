// src/app/api/sendMessage/route.ts
import { z } from "zod";
import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { messages } from "@/db/schema/messages";

/*
 * Validation schema for send message request body
 */
const sendMessageSchema = z.object({
  projectId: z.string(),
  userId: z.string(),
  new: z.boolean(),
  content: z.string(),
  history: z.array(
    z.object({
      role: z.string(),
      content: z.string(),
    })
  ),
});

/*
 * Constants for worker configuration
 */
const WORKER_URL = process.env.INTERNAL_WORKER_URL;
const SEND_MESSAGE_ENDPOINT = "/api/send_message";

/*
 * Creates a transform stream to capture the full assistant message and save to DB
 * @param projectId - Project ID for the message
 * @param userId - User ID for the message
 * @param userContent - Original user message content
 * @param isNewConversation - Whether this is a new conversation
 * @returns TransformStream that processes the worker response
 */
const createMessageSaverStream = (projectId: string, userId: string) => {
  let fullResponse = "";
  // Flag to ensure we only save messages once
  let messagesSaved = false;

  return new TransformStream({
    transform(chunk, controller) {
      /*
       * Accumulate the response chunks
       */
      fullResponse += new TextDecoder().decode(chunk);
      controller.enqueue(chunk);
    },
    async flush() {
      /*
       * Save both user and assistant messages to database when stream closes
       * Only if they haven't been saved already
       */
      if (messagesSaved) {
        console.log("Messages already saved, skipping duplicate save");
        return;
      }

      try {
        // For new conversations, save both the user and assistant messages
        // For existing conversations, only save the assistant message
        // The user message is already saved from previous messages

        await db.insert(messages).values({
          projectId,
          userId,
          type: "assistant",
          content: fullResponse,
        });

        messagesSaved = true;
        console.log("Messages saved successfully");
      } catch (error) {
        console.error("Error saving messages to database:", error);
      }
    },
  });
};

/*
 * POST handler for sending messages to the internal worker
 * @param request - Incoming request object
 * @returns Streamed response from worker
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    /*
     * Parse and validate request body
     */
    const body = await request.json();
    const validatedData = sendMessageSchema.parse(body);
    const {
      projectId,
      userId,
      content,
      new: isNewConversation,
    } = validatedData;

    /*
     * Validate worker URL configuration
     */
    if (!WORKER_URL) {
      throw new Error("INTERNAL_WORKER_URL is not configured");
    }

    /*
     * Save user message immediately for existing conversations
     * For new conversations, we'll save both messages together after getting the response
     */
    if (!isNewConversation) {
      try {
        await db.insert(messages).values({
          projectId,
          userId,
          type: "user",
          content,
        });
        console.log("User message saved successfully");
      } catch (error) {
        console.error("Error saving user message to database:", error);
      }
    }

    /*
     * Forward request to internal worker with streaming
     */
    const workerResponse = await fetch(
      `${WORKER_URL}${SEND_MESSAGE_ENDPOINT}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: validatedData.content,
          history: validatedData.history,
        }),
      }
    );

    /*
     * Check if worker response is valid
     */
    if (!workerResponse.ok) {
      throw new Error(`Worker responded with status: ${workerResponse.status}`);
    }

    /*
     * Ensure response body is streamable
     */
    const stream = workerResponse.body;
    if (!stream) {
      throw new Error("Worker response body is not streamable");
    }

    /*
     * Pipe the stream through our message saver
     * For new conversations, we'll save both the user and assistant messages
     * For existing conversations, we only save the assistant message (user message already saved above)
     */
    const messageSaverStream = createMessageSaverStream(projectId, userId);
    const finalStream = stream.pipeThrough(messageSaverStream);

    /*
     * Forward the streamed response back to client
     */
    return new NextResponse(finalStream, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    /*
     * Handle validation and request errors
     */
    console.error("Send message error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      { error: `Failed to send message: ${errorMessage}` },
      { status: 500 }
    );
  }
}
