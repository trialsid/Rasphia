"use client";
import React, { useState, useRef, useMemo } from "react";
import { X, UploadCloud, Camera, Loader2, EyeOff } from "lucide-react";
import CameraCapture from "./CameraInput";
import { compressImage } from "@/utils/compressImage";

interface AnalysisUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalysisComplete: (analysis: any) => void;
  userEmail: string | null;
  type: string | null;
}

export default function AnalysisUploadModal({
  isOpen,
  onClose,
  onAnalysisComplete,
  userEmail,
  type,
}: AnalysisUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [blurFace, setBlurFace] = useState(true);
  const [openCamera, setOpenCamera] = useState(false);

  const filePickerRef = useRef<HTMLInputElement>(null);

  // Map type to image and label
  const { imageSrc, label, description } = useMemo(() => {
    switch (type) {
      case "skin":
        return { 
          imageSrc: "/Skin.png", 
          label: "Skin Analysis", 
          description: "Upload a clear close-up for personalized skincare advice." 
        };
      case "hair":
        return { 
          imageSrc: "/Hair.png", 
          label: "Hair Care", 
          description: "Share a photo of your hair texture to find the best products." 
        };
      case "body":
        return { 
          imageSrc: "/Body.png", 
          label: "Body Fit", 
          description: "Get size and style recommendations based on your profile." 
        };
      case "similar":
        return { 
          imageSrc: "/Match.png", 
          label: "Visual Match", 
          description: "Find similar items from our catalog instantly." 
        };
      default:
        return { 
          imageSrc: "/Match.png", 
          label: "Analysis Tool", 
          description: "Upload an image to start the analysis." 
        };
    }
  }, [type]);

  if (!isOpen) return null;

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (!f) return;

    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleCaptured = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setOpenCamera(false);
  };

  const handleProcess = async () => {
    if (!file || !type) return;
    setIsProcessing(true);

    const compressed = await compressImage(file);

    const form = new FormData();
    form.append("file", compressed);
    form.append("tool", type);
    form.append("blurSensitive", blurFace ? "true" : "false");
    try {
      const res = await fetch("/api/tools/create-analysis", {
        method: "POST",
        headers: { "x-user-email": userEmail as string },
        body: form,
      });

      const data = await res.json();
      onAnalysisComplete(data.analysis);
      onClose();
      setIsProcessing(false);
    } catch (e) {
      alert("image processing failed! try again later!");
      setIsProcessing(false);
    }
  };

  return (
    <>
      {openCamera && (
        <CameraCapture
          onCapture={handleCaptured}
          onClose={() => setOpenCamera(false)}
        />
      )}

      <div className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm flex items-center justify-center z-[999] px-4 animate-in fade-in duration-200">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/60 overflow-hidden flex flex-col max-h-[90vh] scale-100 animate-in zoom-in-95 duration-200">
          
          {/* Header Section */}
          <div className="relative p-5 pb-2">
             <button 
                onClick={onClose}
                className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-stone-100/50 text-stone-500 hover:text-stone-800 transition-colors z-10"
              >
                <X className="h-4 w-4" />
              </button>
             
             <div className="flex items-end gap-4">
                 <div className="w-[60%] flex-shrink-0">
                     <img 
                        src={imageSrc} 
                        alt={label} 
                        className="w-full h-auto max-h-40 rounded-2xl shadow-md border border-white/80 object-cover"
                     />
                 </div>
                 <div className="flex-1 min-w-0 text-left">
                    <h2 className="font-serif text-lg text-stone-900 font-semibold leading-tight">
                          {label}
                       </h2>
                       <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                          {description}
                       </p>
                 </div>
             </div>
          </div>

          {/* Body */}
          <div className="px-5 py-3 overflow-y-auto custom-scrollbar">
            {!preview ? (
              <div className="flex gap-3">
                {/* Upload Option */}
                <div
                  className="flex-1 group relative border border-dashed border-amber-200 bg-amber-50/50 rounded-2xl h-28 flex flex-col items-center justify-center gap-2 text-center cursor-pointer hover:border-amber-300 hover:bg-amber-50 transition-all active:scale-[0.98]"
                  onClick={() => filePickerRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <div className="h-9 w-9 bg-amber-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                     <UploadCloud className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-stone-800 font-medium text-xs">Upload Image</p>
                    <p className="text-stone-400 text-[10px]">Drag & Drop</p>
                  </div>
                </div>

                {/* Camera Option */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenCamera(true);
                  }}
                  className="flex-1 group border border-dashed border-stone-200 bg-stone-50/50 rounded-2xl h-28 flex flex-col items-center justify-center gap-2 text-center cursor-pointer hover:border-amber-300 hover:bg-stone-50 transition-all active:scale-[0.98]"
                >
                  <div className="h-9 w-9 bg-white border border-stone-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform group-hover:border-amber-100">
                    <Camera className="h-4 w-4 text-stone-500 group-hover:text-amber-600 transition-colors" />
                  </div>
                  <div>
                     <p className="text-stone-800 font-medium text-xs">Use Camera</p>
                     <p className="text-stone-400 text-[10px]">Take Photo</p>
                  </div>
                </button>
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden bg-stone-50 border border-stone-100 shadow-sm">
                <div className="relative aspect-video w-full bg-stone-100">
                   <img src={preview} className="h-full w-full object-contain" alt="Preview" />
                </div>

                <div className="flex items-center justify-between px-3 py-2 bg-white border-t border-stone-100">
                  <div
                    className="flex gap-2 items-center cursor-pointer select-none"
                    onClick={() => setBlurFace(!blurFace)}
                  >
                    <div className={`p-1 rounded-full ${blurFace ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-400'}`}>
                       <EyeOff className="h-3 w-3" />
                    </div>
                    <span className={`text-[10px] font-medium ${blurFace ? 'text-amber-800' : 'text-stone-500'}`}>Blur sensitive</span>
                  </div>

                  <button
                    onClick={() => {
                      setFile(null);
                      setPreview(null);
                    }}
                    className="text-[10px] font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-full transition-colors"
                  >
                    Change
                  </button>
                </div>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              ref={filePickerRef}
              className="hidden"
              onChange={handleSelect}
            />
          </div>

          {/* Footer */}
          <div className="p-5 pt-2 pb-6 bg-gradient-to-t from-white via-white to-transparent">
            <button
              disabled={!file || isProcessing}
              onClick={handleProcess}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-sm font-medium shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-amber-100" /> Analyzing...
                </>
              ) : (
                "Run Analysis"
              )}
            </button>
            <p className="text-center text-[10px] text-stone-400 mt-2.5">
               Images are processed securely and deleted after analysis.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
