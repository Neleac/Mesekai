'use client';

import { useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

import { Camera } from '@mediapipe/camera_utils';
import { FaceLandmarker, PoseLandmarker, HandLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';

const DEVICE = 'GPU';
const CAM_HEIGHT = 720, CAM_WIDTH = 1280;

export default function Home() {
    // avatar
    // const { nodes, materials } = useGLTF('https://models.readyplayer.me/622952275de1ae64c9ebe969.glb?morphTargets=ARKit');
    // const { nodes, materials } = useGLTF('/avatar.glb');
    // console.log(nodes);
    // const meshes = [nodes.EyeLeft, nodes.EyeRight, nodes.Wolf3D_Head, nodes.Wolf3D_Teeth];

    // face, pose, hands landmark detection models
    let faceTracker, poseTracker, handTracker;
    async function createTrackers() {
        const filesetResolver = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm');
        
        faceTracker = await FaceLandmarker.createFromOptions(filesetResolver, {
            baseOptions: {
                modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
                delegate: DEVICE
            },
            runningMode: 'VIDEO',
            outputFaceBlendshapes: true
        });

        poseTracker = await PoseLandmarker.createFromOptions(filesetResolver, {
            baseOptions: {
                modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
                delegate: DEVICE
            },
            runningMode: 'VIDEO'
        });

        handTracker = await HandLandmarker.createFromOptions(filesetResolver, {
            baseOptions: {
                modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
                delegate: DEVICE
            },
            runningMode: 'VIDEO',
            numHands: 2
        });
    }
    createTrackers();

    const video = useRef(null);
    const canvas = useRef(null);
    useEffect(() => {
        const canvasCtx = canvas.current.getContext('2d');
        const drawingUtils = new DrawingUtils(canvasCtx);
        let lastVideoTime = -1;

        const camera = new Camera(video.current, {
            onFrame: async () => {
                if (lastVideoTime != video.current.currentTime) {
                    lastVideoTime = video.current.currentTime;

                    canvasCtx.save();
                    canvasCtx.clearRect(0, 0, canvas.current.width, canvas.current.height);

                    if (faceTracker) {
                        const result = faceTracker.detectForVideo(video.current, performance.now());
                        if (result) {
                            if (result.faceLandmarks) {
                                for (const landmarks of result.faceLandmarks) {
                                    drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION, { color: '#C0C0C070', lineWidth: 1 });
                                    drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE, { color: 'cyan' });
                                    drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW, { color: 'cyan' });
                                    drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYE, { color: 'cyan' });
                                    drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW, { color: 'cyan' });
                                    drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, { color: '#E0E0E0' });
                                    drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LIPS, { color: 'cyan' });
                                    drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS, { color: 'cyan' });
                                    drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS, { color: 'cyan' });
                                }
                            }

                            // if (result.faceBlendshapes && result.faceBlendshapes.length > 0) {
                            //     const blendshapes = result.faceBlendshapes[0].categories;
                            //     blendshapes.forEach(blendshape => {
                            //         meshes.forEach(mesh => {
                            //             const blenshapeIdx = mesh.morphTargetDictionary[blendshape['categoryName']];
                            //             if (blenshapeIdx) {
                            //                 mesh.morphTargetInfluences[blenshapeIdx] = blendshape['score'];
                            //             }
                            //         });
                            //     });
                            // }
                        }
                    }

                    if (poseTracker) {
                        const result = poseTracker.detectForVideo(video.current, performance.now());
                        if (result) {
                            for (const landmark of result.landmarks) {
                                drawingUtils.drawLandmarks(landmark, {radius: (data) => DrawingUtils.lerp(data.from.z, -0.15, 0.1, 5, 1)});
                                drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS);
                            }
                        }
                    }

                    if (handTracker) {
                        const result = handTracker.detectForVideo(video.current, performance.now());
                        if (result) {
                            for (const landmark of result.landmarks) {
                                drawingUtils.drawLandmarks(landmark, {radius: (data) => DrawingUtils.lerp(data.from.z, -0.15, 0.1, 5, 1), color: 'green'});
                                drawingUtils.drawConnectors(landmark, HandLandmarker.HAND_CONNECTIONS, { color: 'lime' });
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
            if (poseTracker) {
                poseTracker.close();
            }
            if (handTracker) {
                handTracker.close();
            }
        };
    });

    return (
        <div style={{ position: 'relative' }}>
            <video ref={video} width={CAM_WIDTH} height={CAM_HEIGHT}></video>
            <canvas ref={canvas} width={CAM_WIDTH} height={CAM_HEIGHT} style={{ position: 'absolute', top: 0, left: 0 }}></canvas>
        </div>
    );

    // return (<>
    //     <video ref={video} width='640px' height='360px'></video>
    //     <canvas hidden ref={canvas} width='640px' height='360px'></canvas>
    //     <div style={{ width: '50vw', height: '50vh' }}>
    //         <Canvas>
    //             <ambientLight intensity={0.1} />
    //             <directionalLight position={[0, 0, 1]} />
    //             <primitive object={nodes.Scene} position={[0, -17.5, 0]} scale={[10, 10, 10]} />
    //         </Canvas>
    //     </div>
    // </>);
}
