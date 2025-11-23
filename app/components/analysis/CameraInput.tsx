"use client";
import React, { useRef, useState } from "react";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export default function CameraCapture({
  onCapture,
  onClose,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Start camera
  const startCamera = async () => {
    const media = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });
    setStream(media);
    if (videoRef.current) videoRef.current.srcObject = media;
  };

  // Capture frame
  const takePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(videoRef.current, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], "camera.jpg", { type: "image/jpeg" });
        onCapture(file);
      },
      "image/jpeg",
      0.9
    );

    stopCamera();
  };

  const stopCamera = () => {
    stream?.getTracks().forEach((t) => t.stop());
  };

  React.useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  return (
    <div className="fixed inset-0 z-[1000] bg-black/80 flex items-center justify-center">
      <div className="relative w-full max-w-md bg-black rounded-xl overflow-hidden">
        <video ref={videoRef} autoPlay playsInline className="w-full" />

        <div className="p-4 flex justify-between bg-black/60">
          <button
            onClick={onClose}
            className="text-white text-sm p-2 bg-white/20 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={takePhoto}
            className="px-4 py-2 bg-amber-600 text-white rounded-full"
          >
            Capture
          </button>
        </div>
      </div>
    </div>
  );
}
