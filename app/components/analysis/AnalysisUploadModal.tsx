"use client";
import React, { useState, useRef } from "react";
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
        headers: { "x-user-email": userEmail as string }, // replace with session email
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

      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[999] px-4">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-stone-50 border-b">
            <h2 className="font-serif text-xl text-stone-900">
              Upload Image for Analysis
            </h2>
            <button onClick={onClose}>
              <X className="h-5 w-5 text-stone-700" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="p-5 space-y-4 overflow-y-auto">
            {!preview ? (
              <div
                className="border-2 border-dashed border-stone-300 rounded-2xl p-10 text-center cursor-pointer hover:border-stone-400 transition"
                onClick={() => filePickerRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                <UploadCloud className="h-8 w-8 mx-auto text-stone-500 mb-3" />
                <p className="text-stone-600 text-sm">Click to upload</p>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenCamera(true);
                  }}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-900 text-white text-sm"
                >
                  <Camera className="h-4 w-4" /> Use Camera
                </button>
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden border bg-stone-100 shadow-inner">
                <img src={preview} className="w-full" />

                <div className="flex items-center justify-between px-3 py-2 bg-stone-200">
                  <div
                    className="flex gap-2 items-center cursor-pointer"
                    onClick={() => setBlurFace(!blurFace)}
                  >
                    <EyeOff
                      className={`h-4 w-4 ${
                        blurFace ? "text-amber-700" : "text-stone-500"
                      }`}
                    />
                    <span className="text-xs">Blur sensitive details</span>
                  </div>

                  <button
                    onClick={() => {
                      setFile(null);
                      setPreview(null);
                    }}
                    className="text-red-600 text-xs"
                  >
                    Remove
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
          <div className="p-5 border-t bg-white">
            <button
              disabled={!file || isProcessing}
              onClick={handleProcess}
              className="w-full py-3 rounded-full bg-gradient-to-br from-[#2C1A13] to-[#6C4C3C] text-white shadow disabled:bg-stone-400 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Processing…
                </>
              ) : (
                "Run Analysis"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
