"use client";
import {
  ArrowRight,
  Check,
  Copy,
  SendHorizonal,
  Sparkle,
  WandSparkles,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { motion, useAnimation, useDragControls } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import { Checkbox } from "./ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import OpenAI from "openai";

import { z } from "zod";
import { aiResponse } from "@/lib/ollama";

const formSchema = z.object({
  text: z.string().min(1, "Please enter a message"),
  isWeb: z.boolean(),
});

interface ChatMessage {
  type: "user" | "ai" | "thinking";
  response: string;
}

type Conversation = ChatMessage[];
// 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
const ResponseCard = () => {
  const [index, setIndex] = useState(0);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isThinking, setIsThinking] = useState(false);

  // Ensure index stays within bounds
  useEffect(() => {
    if (conversations.length > 0 && index >= conversations.length) {
      setIndex(conversations.length - 1);
    } else if (conversations.length === 0) {
      setIndex(0);
    }
  }, [conversations.length, index]);

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
      isWeb: false,
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!values.text.trim()) return;
    // Create new conversation with user message
    const userMessage: ChatMessage = {
      type: "user",
      response: values.text,
    };
    const newConversation: Conversation = [userMessage];
    setConversations((prev) => {
      const updated = [...prev, newConversation];
      // Set index to the last conversation (newly added)
      setIndex(updated.length - 1);
      return updated;
    });
    // Clear the input
    form.reset({ text: "", isWeb: values.isWeb });
    // Show thinking state
    setIsThinking(true);
    const thinkingMessage: ChatMessage = {
      type: "thinking",
      response: "Thinking...",
    };
    // Add thinking message to the latest conversation
    setConversations((prev) => {
      const updated = [...prev];
      const lastIndex = updated.length - 1;
      updated[lastIndex] = [...updated[lastIndex], thinkingMessage];
      return updated;
    });
    try {
      const response = await aiResponse(values.text);
      // Remove thinking message and add AI response
      setConversations((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        const withoutThinking = updated[lastIndex].filter(
          (msg) => msg.type !== "thinking"
        );
        updated[lastIndex] = [
          ...withoutThinking,
          {
            type: "ai",
            response:
              response?.message?.content ||
              "Sorry, I couldn't generate a response.",
          },
        ];
        return updated;
      });
    } catch (error) {
      console.error("Error fetching AI response:", error);
      // Remove thinking message and add error response
      setConversations((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        const withoutThinking = updated[lastIndex].filter(
          (msg) => msg.type !== "thinking"
        );
        updated[lastIndex] = [
          ...withoutThinking,
          {
            type: "ai",
            response: "Sorry, there was an error processing your request.",
          },
        ];
        return updated;
      });
    } finally {
      setIsThinking(false);
    }
    form.setFocus("text");
  }
  return (
    <motion.div
      initial={{ scale: 0.6, y: -20, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      className="box w-lg px-3"
    >
      {/* TOP COMMANDS */}
      {conversations.length > 0 && (
        <div className="w-full flex justify-between items-center gap-2 p-2">
          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger>
                <button
                  onClick={() => setIndex(Math.max(0, index - 1))}
                  disabled={index === 0}
                  className="p-1 rounded hover:bg-gray-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="size-3 text-gray-400" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="tooltip">
                Previous conversation
              </TooltipContent>
            </Tooltip>

            <span className="text-xs text-gray-400">
              {index + 1} / {conversations.length}
            </span>

            <Tooltip>
              <TooltipTrigger>
                <button
                  onClick={() =>
                    setIndex(Math.min(conversations.length - 1, index + 1))
                  }
                  disabled={index === conversations.length - 1}
                  className="p-1 rounded hover:bg-gray-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="size-3 text-gray-400" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="tooltip">
                Next conversation
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger>
                <Copy className="size-3 cursor-pointer text-gray-400" />
              </TooltipTrigger>
              <TooltipContent className="tooltip">copy</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <XCircle className="size-3 cursor-pointer text-gray-400" />
              </TooltipTrigger>
              <TooltipContent className="tooltip">close</TooltipContent>
            </Tooltip>
          </div>
        </div>
      )}
      {/* CHAT */}
      <div className="max-h-80 overflow-y-auto">
        <div className="mb-4">
          {conversations.length > 0 &&
            conversations[index] &&
            conversations[index].map((message, messageIndex) => (
              <motion.div
                key={messageIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col w-full mb-3 ${
                  message.type === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={cn(
                    "text-gray-300 text-sm max-w-[80%]",
                    message.type === "user" &&
                      "bg-primary/20 py-2 px-3 rounded-xl text-xs",
                    message.type === "thinking" &&
                      "bg-gray-600/20 py-2 px-3 rounded-xl text-xs flex items-center gap-2"
                  )}
                >
                  {message.type === "ai" && (
                    <h3 className="text-xs mb-2 flex items-center gap-1 font-bold text-white">
                      <WandSparkles className="size-3" />
                      AI Response
                    </h3>
                  )}

                  {message.type === "thinking" && (
                    <div className="flex items-center gap-2">
                      <Loader2 className="size-3 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  )}

                  {message.type !== "thinking" && message.response}

                  {message.type === "ai" && (
                    <Tooltip>
                      <TooltipTrigger>
                        <button className="flex mt-2 text-xs font-bold items-center gap-1 bg-gray-400/40 rounded-xl py-1 px-2 hover:bg-gray-400/60 transition-colors">
                          Show in detail{" "}
                          <ArrowRight className="size-3 font-bold" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="tooltip" side="bottom">
                        ctrl + &quot;
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </motion.div>
            ))}
        </div>
      </div>
      {/* INPUT */}
      <div
        className={cn(
          "text-xs flex justify-between items-center py-2 mt-2 text-gray-400",
          conversations.length > 0 && "border-t"
        )}
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex justify-between items-center w-full gap-1"
          >
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <input
                      autoComplete="off"
                      className="border-none outline-none bg-transparent"
                      placeholder="Ask Anything..."
                      disabled={isThinking}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-2">
              <FormField
                control={form.control}
                name="isWeb"
                render={({ field }) => (
                  <FormItem className="flex items-center">
                    <FormControl>
                      <Checkbox
                        disabled={isThinking}
                        onCheckedChange={() => field.onChange(!field.value)}
                      />
                    </FormControl>
                    <FormLabel className="text-xs text-nowrap">
                      web search
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Tooltip>
                <TooltipTrigger>
                  <button
                    type="submit"
                    disabled={isThinking}
                    className="bg-primary/30 py-1 px-2 rounded-md text-white hover:bg-primary/80 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isThinking ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      "Submit"
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="tooltip">
                  enter
                </TooltipContent>
              </Tooltip>
            </div>
          </form>
        </Form>
      </div>
    </motion.div>
  );
};

export default ResponseCard;
