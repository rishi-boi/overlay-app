"use server";
import ollama from "ollama";
export const aiResponse = async (message: string) => {
  try {
    const response = await ollama.chat({
      model: "llama3.2:1b",
      messages: [{ role: "user", content: message }],
    });
    return response;
  } catch (error) {
    console.error("Error fetching AI response:", error);
    throw error;
  }
};
