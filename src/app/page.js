'use client';

import { Camera } from '@mediapipe/camera_utils';
import { FaceLandmarker, PoseLandmarker, HandLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';
import { useEffect, useRef, useState } from 'react';
import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

import Avatar from '@/components/avatar';

// hardware configuration
const DEVICE = 'GPU';
const MODE = 'VIDEO';
const CAM_HEIGHT = 720;
const CAM_WIDTH = 1280;

let trackersCreated = false;
let faceTracker, bodyTracker, handTracker;
async function createTrackers() {
    const filesetResolver = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm');
    
    faceTracker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: DEVICE
        },
        runningMode: MODE,
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: true
    });

    bodyTracker = await PoseLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
            delegate: DEVICE
        },
        runningMode: MODE
    });

    handTracker = await HandLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: DEVICE
        },
        runningMode: MODE,
        numHands: 2,
        min_hand_detection_confidence: 0.95,
        min_hand_presence_confidence: 0.95
    });
}

export default function Home() {
    const [faceTrackingResult, setFaceTrackingResult] = useState(null);
    const [bodyTrackingResult, setBodyTrackingResult] = useState(null);
    const [handTrackingResult, setHandTrackingResult] = useState(null);

    const video = useRef(null);
    const canvas = useRef(null);
    useEffect(() => {
        const canvasCtx = canvas.current.getContext('2d');
        const drawingUtils = new DrawingUtils(canvasCtx);
        let lastVideoTime = -1;
        let trackingResult;
        
        const camera = new Camera(video.current, {
            onFrame: async () => {
                if (!trackersCreated) {
                    await createTrackers();
                    trackersCreated = true;
                }

                if (lastVideoTime != video.current.currentTime) {
                    lastVideoTime = video.current.currentTime;

                    canvasCtx.save();
                    canvasCtx.clearRect(0, 0, canvas.current.width, canvas.current.height);

                    if (faceTracker) {
                        trackingResult = faceTracker.detectForVideo(video.current, performance.now());
                        if (trackingResult) {
                            setFaceTrackingResult(trackingResult);

                            // video overlay
                            if (trackingResult.faceLandmarks) {
                                for (const landmarks of trackingResult.faceLandmarks) {
                                    drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION, { color: '#C0C0C070', lineWidth: CAM_HEIGHT / 1000 });
                                    drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE, { color: 'cyan', lineWidth: CAM_HEIGHT / 1000 });
                                    drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW, { color: 'cyan', lineWidth: CAM_HEIGHT / 1000 });
                                    drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYE, { color: 'cyan', lineWidth: CAM_HEIGHT / 1000 });
                                    drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW, { color: 'cyan', lineWidth: CAM_HEIGHT / 1000 });
                                    drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, { color: '#E0E0E0', lineWidth: CAM_HEIGHT / 1000 });
                                    drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LIPS, { color: 'cyan', lineWidth: CAM_HEIGHT / 1000 });
                                    drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS, { color: 'cyan', lineWidth: CAM_HEIGHT / 1000 });
                                    drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS, { color: 'cyan', lineWidth: CAM_HEIGHT / 1000 });
                                }
                            }
                        }
                    }

                    if (bodyTracker) {
                        trackingResult = bodyTracker.detectForVideo(video.current, performance.now());
                        if (trackingResult) {
                            setBodyTrackingResult(trackingResult);

                            // video overlay
                            for (const landmark of trackingResult.landmarks) {
                                drawingUtils.drawLandmarks(landmark, {radius: CAM_HEIGHT / 1000});
                                drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS, { color: 'lime', lineWidth: CAM_HEIGHT / 500 });
                            }
                        }
                    }

                    if (handTracker) {
                        trackingResult = handTracker.detectForVideo(video.current, performance.now());
                        if (trackingResult) {
                            setHandTrackingResult(trackingResult);

                            // video overlay
                            for (const landmark of trackingResult.landmarks) {
                                drawingUtils.drawLandmarks(landmark, {color: 'green', radius: CAM_HEIGHT / 1000 });
                                drawingUtils.drawConnectors(landmark, HandLandmarker.HAND_CONNECTIONS, { color: 'lime', lineWidth: CAM_HEIGHT / 1000 });
                            }
                        }
                    }

                    canvasCtx.restore();
                }
            },
            width: CAM_WIDTH,
            height: CAM_HEIGHT
        });
        camera.start();

        return function cleanup() {
            camera.stop();
            if (faceTracker) {
                faceTracker.close();
            }
            if (bodyTracker) {
                bodyTracker.close();
            }
            if (handTracker) {
                handTracker.close();
            }
        };
    }, []);

    return (
        <div style={{ display: 'flex' }}>
            <div style={{ position: 'relative', width: CAM_WIDTH, height: CAM_HEIGHT }}>
                <video ref={video} width={CAM_WIDTH} height={CAM_HEIGHT} style={{ width: '100%', transform: 'scaleX(-1)' }}></video>
                <canvas ref={canvas} width={CAM_WIDTH} height={CAM_HEIGHT} style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: 'scaleX(-1)' }}></canvas>
            </div>
            <Canvas style={{ width: '100vw', height: '100vh' }} >
                <color attach='background' args={['grey']} />
                <ambientLight intensity={0.1} />
                <directionalLight position={[0, 0, 1]} />
                <Avatar 
                    userFace={faceTrackingResult} 
                    userBody={bodyTrackingResult}
                    userHands={handTrackingResult}
                />
                <OrbitControls />
            </Canvas>
        </div>
    );
}
