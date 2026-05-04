"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Upload, Sparkles, User, BrainCircuit } from "lucide-react";

export function ChatTab({ subjectId }: { subjectId: string }) {
  const [messages, setMessages] = useState<
    { id: string; role: "user" | "assistant"; content: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          subjectId,
          userId: "mock-user-id", // TODO: Get from auth
        }),
      });

      if (!response.ok) throw new Error("Chat failed");

      const { message, sources } = await response.json();

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant" as const,
        content: message,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant" as const,
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-280px)] border border-black/[0.08] rounded-[12px] overflow-hidden bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <BrainCircuit className="w-12 h-12 mx-auto text-neutral-300 mb-4" />
              <p className="text-sm text-neutral-500">
                Upload materials to start learning with AI
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 max-w-3xl mx-auto w-full ${
                  message.role === "assistant"
                    ? "bg-[#FAFAFA] border border-black/[0.04] p-5 rounded-[12px]"
                    : ""
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                    message.role === "assistant"
                      ? "bg-black text-white shadow-sm"
                      : "bg-neutral-200 text-neutral-500"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <BrainCircuit className="w-4 h-4" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
                <div className="flex flex-col gap-2 w-full mt-0.5">
                  <span
                    className={`text-sm font-semibold ${
                      message.role === "assistant" ? "text-black" : "text-neutral-900"
                    }`}
                  >
                    {message.role === "assistant" ? "Nexus" : "Jane Doe"}
                  </span>
                  <p
                    className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: message.content }}
                  />
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-4 max-w-3xl mx-auto w-full bg-[#FAFAFA] border border-black/[0.04] p-5 rounded-[12px]">
                <div className="w-8 h-8 rounded-full bg-black text-white flex-shrink-0 flex items-center justify-center">
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-black rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-black rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-black rounded-full animate-bounce delay-200" />
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-black/[0.08]">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
            {[
              "Create a quiz on this",
              "Explain mathematical proof",
              "Summarize Lecture 1",
              "What are the key concepts?",
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInput(suggestion)}
                className="shrink-0 px-3 py-1.5 rounded-full border border-black/[0.08] bg-white text-[12px] font-semibold text-neutral-500 hover:text-black hover:bg-[#FAFAFA] transition-colors whitespace-nowrap shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
              >
                {suggestion}
              </button>
            ))}
          </div>
          <div className="relative flex items-end gap-2 bg-[#FAFAFA] rounded-[12px] p-2 border border-black/[0.08] xl:border-black/[0.1] focus-within:border-black/[0.15] focus-within:ring-4 focus-within:ring-black/[0.02] focus-within:bg-white transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <button className="p-2 rounded-lg text-neutral-400 hover:text-black hover:bg-black/[0.04] transition-colors shrink-0">
              <Upload className="w-5 h-5" strokeWidth={2} />
            </button>
            <textarea
              placeholder="Ask about your materials, or type '/' for commands..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[40px] text-[14px] py-2 placeholder:text-neutral-400 outline-none"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-2 rounded-[8px] bg-black text-white hover:bg-neutral-800 transition-all shadow-sm shrink-0 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 ml-0.5" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
