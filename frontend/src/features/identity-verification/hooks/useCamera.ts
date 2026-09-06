"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface UseCameraOptions {
  facingMode?: "user" | "environment";
}

export function useCamera({ facingMode = "user" }: UseCameraOptions = {}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setIsReady(true);
          videoRef.current?.play().catch(() => {});
        };
      }
    } catch (err: unknown) {
      const e = err as DOMException;
      if (e.name === "NotAllowedError" || e.name === "PermissionDeniedError") {
        setPermissionDenied(true);
        setError("Camera permission was denied. Please allow camera access in your browser settings.");
      } else if (e.name === "NotFoundError") {
        setError("No camera found on this device.");
      } else {
        setError("Unable to start camera. Please try again.");
      }
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsReady(false);
  }, []);

  const captureFrame = useCallback(
    (quality = 0.92): Blob | null => {
      const video = videoRef.current;
      if (!video || !isReady) return null;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")!.drawImage(video, 0, 0);
      let blob: Blob | null = null;
      canvas.toBlob(
        (b) => {
          blob = b;
        },
        "image/jpeg",
        quality
      );
      return blob;
    },
    [isReady]
  );

  // Async capture (returns a Promise<Blob>)
  const captureFrameAsync = useCallback(
    (quality = 0.92): Promise<Blob | null> => {
      const video = videoRef.current;
      if (!video || !isReady) return Promise.resolve(null);
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")!.drawImage(video, 0, 0);
      return new Promise((resolve) => {
        canvas.toBlob((b) => resolve(b), "image/jpeg", quality);
      });
    },
    [isReady]
  );

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    isReady,
    error,
    permissionDenied,
    startCamera,
    stopCamera,
    captureFrame,
    captureFrameAsync,
  };
}
