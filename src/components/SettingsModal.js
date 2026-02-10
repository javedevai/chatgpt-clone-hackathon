"use client";

import { useEffect, useState } from "react";

const AVAILABLE_MODELS = [
  { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash (Fast)" },
  { id: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash Lite" },
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash (Latest)" },
  { id: "gemini-pro-latest", label: "Gemini Pro (Latest)" },
  { id: "gemini-flash-latest", label: "Gemini Flash (Latest)" },
];

export default function SettingsModal({
  isOpen,
  onClose,
  model,
  onModelChange,
  systemPrompt,
  onSystemPromptChange,
}) {
  const [localModel, setLocalModel] = useState(model);
  const [localPrompt, setLocalPrompt] = useState(systemPrompt);

  useEffect(() => {
    setLocalModel(model);
    setLocalPrompt(systemPrompt);
  }, [model, systemPrompt, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onModelChange(localModel);
    onSystemPromptChange(localPrompt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-md glass rounded-2xl p-6 animate-fade-in-up bg-[#1e1e1e] border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold gradient-text">Settings</h2>
          <button
            onClick={onClose}
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Model Selection */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            AI Model
          </label>
          <select
            value={localModel}
            onChange={(e) => setLocalModel(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none cursor-pointer"
          >
            {AVAILABLE_MODELS.map((m) => (
              <option
                key={m.id}
                value={m.id}
                className="bg-gray-800 text-white"
              >
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* System Prompt */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            System Prompt
          </label>
          <textarea
            value={localPrompt}
            onChange={(e) => setLocalPrompt(e.target.value)}
            rows={4}
            placeholder="You are a helpful AI assistant."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 placeholder-gray-600"
          />
          <p className="text-[10px] text-gray-500 mt-1">
            Customize how the AI behaves and responds.
          </p>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium text-sm hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/25"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
