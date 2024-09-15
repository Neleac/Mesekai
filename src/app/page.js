"use client";

import { useEffect, useRef } from "react";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { Holistic, POSE_CONNECTIONS, FACEMESH_TESSELATION, HAND_CONNECTIONS } from "@mediapipe/holistic";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export default function Home() {
    // face landmark model for blendshapes
    let faceLandmarker;
    async function createFaceLandmarker() {
        const filesetResolver = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");
        faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
            baseOptions: {
                modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                delegate: "GPU"
            },
            outputFaceBlendshapes: true,
            runningMode: "VIDEO",
            numFaces: 1
        });
    }
    createFaceLandmarker();

    // holistic landmark model for body and hands
    const holistic = new Holistic({locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
    }});
    holistic.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    const video = useRef(null);
    const canvas = useRef(null);
    useEffect(() => {
        // draw pose estimation results
        const canvasCtx = canvas.current.getContext('2d');
        holistic.onResults((result) => {
            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvas.current.width, canvas.current.height);
            canvasCtx.drawImage(result.image, 0, 0, canvas.current.width, canvas.current.height);
            drawConnectors(canvasCtx, result.poseLandmarks, POSE_CONNECTIONS, {color: '#00FF00', lineWidth: 4});
            drawLandmarks(canvasCtx, result.poseLandmarks, {color: '#FF0000', lineWidth: 2});
            drawConnectors(canvasCtx, result.faceLandmarks, FACEMESH_TESSELATION, {color: '#C0C0C070', lineWidth: 1});
            drawConnectors(canvasCtx, result.leftHandLandmarks, HAND_CONNECTIONS, {color: '#CC0000', lineWidth: 5});
            drawLandmarks(canvasCtx, result.leftHandLandmarks, {color: '#00FF00', lineWidth: 2});
            drawConnectors(canvasCtx, result.rightHandLandmarks, HAND_CONNECTIONS, {color: '#00CC00', lineWidth: 5});
            drawLandmarks(canvasCtx, result.rightHandLandmarks, {color: '#FF0000', lineWidth: 2});
            canvasCtx.restore();
        });

        let lastVideoTime = -1;
        const camera = new Camera(video.current, {
            onFrame: async () => {
                if (faceLandmarker && lastVideoTime != video.current.currentTime) {
                    lastVideoTime = video.current.currentTime;

                    await holistic.send({image: video.current});

                    const faceResult = faceLandmarker.detectForVideo(video.current, performance.now());
                    console.log(faceResult);
                }
            },
            width: 1280,
            height: 720
        });
        camera.start();

        return function cleanup() {
            camera.stop();
            if (faceLandmarker) {
                faceLandmarker.close();
            }
        };
    });

    return (<>
        <video hidden ref={video} width="1280px" height="720px"></video>
        <canvas ref={canvas} width="1280px" height="720px"></canvas>
    </>);
}
