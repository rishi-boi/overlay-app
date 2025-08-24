// Client-side streaming function
export const streamAIResponse = async (
  message: string,
  onChunk: (chunk: string) => void,
  onError?: (error: string) => void,
  onComplete?: () => void
) => {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No reader available");
    }

    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        onComplete?.();
        break;
      }

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6); // Remove 'data: ' prefix

          if (data === "[DONE]") {
            onComplete?.();
            return;
          }

          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              onChunk(parsed.content);
            } else if (parsed.error) {
              onError?.(parsed.error);
              return;
            }
          } catch {
            // Skip invalid JSON lines
            continue;
          }
        }
      }
    }
  } catch (error) {
    console.error("Streaming error:", error);
    onError?.(
      error instanceof Error ? error.message : "Unknown error occurred"
    );
  }
};
