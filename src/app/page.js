"use client";

import ChatArea from "@/components/ChatArea";
import ChatInput from "@/components/ChatInput";
import SettingsModal from "@/components/SettingsModal";
import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";

const WELCOME_PROMPTS = [
  {
    title: "Explain quantum computing",
    desc: "in simple terms",
    icon: "💡",
  },
  {
    title: "Write a Python script",
    desc: "to automate sending emails",
    icon: "🐍",
  },
  {
    title: "Creative ideas for",
    desc: "a 10 year old's birthday",
    icon: "🎂",
  },
  {
    title: "Help me debug",
    desc: "my React component",
    icon: "🔧",
  },
];

export default function Home() {
  // State
  const [history, setHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [model, setModel] = useState("gemini-2.0-flash");
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful AI assistant. Respond clearly and concisely."
  );

  // Load from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("chat_history");
    const savedModel = localStorage.getItem("gemini_model");
    const savedPrompt = localStorage.getItem("system_prompt");

    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch {}
    }
    if (savedModel) setModel(savedModel);
    if (savedPrompt) setSystemPrompt(savedPrompt);

    // Start with a new chat
    setCurrentChatId(Date.now().toString());
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem("chat_history", JSON.stringify(history));
    }
  }, [history]);

  useEffect(() => {
    localStorage.setItem("gemini_model", model);
  }, [model]);

  useEffect(() => {
    localStorage.setItem("system_prompt", systemPrompt);
  }, [systemPrompt]);

  // Get current chat messages
  const currentChat = history.find((c) => c.id === currentChatId);
  const currentMessages = currentChat?.messages || [];

  // Actions
  const startNewChat = () => {
    setCurrentChatId(Date.now().toString());
    setSidebarOpen(false);
  };

  const loadChat = (chatId) => {
    setCurrentChatId(chatId);
    setSidebarOpen(false);
  };

  const clearHistory = () => {
    if (window.confirm("Clear all conversations?")) {
      setHistory([]);
      localStorage.removeItem("chat_history");
      startNewChat();
    }
  };

  const addMessage = (role, content) => {
    const timestamp = Date.now();
    setHistory((prev) => {
      const existing = prev.find((c) => c.id === currentChatId);
      if (existing) {
        return prev.map((c) =>
          c.id === currentChatId
            ? {
                ...c,
                messages: [...c.messages, { role, content, timestamp }],
              }
            : c
        );
      } else {
        return [
          {
            id: currentChatId,
            title:
              content.substring(0, 30) + (content.length > 30 ? "…" : ""),
            timestamp,
            messages: [{ role, content, timestamp }],
          },
          ...prev,
        ];
      }
    });
  };

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || isGenerating) return;

    setInput("");
    addMessage("user", msg);
    setIsGenerating(true);

    try {
      // Build messages array including existing history
      const allMessages = [
        ...currentMessages,
        { role: "user", content: msg },
      ];

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          systemPrompt,
          model,
        }),
      });

      let errorMsg = "Something went wrong";

      try {
        const data = await response.json();
        if (!response.ok) {
          errorMsg = data.error || errorMsg;
          throw new Error(errorMsg);
        }
        const aiText = data.choices[0].message.content;
        addMessage("assistant", aiText);
      } catch (parseErr) {
        if (parseErr.message !== errorMsg) {
          throw parseErr;
        }
        addMessage("system", errorMsg);
      }
    } catch (error) {
      addMessage("system", error.message || "Failed to get response");
    }

    setIsGenerating(false);
  };

  const handleModelChange = (newModel) => {
    setModel(newModel);
  };

  const handleSystemPromptChange = (newPrompt) => {
    setSystemPrompt(newPrompt);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        history={history}
        currentChatId={currentChatId}
        onNewChat={startNewChat}
        onLoadChat={loadChat}
        onClearHistory={clearHistory}
        onOpenSettings={() => setSettingsOpen(true)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-gray-900/80 backdrop-blur-sm">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-300">
              {model.replace("gemini-", "Gemini ")}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <button
            onClick={startNewChat}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>

        {/* Chat Messages or Welcome Screen */}
        {currentMessages.length === 0 && !isGenerating ? (
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            <div className="text-center mb-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold gradient-text mb-2">
                ChatGPT Clone
              </h1>
              <p className="text-gray-500 text-sm">
                Powered by Google Gemini AI
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
              {WELCOME_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(`${prompt.title} ${prompt.desc}`)}
                  className="text-left p-4 rounded-xl glass hover:bg-white/10 transition-all duration-200 group"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg">{prompt.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-200 group-hover:text-white">
                        {prompt.title}
                      </p>
                      <p className="text-xs text-gray-500">{prompt.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ChatArea messages={currentMessages} isTyping={isGenerating} />
        )}

        {/* Input Area */}
        <ChatInput
          value={input}
          onChange={setInput}
          onSend={() => sendMessage()}
          disabled={isGenerating}
        />
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        model={model}
        onModelChange={handleModelChange}
        systemPrompt={systemPrompt}
        onSystemPromptChange={handleSystemPromptChange}
      />
    </div>
  );
}
