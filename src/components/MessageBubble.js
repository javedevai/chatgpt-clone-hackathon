"use client";

import { useEffect, useRef, useState } from "react";

export default function MessageBubble({ role, content, timestamp }) {
  const isUser = role === "user";
  const isError = role === "system";
  const ref = useRef(null);
  const [rendered, setRendered] = useState("");

  useEffect(() => {
    // Simple markdown-to-HTML conversion
    let html = content
      // Code blocks
      .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
        return `<pre><code class="language-${lang || "plaintext"}">${escapeHtml(code.trim())}</code></pre>`;
      })
      // Inline code
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      // Bold
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      // Italic
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      // Headers
      .replace(/^### (.*$)/gm, "<h3>$1</h3>")
      .replace(/^## (.*$)/gm, "<h2>$1</h2>")
      .replace(/^# (.*$)/gm, "<h1>$1</h1>")
      // Unordered lists
      .replace(/^\* (.*$)/gm, "<li>$1</li>")
      .replace(/^- (.*$)/gm, "<li>$1</li>")
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      // Line breaks / paragraphs
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br/>");

    // Wrap orphan <li> in <ul>
    html = html.replace(/((?:<li>.*?<\/li>\s*)+)/g, "<ul>$1</ul>");

    if (!html.startsWith("<")) html = `<p>${html}</p>`;

    setRendered(html);
  }, [content]);

  useEffect(() => {
    if (ref.current && typeof window !== "undefined" && window.hljs) {
      ref.current.querySelectorAll("pre code").forEach((block) => {
        window.hljs.highlightElement(block);
      });
    }
  }, [rendered]);

  function escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  const timeStr = timestamp
    ? new Date(timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  if (isError) {
    return (
      <div className="w-full py-4 animate-fade-in-up">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <div className="flex items-start gap-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.961-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-300 text-sm">{content}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full py-5 animate-fade-in-up ${
        isUser ? "bg-transparent" : "bg-[#1e1e1e]"
      }`}
    >
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              isUser
                ? "bg-gradient-to-br from-blue-500 to-purple-600"
                : "bg-gradient-to-br from-emerald-500 to-teal-600"
            }`}
          >
            {isUser ? (
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-gray-200">
                {isUser ? "You" : "AI Assistant"}
              </span>
              {timeStr && (
                <span className="text-[11px] text-gray-500">{timeStr}</span>
              )}
            </div>
            {isUser ? (
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {content}
              </p>
            ) : (
              <div
                ref={ref}
                className="markdown-content text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: rendered }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
