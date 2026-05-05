"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Upload, User, BrainCircuit, X, Image as ImageIcon } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
  image_url?: string;
}

export function ChatTab({ subjectId, userId }: { subjectId: string; userId?: string }) {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([
    "Create a quiz on this",
    "Explain mathematical proof",
    "Summarize Lecture 1",
    "What are the key concepts?",
  ]);
  const [selectedImage, setSelectedImage] = useState<{ data: string; mimeType: string } | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = (behavior: "smooth" | "auto" = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Fetch chat history
  const fetchHistory = useCallback(async () => {
    if (!userId || !subjectId) return;
    setHistoryLoading(true);
    try {
      const response = await fetch(`/api/chat?subjectId=${subjectId}&userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
        setTimeout(() => scrollToBottom("auto"), 100);
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
    } finally {
      setHistoryLoading(false);
    }
  }, [subjectId, userId]);

  // Fetch dynamic suggestions
  const fetchSuggestions = useCallback(async () => {
    if (!subjectId) return;
    try {
      const response = await fetch(`/api/chat/suggestions?subjectId=${subjectId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.suggestions && data.suggestions.length > 0) {
          setSuggestions(data.suggestions);
        }
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  }, [subjectId]);

  useEffect(() => {
    fetchHistory();
    fetchSuggestions();
  }, [fetchHistory, fetchSuggestions]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const base64Data = base64.split(",")[1];
      setSelectedImage({ data: base64Data, mimeType: file.type });
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async (customInput?: string) => {
    const textToSend = customInput || input;
    if ((!textToSend.trim() && !selectedImage) || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: textToSend.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    // Capture current image state to send, then clear it
    const imageToSend = selectedImage;
    removeImage();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          subjectId,
          userId,
          image: imageToSend
        }),
      });

      if (!response.ok) throw new Error("Chat failed");

      const { message, imageUrl } = await response.json();

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: message,
      };

      setMessages((prev) => {
        const newMessages = [...prev];
        const lastUserMsg = [...newMessages].reverse().find(m => m.role === 'user');
        if (lastUserMsg && imageUrl) {
          lastUserMsg.image_url = imageUrl;
        }
        return [...newMessages, assistantMessage];
      });
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
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

  const userName = profile?.full_name || "Student";

  return (
    <div className="flex flex-col flex-1 h-full border border-black/[0.08] rounded-[12px] overflow-hidden bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-6 scrollbar-hide">
        {historyLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-black/10 border-t-black rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <BrainCircuit className="w-12 h-12 mx-auto text-neutral-300 mb-4" />
              <p className="text-sm text-neutral-500 font-medium">
                Ask Nexus anything about this subject
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 max-w-3xl mx-auto w-full group ${
                  message.role === "assistant"
                    ? "bg-[#FAFAFA] border border-black/[0.04] p-5 rounded-[12px]"
                    : "py-2"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center transition-all ${
                    message.role === "assistant"
                      ? "bg-black text-white shadow-sm"
                      : "bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <BrainCircuit className="w-4 h-4" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
                <div className="flex flex-col gap-1.5 w-full mt-0.5">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[13px] font-bold uppercase tracking-wider ${
                        message.role === "assistant" ? "text-black" : "text-neutral-500"
                      }`}
                    >
                      {message.role === "assistant" ? "Nexus" : userName}
                    </span>
                    {message.created_at && (
                      <span className="text-[11px] text-neutral-400 font-medium">
                        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <div className="text-[14px] text-neutral-700 leading-relaxed font-medium prose prose-neutral prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                  {message.image_url && (
                    <div className="mt-2 rounded-lg overflow-hidden border border-black/[0.08] max-w-sm">
                      <img 
                        src={message.image_url} 
                        alt="Shared image" 
                        className="w-full h-auto object-cover max-h-[300px]"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-4 max-w-3xl mx-auto w-full bg-[#FAFAFA] border border-black/[0.04] p-5 rounded-[12px]">
                <div className="w-8 h-8 rounded-full bg-black text-white flex-shrink-0 flex items-center justify-center shadow-sm">
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-1.5 px-2">
                  <div className="w-1.5 h-1.5 bg-black/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-black/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-black/40 rounded-full animate-bounce" />
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
          {/* Suggestions */}
          {!isLoading && messages.length < 5 && (
             <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide no-scrollbar">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSend(suggestion)}
                  className="shrink-0 px-4 py-1.5 rounded-full border border-black/[0.08] bg-white text-[12px] font-bold text-neutral-500 hover:text-black hover:bg-[#FAFAFA] hover:border-black/[0.2] transition-all whitespace-nowrap shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Image Preview */}
          {imagePreview && (
            <div className="mb-3 relative w-fit group">
              <img 
                src={imagePreview} 
                alt="Upload preview" 
                className="h-20 w-auto rounded-lg border border-black/[0.1] object-cover"
              />
              <button 
                onClick={removeImage}
                className="absolute -top-2 -right-2 p-1 bg-black text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <div className="relative flex items-end gap-2 bg-[#FAFAFA] rounded-[16px] p-2.5 border border-black/[0.08] focus-within:border-black/[0.15] focus-within:ring-4 focus-within:ring-black/[0.02] focus-within:bg-white transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl text-neutral-400 hover:text-black hover:bg-black/[0.04] transition-colors shrink-0"
            >
              <ImageIcon className="w-5 h-5" strokeWidth={2.5} />
            </button>
            <textarea
              placeholder="Ask Nexus, or upload an image..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-48 min-h-[44px] text-[14px] py-2.5 placeholder:text-neutral-400 outline-none font-medium leading-relaxed"
              rows={1}
            />
            <button
              onClick={() => handleSend()}
              disabled={(!input.trim() && !selectedImage) || isLoading}
              className="p-2.5 rounded-[12px] bg-black text-white hover:bg-neutral-800 transition-all shadow-[0_2px_4px_rgba(0,0,0,0.1)] shrink-0 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
            >
              <Send className="w-4 h-4 ml-0.5" strokeWidth={3} />
            </button>
          </div>
          <p className="mt-3 text-[11px] text-center text-neutral-400 font-medium tracking-wide">
            Nexus can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}
