import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Sparkles, ShoppingBag, Package, User, Bot, HelpCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const QUICK_ACTIONS = [
  { label: "✨ New Arrivals", query: "Show me the new arrivals" },
  { label: "🔥 Best Sellers", query: "What are your best sellers?" },
  { label: "🏷️ Sale Items", query: "Show me items on sale" },
  { label: "👕 T-Shirts", query: "Show me T-Shirts" },
  { label: "🧥 Hoodies & Jackets", query: "Show me jackets and hoodies" },
  { label: "👖 Cargo Pants", query: "Show me cargo pants" },
  { label: "📦 Track Order", query: "How do I track my order?" },
  { label: "📞 Support", query: "What is your contact information and support hours?" },
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! 👋 Welcome to our clothing store. I'm your AI Shopping Assistant. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend) => {
    const queryText = textToSend || input.trim();
    if (!queryText) return;

    if (!textToSend) {
      setInput("");
    }

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Send chat history (excluding welcome message for cleaner backend context)
      const chatHistory = messages
        .filter(m => m.id !== "welcome")
        .map(m => ({
          role: m.role,
          content: m.content
        }));

      const response = await api.post("/api/chat", {
        message: queryText,
        history: chatHistory
      });

      const aiReply = response.data?.data?.text || "I'm not sure how to respond to that.";

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: aiReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error("Chatbot frontend error:", err);
      const errorMessage = err.response?.data?.message || "Sorry, I'm having trouble connecting right now. Please try again in a moment.";
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: errorMessage,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to parse text and render links matching /products/PRODUCT_ID correctly
  const renderMessageContent = (content) => {
    // Regex to match markdown links: [Link Text](/products/ID) or similar
    const linkRegex = /\[([^\]]+)\]\(\/products\/([a-f\d]{24})\)/gi;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      const matchIndex = match.index;
      // Add plain text before match
      if (matchIndex > lastIndex) {
        parts.push(content.substring(lastIndex, matchIndex));
      }
      
      const linkText = match[1];
      const productId = match[2];

      parts.push(
        <button
          key={productId + matchIndex}
          onClick={() => {
            navigate(`/products/${productId}`);
            setIsOpen(false);
          }}
          className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 underline transition-colors cursor-pointer text-left"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          {linkText}
        </button>
      );
      
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    if (parts.length === 0) return content;

    return <span className="whitespace-pre-line">{parts}</span>;
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 font-sans ${isDarkMode ? "dark" : ""}`}>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-14 h-14 bg-black dark:bg-white text-white dark:text-black rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 group cursor-pointer border border-neutral-200 dark:border-neutral-800"
        >
          <Bot className="w-7 h-7 group-hover:rotate-12 transition-transform duration-300" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="flex flex-col w-[360px] md:w-[400px] h-[550px] bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-black dark:bg-zinc-900 text-white border-b border-neutral-800">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-zinc-800 rounded-lg">
                <Bot className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  AI Sales Assistant
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </h3>
                <p className="text-[10px] text-zinc-400">Ask about sizes, colors, budget, or tracking</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer text-xs"
                title="Toggle Theme"
              >
                {isDarkMode ? "☀️ Light" : "🌙 Dark"}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-zinc-900">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 max-w-[85%] ${
                  msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-black dark:bg-zinc-800 text-white"
                  }`}
                >
                  {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div className="flex flex-col">
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl shadow-sm text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-black dark:bg-white text-white dark:text-black rounded-tr-none"
                        : msg.isError
                        ? "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 border border-rose-100 dark:border-rose-900/50 rounded-tl-none"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tl-none"
                    }`}
                  >
                    {msg.isError && <AlertCircle className="w-4 h-4 inline mr-1 -mt-0.5 text-rose-500" />}
                    {renderMessageContent(msg.content)}
                  </div>
                  <span
                    className={`text-[9px] text-gray-500 dark:text-zinc-400 mt-1 ${
                      msg.role === "user" ? "text-right" : "text-left"
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 max-w-[85%] mr-auto animate-pulse">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                  <Bot className="w-4 h-4 animate-spin text-indigo-400" />
                </div>
                <div className="bg-white dark:bg-zinc-850 border border-neutral-100 dark:border-neutral-800 px-4 py-3 rounded-2xl rounded-tl-none flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 bg-zinc-300 dark:bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2.5 h-2.5 bg-zinc-300 dark:bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2.5 h-2.5 bg-zinc-300 dark:bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies / Suggestions */}
          <div className="px-3 py-2 bg-white dark:bg-zinc-950 border-t border-b border-neutral-100 dark:border-neutral-800 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={() => handleSend(action.query)}
                className="inline-block px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[11px] font-medium rounded-full text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer border border-neutral-200/50 dark:border-neutral-700/50"
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 p-3 bg-white dark:bg-zinc-950 border-t border-neutral-100 dark:border-neutral-800"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me something..."
              maxLength={250}
              className="flex-1 px-4 py-2 bg-slate-50 dark:bg-zinc-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-black dark:text-white placeholder-gray-400 dark:placeholder-zinc-500"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:scale-100 transition-all cursor-pointer flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
}
