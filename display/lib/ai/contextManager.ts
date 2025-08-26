// lib/ai/contextManager.ts
"use client";

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

export interface ConversationContext {
  summary?: string;
  recentMessages: Message[];
  totalMessages: number;
}

export class ContextManager {
  private maxRecentMessages = 5; // Only keep last 5 messages
  private summarizeThreshold = 10; // Summarize when > 10 messages

  constructor(private maxMessages = 5, private summaryThreshold = 10) {
    this.maxRecentMessages = maxMessages;
    this.summarizeThreshold = summaryThreshold;
  }

  // Get optimized context for AI
  getContext(allMessages: Message[]): ConversationContext {
    if (allMessages.length <= this.maxRecentMessages) {
      // Few messages - send all
      return {
        recentMessages: allMessages,
        totalMessages: allMessages.length,
      };
    }

    if (allMessages.length <= this.summarizeThreshold) {
      // Medium conversation - use sliding window
      return {
        recentMessages: allMessages.slice(-this.maxRecentMessages),
        totalMessages: allMessages.length,
      };
    }

    // Long conversation - use summary + recent messages
    const recentMessages = allMessages.slice(-this.maxRecentMessages);
    const olderMessages = allMessages.slice(0, -this.maxRecentMessages);

    return {
      summary: this.createSummary(olderMessages),
      recentMessages,
      totalMessages: allMessages.length,
    };
  }

  private createSummary(messages: Message[]): string {
    // Simple summarization - you can enhance this
    const topics = new Set<string>();

    messages.forEach((msg) => {
      if (msg.role === "user") {
        // Extract keywords/topics from user messages
        const words = msg.content.toLowerCase().split(" ");
        words.forEach((word) => {
          if (word.length > 5) topics.add(word);
        });
      }
    });

    return `Previous conversation covered: ${Array.from(topics)
      .slice(0, 5)
      .join(", ")}. ${messages.length} messages exchanged.`;
  }

  // Alternative: Smart context selection
  getSmartContext(allMessages: Message[], currentMessage: string): Message[] {
    if (allMessages.length <= this.maxRecentMessages) {
      return allMessages;
    }

    // Get recent messages
    const recent = allMessages.slice(-5);

    // Find relevant older messages based on current message
    const relevant = this.findRelevantMessages(
      allMessages.slice(0, -5),
      currentMessage
    );

    return [...relevant, ...recent];
  }

  private findRelevantMessages(
    messages: Message[],
    currentMessage: string
  ): Message[] {
    const currentWords = currentMessage.toLowerCase().split(" ");
    const scored = messages.map((msg) => ({
      message: msg,
      score: this.calculateRelevance(msg.content, currentWords),
    }));

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 3) // Top 3 relevant messages
      .map((item) => item.message);
  }

  private calculateRelevance(
    messageContent: string,
    currentWords: string[]
  ): number {
    const messageWords = messageContent.toLowerCase().split(" ");
    const commonWords = currentWords.filter(
      (word) => messageWords.includes(word) && word.length > 3
    );
    return commonWords.length / currentWords.length;
  }
}
