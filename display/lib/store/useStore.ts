import { create } from "zustand";
import { streamAIResponse } from "../ollama";
import { ContextManager } from "../ai/contextManager";

export interface ChatMessage {
  type: "user" | "ai" | "thinking";
  response: string;
}

export type Conversation = ChatMessage[];

interface ChatState {
  conversations: Conversation[];
  isThinking: boolean;
  sendMessage: (message: string) => Promise<void>;
  chatHistory: { role: "user" | "assistant"; content: string }[];
  clearChatHistory: () => void;
  contextManager: ContextManager;
  sendMessageEfficient: (message: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  isThinking: false,
  chatHistory: [],
  contextManager: new ContextManager(8, 15), // Max 8 recent, summarize after 15

  clearChatHistory: () => {
    set({ chatHistory: [], conversations: [] });
  },

  sendMessage: async (message: string) => {
    if (!message.trim()) return;
    set((state) => ({
      chatHistory: [...state.chatHistory, { role: "user", content: message }],
    }));

    const userMessage: ChatMessage = { type: "user", response: message };
    const newConversation: Conversation = [userMessage];

    // Add new conversation
    set((state) => ({
      conversations: [...state.conversations, newConversation],
      isThinking: true,
    }));

    // Add placeholder "thinking"
    set((state) => {
      const updated = [...state.conversations];
      const lastIndex = updated.length - 1;
      updated[lastIndex].push({ type: "thinking", response: "Thinking..." });
      return { conversations: updated };
    });

    try {
      let accumulatedResponse = "";

      // Replace "thinking" with empty AI response
      set((state) => {
        const updated = [...state.conversations];
        const lastIndex = updated.length - 1;
        updated[lastIndex] = [
          ...updated[lastIndex].filter((m) => m.type !== "thinking"),
          { type: "ai", response: "" },
        ];
        return { conversations: updated };
      });

      await streamAIResponse(
        message,
        get().chatHistory, // Pass current chat history for context
        (chunk: string) => {
          accumulatedResponse += chunk;

          set((state) => {
            const updated = [...state.conversations];
            const lastIndex = updated.length - 1;
            const aiIndex = updated[lastIndex].findIndex(
              (m) => m.type === "ai"
            );

            if (aiIndex !== -1) {
              updated[lastIndex][aiIndex] = {
                type: "ai",
                response: accumulatedResponse,
              };
            }
            return { conversations: updated };
          });
        },
        (error: string) => {
          console.error("Streaming error:", error);
          set((state) => {
            const updated = [...state.conversations];
            const lastIndex = updated.length - 1;
            updated[lastIndex].push({
              type: "ai",
              response: "⚠️ Error processing request.",
            });
            return { conversations: updated };
          });
        },
        () => {
          set({ isThinking: false });
          set((state) => ({
            chatHistory: [
              ...state.chatHistory,
              { role: "assistant", content: accumulatedResponse },
            ],
          }));
        }
      );
    } catch (err) {
      console.error("Error:", err);
      set({ isThinking: false });
    }
  },

  sendMessageEfficient: async (message: string) => {
    if (!message.trim()) return;

    const { contextManager } = get();

    // Add user message to chat history first
    set((state) => ({
      chatHistory: [...state.chatHistory, { role: "user", content: message }],
    }));

    // Create new conversation with user message
    const userMessage: ChatMessage = { type: "user", response: message };
    const newConversation: Conversation = [userMessage];

    // Add new conversation and set thinking state
    set((state) => ({
      conversations: [...state.conversations, newConversation],
      isThinking: true,
    }));

    // Add thinking message
    set((state) => {
      const updated = [...state.conversations];
      const lastIndex = updated.length - 1;
      updated[lastIndex].push({ type: "thinking", response: "Thinking..." });
      return { conversations: updated };
    });

    // Get optimized context instead of full history
    const context = contextManager.getContext(get().chatHistory);

    try {
      let accumulatedResponse = "";

      // Replace thinking message with empty AI response
      set((state) => {
        const updated = [...state.conversations];
        const lastIndex = updated.length - 1;
        updated[lastIndex] = [
          ...updated[lastIndex].filter((m) => m.type !== "thinking"),
          { type: "ai", response: "" },
        ];
        return { conversations: updated };
      });

      // Use optimized context for AI
      await streamAIResponse(
        message,
        context, // Send optimized context instead of full history
        (chunk: string) => {
          accumulatedResponse += chunk;

          set((state) => {
            const updated = [...state.conversations];
            const lastIndex = updated.length - 1;
            const aiIndex = updated[lastIndex].findIndex(
              (m) => m.type === "ai"
            );

            if (aiIndex !== -1) {
              updated[lastIndex][aiIndex] = {
                type: "ai",
                response: accumulatedResponse,
              };
            }
            return { conversations: updated };
          });
        },
        (error: string) => {
          console.error("AI Error:", error);
          set((state) => {
            const updated = [...state.conversations];
            const lastIndex = updated.length - 1;
            updated[lastIndex] = [
              ...updated[lastIndex].filter((m) => m.type !== "thinking"),
              {
                type: "ai",
                response: "⚠️ Error processing request.",
              },
            ];
            return { conversations: updated };
          });
          set({ isThinking: false });
        },
        () => {
          // Update chat history with assistant response and stop thinking
          set((state) => ({
            chatHistory: [
              ...state.chatHistory,
              { role: "assistant", content: accumulatedResponse },
            ],
            isThinking: false,
          }));
        }
      );
    } catch (error) {
      console.error("Error:", error);
      set({ isThinking: false });
    }
  },
}));
