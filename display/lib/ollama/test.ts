// Test file to verify streaming works
import { streamAIResponse } from "./index";

export const testStreaming = async () => {
  console.log("Testing streaming...");

  let fullResponse = "";

  await streamAIResponse(
    "Hello, how are you?",
    (chunk) => {
      fullResponse += chunk;
      console.log("Received chunk:", chunk);
    },
    (error) => {
      console.error("Error:", error);
    },
    () => {
      console.log("Streaming completed. Full response:", fullResponse);
    }
  );
};
