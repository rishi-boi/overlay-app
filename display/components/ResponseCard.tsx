"use client";
import {
  ArrowRight,
  Copy,
  WandSparkles,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import { Checkbox } from "./ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import MarkdownRenderer from "./MarkdownRenderer";
// import { useAIChat } from "@/lib/hooks/useAIResponse";
import { useChatStore } from "@/lib/store/useStore";

const formSchema = z.object({
  text: z.string().min(1, "Please enter a message"),
  isWeb: z.boolean(),
});

const ResponseCard = () => {
  const [index, setIndex] = useState(0);
  const {
    conversations,
    isThinking,
    sendMessageEfficient, // Use the efficient method
    clearChatHistory,
  } = useChatStore();

  // Ensure index stays within bounds
  useEffect(() => {
    setIndex(conversations.length - 1);
    if (conversations.length > 0 && index >= conversations.length) {
      setIndex(conversations.length - 1);
    } else if (conversations.length === 0) {
      setIndex(0);
    }
  }, [conversations, index]);

  // Keyboard Shortcuts
  useEffect(() => {
    const keyDownHandler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key == "ArrowRight") {
        setIndex((prev) => Math.min(conversations.length - 1, prev + 1));
      } else if (e.ctrlKey && e.key == "ArrowLeft") {
        setIndex((prev) => Math.max(0, prev - 1));
      }
    };
    document.addEventListener("keydown", keyDownHandler);

    // clean up
    return () => {
      document.removeEventListener("keydown", keyDownHandler);
    };
  }, [conversations.length, index]);

  // Defining Form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
      isWeb: false,
    },
  });

  // Focus input on mount (default focus)
  useEffect(() => {
    form.setFocus("text");
  }, [form]);

  // Handling Form Submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    form.reset();
    const { text } = values;
    if (text) {
      setIndex(conversations.length);
      const res = await sendMessageEfficient(text); // Use efficient method
      console.log(res);
      form.setFocus("text");
    }
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
                <Trash2
                  className="size-3 cursor-pointer text-gray-400 hover:text-red-400 transition-colors"
                  onClick={clearChatHistory}
                />
              </TooltipTrigger>
              <TooltipContent className="tooltip">
                Clear chat history
              </TooltipContent>
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
      <div className="max-h-1/3  overflow-y-auto">
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

                  {message.type !== "thinking" &&
                    (message.type === "ai" ? (
                      <MarkdownRenderer content={message.response} />
                    ) : (
                      message.response
                    ))}

                  {message.type !== "thinking" && message.type == "ai" && (
                    <Tooltip>
                      <TooltipTrigger asChild>
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
                      aria-disabled={isThinking}
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
                <TooltipTrigger asChild>
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
