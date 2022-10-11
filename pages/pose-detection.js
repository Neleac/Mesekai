import React, {useEffect, useRef} from "react";
import styles from '../styles/PoseDetection.module.css'

import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { Holistic, POSE_CONNECTIONS, FACEMESH_TESSELATION, HAND_CONNECTIONS } from "@mediapipe/holistic";

export default function PoseDetection() {
    const preload = useRef(null);
    const videoInput = useRef(null);
    const canvas = useRef(null);

    useEffect(() => {
        const canvasCtx = canvas.current.getContext('2d');

        const holistic = new Holistic({locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
        }});

        holistic.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        holistic.onResults((result) => {
            preload.current.hidden = true;

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

        const camera = new Camera(videoInput.current, {
            onFrame: async () => {
                await holistic.send({image: videoInput.current});
            },
            width: 1280,
            height: 720
        });
        camera.start();

        return function cleanup() {
            detector.close();
            camera.stop();
        };
    });

    return (
        <div id="pose-detection">
            <div ref={preload}>
                <h1 id="loading-text">Loading Pose Detection...</h1>
                <video ref={videoInput} className={styles.video} width="1280px" height="720px"></video>
            </div>
            <canvas ref={canvas} className={styles.canvas} width="1280px" height="720px"></canvas>
        </div>
    );
}
