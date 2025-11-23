"use client";
import { X, ChevronRight } from "lucide-react";

export default function AnalysisListModal({
  analyses,
  onClose,
  onOpenAnalysisDetails,
}: any) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999] flex items-center justify-center">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-serif text-xl">All Analyses</h2>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-stone-600" />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto p-6 space-y-4">
          {analyses.map((a: any) => (
            <div
              key={a.analysisId}
              onClick={() => onOpenAnalysisDetails(a.analysisId)}
              className="flex items-center gap-4 p-4 rounded-xl border bg-white/60 hover:bg-white cursor-pointer transition"
            >
              <img
                src={a.fileUrl}
                className="h-12 w-12 rounded-lg object-cover"
              />
              <div className="flex-1">
                <p className="font-medium">{a.title}</p>
                <p className="text-xs opacity-60">
                  {new Date(a.createdAt).toLocaleDateString()}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-stone-400" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
