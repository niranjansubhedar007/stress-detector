// "use client";
// import { useEffect, useRef, useState } from "react";
// import Image from "next/image";
// import * as faceapi from "face-api.js";

// export default function Home() {
//   const videoRef = useRef(null);
//   const [emotion, setEmotion] = useState("neutral");
//   const [isModelLoading, setIsModelLoading] = useState(true);
//   const [isCameraOn, setIsCameraOn] = useState(false);
//   const [error, setError] = useState(null);
//   const streamRef = useRef(null);
//   const detectionRef = useRef(null);

//   // Load models with better error handling
//   useEffect(() => {
//     const loadModels = async () => {
//       try {
//         // In production, we need to use absolute URLs for the models
//         const modelPath = process.env.NODE_ENV === 'production' 
//           ? 'https://your-vercel-app.vercel.app/models' 
//           : '/models';
        
//         await Promise.all([
//           faceapi.nets.tinyFaceDetector.loadFromUri(modelPath),
//           faceapi.nets.faceLandmark68Net.loadFromUri(modelPath),
//           faceapi.nets.faceRecognitionNet.loadFromUri(modelPath),
//           faceapi.nets.faceExpressionNet.loadFromUri(modelPath),
//         ]);
//         setIsModelLoading(false);
//       } catch (error) {
//         console.error("Error loading models:", error);
//         setError("Failed to load emotion detection models. Please refresh the page.");
//         setIsModelLoading(false);
//       }
//     };
    
//     loadModels();
    
//     return () => {
//       if (detectionRef.current) {
//         cancelAnimationFrame(detectionRef.current);
//       }
//     };
//   }, []);

//   // Camera management
//   useEffect(() => {
//     if (!isCameraOn) {
//       stopCamera();
//       return;
//     }

//     const startCam = async () => {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: { width: 640, height: 480, facingMode: "user" },
//           audio: false,
//         });
//         videoRef.current.srcObject = stream;
//         streamRef.current = stream;
//         detectEmotion();
//       } catch (err) {
//         console.error("Camera error:", err);
//         setError("Could not access camera. Please ensure you've granted camera permissions.");
//         setIsCameraOn(false);
//       }
//     };

//     if (isCameraOn && !isModelLoading) {
//       startCam();
//     }

//     return () => {
//       if (streamRef.current) {
//         streamRef.current.getTracks().forEach(track => track.stop());
//       }
//     };
//   }, [isCameraOn, isModelLoading]);

//   const stopCamera = () => {
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach(track => track.stop());
//       streamRef.current = null;
//     }
//     if (detectionRef.current) {
//       cancelAnimationFrame(detectionRef.current);
//       detectionRef.current = null;
//     }
//   };

//   const detectEmotion = async () => {
//     if (!isCameraOn || !videoRef.current) return;

//     try {
//       const detections = await faceapi
//         .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
//         .withFaceLandmarks()
//         .withFaceExpressions();

//       if (detections.length > 0) {
//         const expressions = detections[0].expressions;
//         const maxEmotion = Object.entries(expressions).reduce(
//           (max, [emotion, value]) => value > max.value ? { emotion, value } : max,
//           { emotion: "", value: 0 }
//         );
//         setEmotion(maxEmotion.emotion);
//       }

//       detectionRef.current = requestAnimationFrame(detectEmotion);
//     } catch (error) {
//       console.error("Detection error:", error);
//       detectionRef.current = requestAnimationFrame(detectEmotion);
//     }
//   };

//   const getEmotionMessage = () => {
//     const messages = {
//       happy: "😊 You look happy!",
//       angry: "😠 You look angry!",
//       sad: "😢 You look sad!",
//       surprised: "😲 You look surprised!",
//       fearful: "😨 You look fearful!",
//       disgusted: "🤢 You look disgusted!",
//       neutral: "😐 Neutral expression"
//     };
//     return messages[emotion] || messages.neutral;
//   };

//   const getEmotionColor = () => {
//     const colors = {
//       happy: "bg-green-100 text-green-800",
//       angry: "bg-red-100 text-red-800",
//       sad: "bg-blue-100 text-blue-800",
//       surprised: "bg-yellow-100 text-yellow-800",
//       fearful: "bg-purple-100 text-purple-800",
//       disgusted: "bg-orange-100 text-orange-800",
//       neutral: "bg-gray-100 text-gray-800"
//     };
//     return colors[emotion] || colors.neutral;
//   };

//   return (
//     <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
//       <main className="flex flex-col gap-8 row-start-2 items-center w-full max-w-4xl">
//         <div className="flex flex-col items-center gap-4 w-full">
//           <Image
//             className="dark:invert"
//             src="/next.svg"
//             alt="Next.js logo"
//             width={180}
//             height={38}
//             priority
//           />
//           <h1 className="text-2xl font-bold">Stress Detection App</h1>
//         </div>

//         {error ? (
//           <div className="p-4 rounded-lg bg-red-100 text-red-800">
//             {error}
//           </div>
//         ) : isModelLoading ? (
//           <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
//             Loading emotion detection models...
//             <div className="mt-2 text-sm">This may take a few moments</div>
//           </div>
//         ) : (
//           <div className="flex flex-col items-center gap-6 w-full">
//             <div className="relative w-full max-w-xl bg-gray-200 rounded-lg aspect-video flex items-center justify-center">
//               {isCameraOn ? (
//                 <video
//                   ref={videoRef}
//                   autoPlay
//                   playsInline
//                   muted
//                   className="w-full h-full object-cover rounded-lg"
//                 />
//               ) : (
//                 <div className="text-gray-500">Camera is off</div>
//               )}
//             </div>

//             <div className="flex gap-4">
//               <button
//                 onClick={() => setIsCameraOn(true)}
//                 disabled={isCameraOn}
//                 className={`px-4 py-2 rounded-lg transition-colors ${
//                   isCameraOn
//                     ? "bg-gray-300 cursor-not-allowed"
//                     : "bg-indigo-600 hover:bg-indigo-700 text-white"
//                 }`}
//               >
//                 Start Camera
//               </button>
//               <button
//                 onClick={() => setIsCameraOn(false)}
//                 disabled={!isCameraOn}
//                 className={`px-4 py-2 rounded-lg transition-colors ${
//                   !isCameraOn
//                     ? "bg-gray-300 cursor-not-allowed"
//                     : "bg-red-600 hover:bg-red-700 text-white"
//                 }`}
//               >
//                 Stop Camera
//               </button>
//             </div>

//             {isCameraOn && (
//               <div className={`p-4 rounded-lg text-center w-full ${getEmotionColor()}`}>
//                 <h2 className="text-xl font-semibold">{getEmotionMessage()}</h2>
//               </div>
//             )}
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }



"use client"
import { useEffect, useRef } from 'react';

export default function Home() {
  const videoRef = useRef(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
      }
    };

    startCamera();
  }, []);

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>📷 Live Camera Feed</h1>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        width="640"
        height="480"
        style={{ border: '2px solid #ccc', borderRadius: '10px' }}
      />
    </div>
  );
}
