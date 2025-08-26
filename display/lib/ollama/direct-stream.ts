// Alternative approach - Direct streaming server action
"use server";
import ollama from "ollama";

export async function streamDirectly(message: string) {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        const stream = await ollama.chat({
          model: "llama3.2:1b",
          messages: [{ role: "user", content: message }],
          stream: true,
        });

        for await (const chunk of stream) {
          if (chunk.message?.content) {
            controller.enqueue(encoder.encode(chunk.message.content));
          }
        }

        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}
