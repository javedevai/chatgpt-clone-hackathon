"use client";

import { useEffect, useRef } from "react";

const MAX_LENGTH = 4000;

export default function ChatInput({ value, onChange, onSend, disabled }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSend();
      }
    }
  };

  const charCount = value.length;
  const isOverLimit = charCount > MAX_LENGTH;
  const canSend = value.trim().length > 0 && !disabled && !isOverLimit;

  return (
    <div className="border-t border-white/5 bg-gray-900 p-3 md:p-4">
      <div className="max-w-3xl mx-auto">
        <div className="relative flex items-end gap-2 glass rounded-2xl p-2 focus-within:border-emerald-500/30 transition-colors">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message AI Assistant…"
            disabled={disabled}
            maxLength={MAX_LENGTH + 100}
            rows={1}
            className="flex-1 bg-transparent text-gray-100 placeholder-gray-500 px-3 py-2.5 text-sm focus:outline-none min-h-[40px] max-h-[200px] overflow-y-auto"
          />
          <div className="flex items-center gap-2 pb-1.5">
            {charCount > MAX_LENGTH * 0.8 && (
              <span
                className={`text-[10px] ${
                  isOverLimit ? "text-red-400" : "text-gray-500"
                }`}
              >
                {charCount}/{MAX_LENGTH}
              </span>
            )}
            <button
              onClick={onSend}
              disabled={!canSend}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                canSend
                  ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/25"
                  : "bg-white/5 text-gray-600 cursor-not-allowed"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 12h14M12 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
        <p className="text-[10px] text-gray-600 text-center mt-2">
          AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
