"use client";
import { responseCardActions } from "@/constants";
import React, { useMemo, useState } from "react";
import { Tooltip, TooltipTrigger } from "../ui/tooltip";
import { TooltipContent } from "@radix-ui/react-tooltip";
import { UIMessage, useChat } from "@ai-sdk/react";
import { ChevronLeft, ChevronRight, WandSparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHotkeys } from "react-hotkeys-hook";
import { SHORTCUTS } from "@/constants/shortcuts";
import { motion } from "framer-motion";

type Conversation = {
  user: UIMessage;
  response: UIMessage | null;
};

type MessagePart = {
  type: string;
  text?: string;
};

const ResponseCard = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState("");
  const { messages, sendMessage } = useChat();

  // Compute conversation pairs only when messages change
  const conversations: Conversation[] = useMemo(() => {
    const pairs: Conversation[] = [];
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (msg.role === "user") {
        const response =
          messages[i + 1]?.role === "assistant" ? messages[i + 1] : null;
        pairs.push({ user: msg, response });
      }
    }
    return pairs;
  }, [messages]);

  // Always show the latest conversation
  const currentConversation = conversations[currentIndex] ?? null;

  const prev = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));
  const next = () =>
    setCurrentIndex((prev) => Math.min(prev + 1, conversations.length - 1));

  useHotkeys(SHORTCUTS.PREVIOUS_CHAT, prev);
  useHotkeys(SHORTCUTS.NEXT_CHAT, next);

  return (
    <motion.div
      initial={{ opacity: 0, translateY: "20px", translateZ: "20px" }}
      animate={{ opacity: 1, translateY: "0px", translateZ: "0px" }}
      exit={{ opacity: 0, translateY: "20px", translateZ: "20px" }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="card-box mt-2 min-w-lg p-2 flex-col"
    >
      {/* Response Actions */}
      {currentConversation && (
        <>
          <div className="flex gap-2 justify-between w-full">
            <div className="flex gap-2 items-center">
              <ChevronLeft
                onClick={prev}
                className={cn(
                  "size-3",
                  currentIndex <= 0
                    ? "cursor-not-allowed text-gray-200"
                    : "cursor-pointer text-white"
                )}
              />
              <span className="text-gray-200 text-sm">
                {currentIndex + 1}/{conversations.length}
              </span>
              <ChevronRight
                onClick={next}
                className={cn(
                  "size-3",
                  currentIndex >= conversations.length - 1
                    ? "cursor-not-allowed text-gray-200"
                    : "cursor-pointer text-white"
                )}
              />
            </div>
            <div className="flex gap-2">
              {responseCardActions.map((action, index) => (
                <Tooltip key={index}>
                  <TooltipTrigger>
                    <action.icon className="size-3" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{action.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
          {/* Conversations */}
          {/* - User */}
          <div className="mt-2">
            <div className="flex justify-end">
              {currentConversation.user.parts.map((p: MessagePart, i: number) =>
                p.type === "text" ? (
                  <div
                    key={`q-${i}`}
                    className="whitespace-pre-wrap font-semibold text-xs bg-primary/70 py-1 px-3 rounded-full"
                  >
                    {p.text}
                  </div>
                ) : null
              )}
            </div>
            {/* - Assistant */}
            <div>
              <strong className="text-sm flex items-center gap-1">
                AI Response <WandSparkles className="size-3" />
              </strong>
              {currentConversation.response ? (
                currentConversation.response.parts.map(
                  (p: MessagePart, i: number) =>
                    p.type === "text" ? (
                      <div
                        key={`a-${i}`}
                        className="max-w-lg text-sm text-white"
                      >
                        {p.text}
                      </div>
                    ) : null
                )
              ) : (
                <div className="text-white text-sm">Thinking...</div>
              )}
            </div>
          </div>
        </>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!input.trim()) return;
          sendMessage({
            role: "user",
            parts: [{ type: "text", text: input }],
          });
          setInput("");
          setCurrentIndex(conversations.length); // auto-jump to latest
        }}
        className={cn(
          " border-gray-400 flex items-center justify-between",
          currentConversation ? "border-t mt-2 pt-2" : ""
        )}
      >
        <input
          className="text-sm w-full border-none outline-none font-semibold text-white"
          autoComplete="off"
          value={input}
          placeholder="Ask something..."
          onChange={(e) => setInput(e.target.value)}
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="submit"
              className="bg-primary/70 py-1 text-sm px-3 rounded-md"
            >
              Submit
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>enter</p>
          </TooltipContent>
        </Tooltip>
      </form>
    </motion.div>
  );
};

export default ResponseCard;
