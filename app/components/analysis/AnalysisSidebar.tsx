"use client";
import React from "react";
import {
  Image as ImageIcon,
  Camera,
  Sparkles,
  ScanFace,
  Scissors,
  Dumbbell,
  Package,
  ChevronRight,
  ArrowRightCircle,
} from "lucide-react";

interface AnalysisSidebarProps {
  onOpenAnalysis: (tool: string) => void;
  onAttachToChat: (analysisId: string) => void;
  recentAnalyses: any[];
  onOpenAnalysisDetails: (id: string) => void; // ADD THIS
  onOpenAnalysisList: () => void;
}

export default function AnalysisSidebar({
  onOpenAnalysis,
  onAttachToChat,
  recentAnalyses,
  onOpenAnalysisDetails,
  onOpenAnalysisList,
}: AnalysisSidebarProps) {
  return (
    <aside
      className="
      hidden lg:flex 
      w-[340px] flex-col 
      bg-white/70 
      border-l border-white/40 
      backdrop-blur-xl 
      shadow-[0_8px_30px_rgba(0,0,0,0.06)] 
      p-6 
      rounded-l-3xl
      max-h-screen 
      overflow-y-auto
    "
    >
      <h2 className="text-sm uppercase tracking-[0.3em] text-stone-500 mb-4">
        Analysis Tools
      </h2>

      {/* TOOL CARDS */}
      <div className="space-y-4">
        <ToolCard
          title="Skin Analysis"
          description="Upload a skin photo for routines + product suggestions."
          icon={<ScanFace className="h-5 w-5 text-amber-700" />}
          onClick={() => onOpenAnalysis("skin")}
        />

        <ToolCard
          title="Hair Analysis"
          description="Detect dryness, damage and get product picks."
          icon={<Scissors className="h-5 w-5 text-amber-700" />}
          onClick={() => onOpenAnalysis("hair")}
        />

        <ToolCard
          title="Body Composition"
          description="Estimate body fat %, fitness state & supplement ideas."
          icon={<Dumbbell className="h-5 w-5 text-amber-700" />}
          onClick={() => onOpenAnalysis("body")}
        />

        <ToolCard
          title="Find Similar Products"
          description="Upload any product photo and find closest matches."
          icon={<Package className="h-5 w-5 text-amber-700" />}
          onClick={() => onOpenAnalysis("similar")}
        />
      </div>

      {/* RECENT ANALYSES */}
      <div className="mt-10">
        <h3 className="text-xs uppercase tracking-[0.3em] text-stone-500 mb-3">
          Recent Analyses
        </h3>

        <div className="space-y-4">
          {recentAnalyses.slice(0, 4).map((a) => (
            <div
              key={a.analysisId}
              className="
                flex flex-col gap-2 
                p-3 rounded-xl 
                bg-white/60 border border-white/40 hover:bg-white
                transition
              "
            >
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => onOpenAnalysisDetails(a.analysisId)}
              >
                <img
                  src={a.fileUrl}
                  className="h-12 w-12 rounded-lg object-cover"
                />
                <div className="text-sm text-stone-700">
                  <p className="font-medium">{a.title || a.type}</p>
                  <p className="text-xs opacity-60">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <ChevronRight className="ml-auto h-4 w-4 text-stone-400" />
              </div>

              {/* ATTACH TO CHAT */}
              <button
                onClick={() => onAttachToChat(a.analysisId)}
                className="flex items-center gap-1 text-xs font-medium text-amber-700 hover:text-amber-900"
              >
                <ArrowRightCircle className="h-4 w-4" />
                Insert into chat
              </button>
            </div>
          ))}
        </div>

        <button
          className="
            mt-4 w-full rounded-full 
            border border-stone-300 
            text-stone-700 py-2 text-sm
            hover:bg-white transition
          "
          onClick={onOpenAnalysisList}
        >
          View all
        </button>
      </div>
    </aside>
  );
}

// TOOL CARD
function ToolCard({
  title,
  description,
  icon,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="
        w-full text-left 
        p-4 rounded-2xl 
        bg-white/80 border border-white/40
        hover:bg-white transition flex gap-4 items-start
      "
    >
      <div className="mt-1">{icon}</div>
      <div>
        <p className="font-semibold text-stone-800">{title}</p>
        <p className="text-xs text-stone-500 mt-1">{description}</p>
      </div>
    </button>
  );
}
