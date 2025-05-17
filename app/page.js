"use client"; // This must be a Client Component

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import * as faceapi from "face-api.js";

export default function Home() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [emotion, setEmotion] = useState("neutral");
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const streamRef = useRef(null);

  // Load models
  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
          faceapi.nets.faceExpressionNet.loadFromUri("/models"),
        ]);
        setIsModelLoading(false);
      } catch (error) {
        console.error("Error loading models:", error);
      }
    };
    loadModels();
  }, []);

  // Start/stop camera when isCameraOn changes
  useEffect(() => {
    if (isCameraOn) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isCameraOn]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: "user",
        },
        audio: false,
      });
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      detectEmotion();
    } catch (error) {
      console.error("Error accessing camera:", error);
      setIsCameraOn(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const detectEmotion = async () => {
    if (!isCameraOn || !videoRef.current) return;

    try {
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      if (detections.length > 0) {
        const expressions = detections[0].expressions;
        const maxEmotion = Object.entries(expressions).reduce(
          (max, [emotion, value]) =>
            value > max.value ? { emotion, value } : max,
          { emotion: "", value: 0 }
        );
        setEmotion(maxEmotion.emotion);
      }

      // Continue detecting
      if (isCameraOn) {
        requestAnimationFrame(detectEmotion);
      }
    } catch (error) {
      console.error("Error detecting emotion:", error);
    }
  };

  const getEmotionMessage = () => {
    switch (emotion) {
      case "happy":
        return "😊 You look happy!";
      case "angry":
        return "😠 You look angry!";
      case "sad":
        return "😢 You look sad!";
      case "surprised":
        return "😲 You look surprised!";
      case "fearful":
        return "😨 You look fearful!";
      case "disgusted":
        return "🤢 You look disgusted!";
      default:
        return "😐 Neutral expression";
    }
  };

  const getEmotionColor = () => {
    switch (emotion) {
      case "happy":
        return "bg-green-100 text-green-800";
      case "angry":
        return "bg-red-100 text-red-800";
      case "sad":
        return "bg-blue-100 text-blue-800";
      case "surprised":
        return "bg-yellow-100 text-yellow-800";
      case "fearful":
        return "bg-purple-100 text-purple-800";
      case "disgusted":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 row-start-2 items-center w-full max-w-4xl">
        <div className="flex flex-col items-center gap-4 w-full">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={180}
            height={38}
            priority
          />
          <h1 className="text-2xl font-bold">Stress Detection App</h1>
        </div>

        {isModelLoading ? (
          <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
            Loading emotion detection models...
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 w-full">
            <div className="relative w-full max-w-xl">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full rounded-lg border-2 ${
                  isCameraOn ? "border-indigo-500" : "border-transparent"
                }`}
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 pointer-events-none"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setIsCameraOn(true)}
                disabled={isCameraOn}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isCameraOn
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                }`}
              >
                Start Camera
              </button>
              <button
                onClick={() => setIsCameraOn(false)}
                disabled={!isCameraOn}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  !isCameraOn
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                Stop Camera
              </button>
            </div>

            {isCameraOn && (
              <div
                className={`p-4 rounded-lg text-center w-full ${getEmotionColor()}`}
              >
                <h2 className="text-xl font-semibold">{getEmotionMessage()}</h2>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
