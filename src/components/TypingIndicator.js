"use client";

export default function TypingIndicator() {
  return (
    <div className="w-full py-5 bg-[#1e1e1e] animate-fade-in-up">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-gray-200">AI Assistant</span>
            </div>
            <div className="flex items-center gap-1.5 h-6">
              <div className="w-2 h-2 bg-emerald-400 rounded-full typing-dot"></div>
              <div className="w-2 h-2 bg-emerald-400 rounded-full typing-dot"></div>
              <div className="w-2 h-2 bg-emerald-400 rounded-full typing-dot"></div>
              <span className="text-xs text-gray-500 ml-2">AI is thinking…</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
