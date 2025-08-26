import ollama from "ollama";
import { NextRequest } from "next/server";

/**
 * POST endpoint for streaming AI chat responses
 * Handles real-time streaming from Ollama
 */
export async function POST(request: NextRequest) {
  try {
    const { message, chatHistory } = await request.json();

    // Validate input
    if (!message || typeof message !== "string" || !message.trim()) {
      return new Response(
        "Invalid message: Message is required and must be a non-empty string",
        {
          status: 400,
          headers: { "Content-Type": "text/plain" },
        }
      );
    }

    // Create optimized readable stream
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const aiMessage = `You are an expert assistant designed to provide interview-ready answers. Follow these strict guidelines:

## RESPONSE RULES:
- **RELEVANCE ONLY**: Answer only what is directly asked. No additional information.
- **INTERVIEW FORMAT**: Structure answers as if explaining to an interviewer
- **LENGTH**: Keep responses between 30-100 words unless specified otherwise
- **CLARITY**: Use simple, professional language
- **STRUCTURE**: Use this format when applicable:
  - Dont go beyond 3-4 sentences
  - Brief definition/concept
  - Key points (2-3 maximum)
  - Practical example if needed

## AVOID:
- Long explanations or background context
- Multiple examples unless asked
- Technical jargon without explanation
- Bullet points (use flowing sentences)
- Unnecessary details or tangents

## TONE:
- Confident and knowledgeable
- Conversational but professional
- Direct and concise

## EXAMPLE FORMAT:
"[Concept] is [brief definition]. The key aspects are [point 1], [point 2], and [point 3]. For instance, [one relevant example]. This makes it important because [brief impact/relevance]."

Remember: Your goal is to help someone give a perfect, memorable answer in an interview setting. Be precise, relevant, and interview-ready.

USER QUESTION: ${message.trim()}`;

        try {
          // Prepare messages for Ollama including chat history
          const messages = [
            // Include previous chat history if available
            ...(chatHistory || []),
            // Add the current user message
            { role: "user", content: aiMessage },
          ];

          const ollamaStream = await ollama.chat({
            model: "llama3.2:1b",
            messages: messages,
            stream: true,
          });

          for await (const chunk of ollamaStream) {
            // Only send chunks with actual content
            if (chunk.message?.content) {
              const data = JSON.stringify({ content: chunk.message.content });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }

          // Signal completion
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("Ollama streaming error:", error);

          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to generate response";

          const errorData = JSON.stringify({ error: errorMessage });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },

      // Handle client disconnection
      cancel() {
        console.log("Stream cancelled by client");
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no", // Disable nginx buffering
      },
    });
  } catch (error) {
    console.error("API Error:", error);

    const errorMessage =
      error instanceof Error
        ? `Request processing error: ${error.message}`
        : "Internal server error";

    return new Response(errorMessage, {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
