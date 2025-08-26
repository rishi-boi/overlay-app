import { ConversationContext } from "../ai/contextManager";

/**
 * Client-side streaming function for AI responses
 * Handles real-time streaming from the Ollama API
 */
export const streamAIResponse = async (
  message: string,
  context?:
    | ConversationContext
    | { role: "user" | "assistant"; content: string }[], // Can be optimized context or chat history
  onChunk?: (chunk: string) => void,
  onError?: (error: string) => void,
  onComplete?: () => void
): Promise<void> => {
  if (!message.trim()) {
    onError?.("Message cannot be empty");
    return;
  }

  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;

  try {
    // Prepare messages for API
    let messages;

    // Type check for ConversationContext
    if (context && !Array.isArray(context)) {
      // It's a ConversationContext object
      if (context.summary) {
        // Use summarized context
        messages = [
          { role: "system", content: `Context: ${context.summary}` },
          ...context.recentMessages,
          { role: "user", content: message },
        ];
      } else {
        // Use recent messages only
        messages = [
          ...context.recentMessages,
          { role: "user", content: message },
        ];
      }
    } else if (Array.isArray(context)) {
      // Fallback to full history (backwards compatibility)
      messages = [...context, { role: "user", content: message }];
    } else {
      // No context
      messages = [{ role: "user", content: message }];
    }

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message.trim(),
        chatHistory: messages || [],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP ${response.status}: ${errorText || response.statusText}`
      );
    }

    reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Failed to initialize stream reader");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        onComplete?.();
        break;
      }

      // Accumulate chunks in buffer to handle partial data
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");

      // Keep the last potentially incomplete line in buffer
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6).trim();

          if (data === "[DONE]") {
            onComplete?.();
            return;
          }

          if (data) {
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                onChunk?.(parsed.content);
              } else if (parsed.error) {
                onError?.(parsed.error);
                return;
              }
            } catch {
              // Skip invalid JSON lines silently
              console.warn("Failed to parse streaming data:", data);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Streaming error:", error);
    onError?.(
      error instanceof Error ? error.message : "An unexpected error occurred"
    );
  } finally {
    // Clean up reader
    if (reader) {
      try {
        reader.releaseLock();
      } catch {
        // Reader might already be released
      }
    }
  }
};
