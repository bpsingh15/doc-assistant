"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

interface DocSuggestion {
  title: string;
  content: string;
  url: string;
}

export default function Home() {
  const [code, setCode] = useState("");
  const [suggestions, setSuggestions] = useState<DocSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");

  // Generate userId only on client side
  useEffect(() => {
    setUserId(`user-${Math.random().toString(36).substr(2, 9)}`);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (code.trim() && userId) {
        searchDocs();
        saveToSupabase();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [code, userId]);

  const searchDocs = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/search-docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveToSupabase = async () => {
    if (!userId) return;

    try {
      await supabase.from("code_snippets").insert({
        user_id: userId,
        content: code,
        language: "javascript",
      });
    } catch (error) {
      console.error("Error saving to Supabase:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Real-Time Documentation Assistant
        </h1>
        <p className="text-gray-600 mb-8">
          Start typing code and get instant documentation suggestions
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span>📝</span> Code Editor
            </h2>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Start typing your code here...
function example() {
  // AI will suggest relevant docs as you type
}"
              className="w-full h-96 p-4 font-mono text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div className="mt-4 text-sm text-gray-500">
              {code.length} characters {userId && `| User: ${userId}`}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span>📚</span> Documentation Suggestions
              {loading && (
                <span className="ml-auto text-sm text-blue-600 animate-pulse">
                  Searching...
                </span>
              )}
            </h2>

            {suggestions.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <svg
                  className="w-16 h-16 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p>Start typing code to see relevant documentation</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-colors"
                  >
                    <h3 className="font-semibold text-lg mb-2 text-gray-900">
                      {suggestion.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {suggestion.content}
                    </p>
                    <a
                      href={suggestion.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                    >
                      Read more
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-3 text-blue-900">
            💡 How it works
          </h3>
          <ul className="space-y-2 text-blue-800">
            <li>✅ Type or paste code in the editor</li>
            <li>✅ AI analyzes your code after 1 second of no typing</li>
            <li>✅ Relevant documentation appears automatically</li>
            <li>✅ Code snippets are saved to Supabase in real-time</li>
            <li>✅ Click &quot;Read more&quot; to open full documentation</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
