"use client";
import { X } from "lucide-react";

export default function AnalysisDetailModal({ analysis, onClose }: any) {
  if (!analysis) return null;

  const { fileUrl, aiResult, title, createdAt } = analysis;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[999]">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-serif text-xl">{title}</h2>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-stone-600" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          <img src={fileUrl} className="w-full rounded-xl shadow" />

          <div>
            <h3 className="font-semibold text-stone-800 mb-1">Summary</h3>
            <p className="text-stone-600">{aiResult.summary}</p>
          </div>

          <div>
            <h3 className="font-semibold text-stone-800 mb-1">Suggestions</h3>
            <p className="text-stone-600">{aiResult.suggestions}</p>
          </div>

          <div>
            <h3 className="font-semibold text-stone-800 mb-1">
              Optimized Prompt
            </h3>
            <p className="text-stone-600 text-sm">{aiResult.optimizedPrompt}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
