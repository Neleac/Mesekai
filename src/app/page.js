'use client';

import { Camera } from '@mediapipe/camera_utils';
import { FaceLandmarker, PoseLandmarker, HandLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';
import { useEffect, useRef } from 'react';
import { useGLTF, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Euler, Matrix4, Quaternion, Vector3 } from 'three';

const DEVICE = 'GPU';
const CAM_HEIGHT = 720, CAM_WIDTH = 1280;

// landmark indiceS
const LEFTSHOULDER = 11;
const RIGHTSHOULDER = 12;
const LEFTELBOW = 13;
const RIGHTELBOW = 14;
const LEFTWRIST = 15;
const RIGHTWRIST = 16;
const LEFTFINGER = 19;
const RIGHTFINGER = 20;
const LEFTHIP = 23;
const RIGHTHIP = 24;

export default function Home() {
    // avatar
    // const { nodes, materials } = useGLTF('https://models.readyplayer.me/622952275de1ae64c9ebe969.glb?morphTargets=ARKit');
    const { nodes, materials } = useGLTF('/avatar.glb');
    const meshes = [nodes.EyeLeft, nodes.EyeRight, nodes.Wolf3D_Head, nodes.Wolf3D_Teeth];
    console.log(nodes);

    // face, pose, hands landmark detection models
    let faceTracker, poseTracker, handTracker;
    async function createTrackers() {
        const filesetResolver = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm');
        
        // faceTracker = await FaceLandmarker.createFromOptions(filesetResolver, {
        //     baseOptions: {
        //         modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
        //         delegate: DEVICE
        //     },
        //     runningMode: 'VIDEO',
        //     outputFaceBlendshapes: true,
        //     outputFacialTransformationMatrixes: true
        // });

        poseTracker = await PoseLandmarker.createFromOptions(filesetResolver, {
            baseOptions: {
                modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
                delegate: DEVICE
            },
            runningMode: 'VIDEO'
        });

        // handTracker = await HandLandmarker.createFromOptions(filesetResolver, {
        //     baseOptions: {
        //         modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
        //         delegate: DEVICE
        //     },
        //     runningMode: 'VIDEO',
        //     numHands: 2
        // });
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

                            // facial expressions
                            if (result.faceBlendshapes && result.faceBlendshapes.length > 0) {
                                for (const blendshape of result.faceBlendshapes[0].categories) {
                                    for (const mesh of meshes) {
                                        const blenshapeIdx = mesh.morphTargetDictionary[blendshape['categoryName']];
                                        if (blenshapeIdx) {
                                            mesh.morphTargetInfluences[blenshapeIdx] = blendshape['score'];
                                        }
                                    }
                                }
                            }

                            // head rotation
                            if (result.facialTransformationMatrixes && result.facialTransformationMatrixes.length > 0) {
                                const matrix = new Matrix4().fromArray(result.facialTransformationMatrixes[0].data);
                                const rotation = new Euler().setFromRotationMatrix(matrix);
                                nodes.Head.rotation.set(rotation.x, rotation.y, rotation.z);
                                nodes.Neck.rotation.set(rotation.x / 5, rotation.y / 5, rotation.z / 5);
                                nodes.Spine2.rotation.set(rotation.x / 10, rotation.y / 10, rotation.z / 10);
                            }
                        }
                    }

                    if (poseTracker) {
                        const result = poseTracker.detectForVideo(video.current, performance.now());
                        //console.log(result);
                        if (result) {
                            for (const landmark of result.landmarks) {
                                drawingUtils.drawLandmarks(landmark, {radius: CAM_HEIGHT / 1000});
                                drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS, { lineWidth: CAM_HEIGHT / 1000 });
                            }

                            if (result.worldLandmarks && result.worldLandmarks.length > 0) {
                                let lShoulderLm = new Vector3(-result.worldLandmarks[0][LEFTSHOULDER].x, -result.worldLandmarks[0][LEFTSHOULDER].y, -result.worldLandmarks[0][LEFTSHOULDER].z);
                                let rShoulderLm = new Vector3(-result.worldLandmarks[0][RIGHTSHOULDER].x, -result.worldLandmarks[0][RIGHTSHOULDER].y, -result.worldLandmarks[0][RIGHTSHOULDER].z);
                                let lElbowLm = new Vector3(-result.worldLandmarks[0][LEFTELBOW].x, -result.worldLandmarks[0][LEFTELBOW].y, -result.worldLandmarks[0][LEFTELBOW].z);
                                let lHipLm = new Vector3(-result.worldLandmarks[0][LEFTHIP].x, -result.worldLandmarks[0][LEFTHIP].y, -result.worldLandmarks[0][LEFTHIP].z);
                                let rHipLm = new Vector3(-result.worldLandmarks[0][RIGHTHIP].x, -result.worldLandmarks[0][RIGHTHIP].y, -result.worldLandmarks[0][RIGHTHIP].z);

                                let v_spineLm = lShoulderLm.clone().add(rShoulderLm).divideScalar(2).sub(lHipLm.clone().add(rHipLm).divideScalar(2)).normalize();
                                let spine1TfPos = new Vector3(), spine2TfPos = new Vector3();
                                nodes.Spine1.getWorldPosition(spine1TfPos);
                                nodes.Spine2.getWorldPosition(spine2TfPos);
                                const v_spineTf = spine2TfPos.sub(spine1TfPos).normalize();

                                let rot = new Quaternion().setFromUnitVectors(v_spineLm, v_spineTf);
                                v_spineLm.applyQuaternion(rot);
                                let v_lBicepLm = lElbowLm.clone().sub(lShoulderLm).normalize();
                                v_lBicepLm.applyQuaternion(rot);
                                rot.setFromUnitVectors(v_spineLm, v_lBicepLm);
                                rot = nodes.RightShoulder.quaternion.clone().invert().multiply(rot);
                                nodes.RightArm.quaternion.slerp(rot, 0.5);
                            }
                        }
                    }

                    if (handTracker) {
                        const result = handTracker.detectForVideo(video.current, performance.now());
                        if (result) {
                            for (const landmark of result.landmarks) {
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
            if (poseTracker) {
                poseTracker.close();
            }
            if (handTracker) {
                handTracker.close();
            }
        };
    });

    return (
        <div style={{ display: 'flex' }}>
            <div style={{ position: 'relative', width: CAM_WIDTH, height: CAM_HEIGHT }}>
                <video ref={video} width={CAM_WIDTH} height={CAM_HEIGHT} style={{ width: '100%', width: '100%', transform: 'scaleX(-1)' }}></video>
                <canvas ref={canvas} width={CAM_WIDTH} height={CAM_HEIGHT} style={{ position: 'absolute', top: 0, left: 0, width: '100%', width: '100%', transform: 'scaleX(-1)' }}></canvas>
            </div>
            <Canvas style={{ width: '100vw', height: '100vh' }} >
                <OrbitControls />
                <ambientLight intensity={0.1} />
                <directionalLight position={[0, 0, 1]} />
                <primitive object={nodes.Scene} position={[0, -7.5, 0]} scale={[5, 5, 5]} />
            </Canvas>
        </div>
    );
}
