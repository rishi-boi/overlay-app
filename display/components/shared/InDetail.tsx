"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Copy, Download, Share } from "lucide-react";
import MarkdownRenderer from "./MarkdownRenderer";

const InDetail = ({ userQuestion }: { userQuestion: string }) => {
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(response);
  };

  const handleDownload = () => {
    const blob = new Blob([response], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ai-response.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "AI Response",
        text: response,
      });
    }
  };

  const handleSend = useCallback(async () => {
    setResponse(""); // clear previous
    setIsLoading(true);

    try {
      const res = await fetch("/api/detail", {
        method: "POST",
        body: JSON.stringify({ question: userQuestion }),
      });

      if (!res.body) return;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value);
        setResponse(result); // update progressively
      }
    } catch (error) {
      console.error("Error fetching response:", error);
      setResponse("Sorry, there was an error getting the response.");
    } finally {
      setIsLoading(false);
    }
  }, [userQuestion]);

  useEffect(() => {
    handleSend();
  }, []);

  return (
    <div className="card-box max-w-md flex-col p-2 ">
      <strong className="text-sm flex items-center gap-1">
        In Detail Response
      </strong>
      {response && <MarkdownRenderer content={response} className="text-xs" />}
    </div>
  );
};

export default InDetail;
