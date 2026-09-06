"use client";

/**
 * useFaceLandmarks — Browser-side face landmark detection using MediaPipe Face Mesh.
 *
 * Detects:
 * - Blink: Eye Aspect Ratio (EAR) of left/right eyes
 * - Head turn left/right: Nose tip X position relative to face bounding box
 * - Look up: Nose tip Y position
 */

import { useRef, useState, useCallback, useEffect } from "react";
import type { ChallengeTypeValue } from "../types";

interface LandmarkPoint {
  x: number;
  y: number;
  z?: number;
}

const LEFT_EYE_INDICES = [159, 145, 133, 160, 144, 153];
const RIGHT_EYE_INDICES = [386, 374, 362, 387, 373, 380];
const NOSE_TIP = 1;
const LEFT_FACE = 234;
const RIGHT_FACE = 454;
const UPPER_LIP = 13;

function eyeAspectRatio(landmarks: LandmarkPoint[], indices: number[]): number {
  const [p1, p2, p3, p4, p5, p6] = indices.map((i) => landmarks[i]);
  if (!p1 || !p2 || !p3 || !p4 || !p5 || !p6) return 0.3;
  const vertical1 = Math.sqrt((p2.x - p6.x) ** 2 + (p2.y - p6.y) ** 2);
  const vertical2 = Math.sqrt((p3.x - p5.x) ** 2 + (p3.y - p5.y) ** 2);
  const horizontal = Math.sqrt((p1.x - p4.x) ** 2 + (p1.y - p4.y) ** 2);
  return (vertical1 + vertical2) / (2 * horizontal);
}

export interface ChallengeDetectionResult {
  completed: boolean;
  challengePassed: boolean;
  progress: number; // 0.0 - 1.0
  instruction: string;
  faceDetected: boolean;
}

export function useFaceLandmarks(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  challengeType: ChallengeTypeValue | null
) {
  const [result, setResult] = useState<ChallengeDetectionResult>({
    completed: false,
    challengePassed: false,
    progress: 0,
    instruction: challengeType ? getInstruction(challengeType) : "",
    faceDetected: false,
  });
  const faceMeshRef = useRef<any>(null);
  const animFrameRef = useRef<number>(0);
  const isRunningRef = useRef<boolean>(false);
  const challengeCompletedRef = useRef(false);

  // ── Load MediaPipe ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!challengeType) return;

    let cancelled = false;

    async function loadFaceMesh() {
      try {
        const { FaceMesh } = await import("@mediapipe/face_mesh");
        if (cancelled) return;

        const faceMesh = new FaceMesh({
          locateFile: (file: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/${file}`,
        });

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        faceMesh.onResults((results: { multiFaceLandmarks?: LandmarkPoint[][] }) => {
          if (challengeCompletedRef.current) return;

          const landmarks = results.multiFaceLandmarks?.[0];
          if (!landmarks || landmarks.length === 0) {
            setResult((prev) => ({
              ...prev,
              completed: false,
              challengePassed: false,
              progress: 0,
              instruction: challengeType ? getInstruction(challengeType) : "",
              faceDetected: false,
            }));
            return;
          }

          if (challengeType) {
            const detection = detectChallenge(landmarks, challengeType);
            if (detection.completed) {
              challengeCompletedRef.current = true;
            }
            setResult({
              ...detection,
              challengePassed: detection.completed,
              faceDetected: true,
            });
          }
        });

        faceMeshRef.current = faceMesh;
      } catch (err) {
        console.warn("MediaPipe FaceMesh could not be loaded, manual capture is available:", err);
      }
    }

    loadFaceMesh().catch(() => {});

    return () => {
      cancelled = true;
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [challengeType]);

  // ── Detection loop ─────────────────────────────────────────────────────
  const startDetection = useCallback(() => {
    challengeCompletedRef.current = false;
    isRunningRef.current = true;

    async function loop() {
      if (!isRunningRef.current) return;
      const faceMesh = faceMeshRef.current;
      const video = videoRef.current;
      if (faceMesh?.send && video && video.readyState >= 2) {
        try {
          await faceMesh.send({ image: video });
        } catch {
          // ignore frame errors
        }
      }
      if (isRunningRef.current) {
        animFrameRef.current = requestAnimationFrame(loop);
      }
    }
    animFrameRef.current = requestAnimationFrame(loop);
  }, [videoRef]);

  const stopDetection = useCallback(() => {
    isRunningRef.current = false;
    cancelAnimationFrame(animFrameRef.current);
  }, []);

  return { result, startDetection, stopDetection };
}

// ── Challenge detection logic ──────────────────────────────────────────────

function getInstruction(challenge: ChallengeTypeValue): string {
  const map: Record<ChallengeTypeValue, string> = {
    BLINK: "Please blink slowly into the camera",
    TURN_LEFT: "Please turn your head slowly to the left",
    TURN_RIGHT: "Please turn your head slowly to the right",
    LOOK_UP: "Please tilt your head slightly upward",
  };
  return map[challenge] || "Look directly into the camera and take a photo";
}

function detectChallenge(
  landmarks: LandmarkPoint[],
  challenge: ChallengeTypeValue
): Omit<ChallengeDetectionResult, "faceDetected" | "challengePassed"> {
  const instruction = getInstruction(challenge);

  if (challenge === "BLINK") {
    const leftEar = eyeAspectRatio(landmarks, LEFT_EYE_INDICES);
    const rightEar = eyeAspectRatio(landmarks, RIGHT_EYE_INDICES);
    const ear = (leftEar + rightEar) / 2;
    const BLINK_THRESHOLD = 0.22;
    const completed = ear < BLINK_THRESHOLD;
    return { completed, progress: completed ? 1.0 : Math.min(1.0, (0.3 - ear) / 0.08), instruction };
  }

  if (challenge === "TURN_LEFT" || challenge === "TURN_RIGHT") {
    const nose = landmarks[NOSE_TIP];
    const leftFace = landmarks[LEFT_FACE];
    const rightFace = landmarks[RIGHT_FACE];
    if (!nose || !leftFace || !rightFace) {
      return { completed: false, progress: 0, instruction };
    }
    const faceWidth = rightFace.x - leftFace.x;
    const noseNorm = faceWidth > 0 ? (nose.x - leftFace.x) / faceWidth : 0.5;
    const TURN_THRESHOLD = 0.12;
    let completed = false;
    let progress = 0;

    if (challenge === "TURN_LEFT") {
      const shift = 0.5 - noseNorm;
      completed = shift > TURN_THRESHOLD;
      progress = Math.min(1.0, Math.max(0, shift / TURN_THRESHOLD));
    } else {
      const shift = noseNorm - 0.5;
      completed = shift > TURN_THRESHOLD;
      progress = Math.min(1.0, Math.max(0, shift / TURN_THRESHOLD));
    }

    return { completed, progress, instruction };
  }

  if (challenge === "LOOK_UP") {
    const nose = landmarks[NOSE_TIP];
    const lip = landmarks[UPPER_LIP];
    if (!nose || !lip) {
      return { completed: false, progress: 0, instruction };
    }
    const verticalShift = lip.y - nose.y;
    const LOOK_UP_THRESHOLD = 0.12;
    const completed = verticalShift > LOOK_UP_THRESHOLD;
    return {
      completed,
      progress: Math.min(1.0, Math.max(0, verticalShift / LOOK_UP_THRESHOLD)),
      instruction,
    };
  }

  return { completed: false, progress: 0, instruction };
}
