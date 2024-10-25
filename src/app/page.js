'use client';

import { Camera } from '@mediapipe/camera_utils';
import { FaceLandmarker, PoseLandmarker, HandLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';
import { useEffect, useRef } from 'react';
import { useGLTF, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Euler, Matrix4, Quaternion, Vector3, Matrix3 } from 'three';

const DEVICE = 'GPU';
const CAM_HEIGHT = 720, CAM_WIDTH = 1280;

// landmark indiceS
const lSHOULDER = 11;
const rSHOULDER = 12;
const lELBOW = 13;
const rELBOW = 14;
const lWRIST = 15;
const rWRIST = 16;
const lPINKY = 17;
const rPINKY = 18;
const lINDEX = 19;
const rINDEX = 20;
const lHIP = 23;
const rHIP = 24;

const SMOOTHING = 0.5;

function rotateBone(userJoint, userChild, avatarChild, basis) {
    // change of basis: world -> local
    let userLimb = userChild.clone().sub(userJoint).applyMatrix3(basis.invert()).normalize();
    let avatarLimb = avatarChild.clone().normalize();
    return new Quaternion().setFromUnitVectors(avatarLimb, userLimb);
}

function updateBasis(rotation, xAxis, yAxis, zAxis, basis) {
    xAxis.applyQuaternion(rotation);
    yAxis.applyQuaternion(rotation);
    zAxis.applyQuaternion(rotation);
    basis.set(
        xAxis.x, yAxis.x, zAxis.x,
        xAxis.y, yAxis.y, zAxis.y,
        xAxis.z, yAxis.z, zAxis.z
    );
}

export default function Home() {
    // avatar
    // const { nodes, materials } = useGLTF('https://models.readyplayer.me/622952275de1ae64c9ebe969.glb?morphTargets=ARKit');
    const { nodes, materials } = useGLTF('/avatar.glb');
    const meshes = [nodes.EyeLeft, nodes.EyeRight, nodes.Wolf3D_Head, nodes.Wolf3D_Teeth];
    console.log(nodes);

    nodes.RightShoulder.quaternion.identity();

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
                            // video overlay
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
                        if (result) {
                            // video overlay
                            for (const landmark of result.landmarks) {
                                drawingUtils.drawLandmarks(landmark, {radius: CAM_HEIGHT / 1000});
                                drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS, { color: 'lime', lineWidth: CAM_HEIGHT / 500 });
                            }

                            // solve pose
                            if (result.worldLandmarks && result.worldLandmarks.length > 0) {
                                // reset avatar pose
                                //nodes.RightArm.quaternion.identity();
                                
                                // cache landmarks
                                const landmarks = [];
                                for (const worldLandmark of result.worldLandmarks[0]) {
                                    landmarks.push(new Vector3(worldLandmark.x, worldLandmark.y, worldLandmark.z).negate());
                                }

                                let shoulderX = landmarks[rSHOULDER].clone().sub(landmarks[lSHOULDER]).normalize();
                                let shoulderY = landmarks[rSHOULDER].clone().lerp(landmarks[lSHOULDER], 0.5).normalize();
                                let shoulderZ = shoulderX.clone().cross(shoulderY).normalize();
                        
                                // left arm
                                let xAxis = shoulderX.clone();
                                let yAxis = shoulderY.clone();
                                let zAxis = shoulderZ.clone();
                                let basis = new Matrix3(
                                    xAxis.x, yAxis.x, zAxis.x,
                                    xAxis.y, yAxis.y, zAxis.y,
                                    xAxis.z, yAxis.z, zAxis.z
                                );
                        
                                let rot = rotateBone(landmarks[lSHOULDER], landmarks[lELBOW], nodes.RightForeArm.position, basis);
                                nodes.RightArm.quaternion.slerp(rot, SMOOTHING);
                                updateBasis(nodes.RightArm.quaternion, xAxis, yAxis, zAxis, basis);

                                rot = rotateBone(landmarks[lELBOW], landmarks[lWRIST], nodes.RightHand.position, basis);
                                nodes.RightForeArm.quaternion.slerp(rot, SMOOTHING);
                                updateBasis(nodes.RightForeArm.quaternion, xAxis, yAxis, zAxis, basis);

                                let lFingersLm = landmarks[lPINKY].lerp(landmarks[lINDEX], 0.5);
                                rot = rotateBone(landmarks[lWRIST], lFingersLm, nodes.RightHandMiddle1.position, basis);
                                nodes.RightHand.quaternion.slerp(rot, SMOOTHING);
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
