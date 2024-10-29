'use client';

import { Camera } from '@mediapipe/camera_utils';
import { FaceLandmarker, PoseLandmarker, HandLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';
import { useEffect, useRef } from 'react';
import { useGLTF, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Euler, Matrix4, Quaternion, Vector3, Matrix3 } from 'three';

// hardware configuration
const DEVICE = 'GPU';
const CAM_HEIGHT = 720;
const CAM_WIDTH = 1280;

// landmark indices
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

const WRIST = 0;
const INDEX = 5;
const MIDDLE = 9;
const RING = 13;
const PINKY = 17;

const SMOOTHING = 0.5;

function createPoseAxes(axes, xAxis, yAxis, zAxis, fromShoulderLm, toShoulderLm) {
    yAxis.copy(toShoulderLm.clone().sub(fromShoulderLm).normalize());
    zAxis.copy(toShoulderLm.clone().lerp(fromShoulderLm, 0.5).negate().normalize());
    xAxis.copy(yAxis.clone().cross(zAxis).normalize());
    axes.set(
        xAxis.x, yAxis.x, zAxis.x,
        xAxis.y, yAxis.y, zAxis.y,
        xAxis.z, yAxis.z, zAxis.z
    );
}

function updateAxes(axes, xAxis, yAxis, zAxis, rotWorld, userLimbWorld) {
    rotWorld.setFromUnitVectors(yAxis, userLimbWorld);
    xAxis.applyQuaternion(rotWorld);
    yAxis.applyQuaternion(rotWorld);
    zAxis.applyQuaternion(rotWorld);
    axes.set(
        xAxis.x, yAxis.x, zAxis.x,
        xAxis.y, yAxis.y, zAxis.y,
        xAxis.z, yAxis.z, zAxis.z
    );
}

function solveRotation(avatarBone, parentLm, childLm, userLimbWorld, userLimbLocal, avatarLimbLocal, rotLocal, axes) {
    userLimbWorld.copy(childLm.clone().sub(parentLm)).normalize();
    userLimbLocal.copy(userLimbWorld).applyMatrix3(axes.invert()).normalize();
    rotLocal.setFromUnitVectors(avatarLimbLocal, userLimbLocal);
    avatarBone.quaternion.slerp(rotLocal, SMOOTHING);
}

export default function Home() {
    // avatar
    // const { nodes, materials } = useGLTF('https://models.readyplayer.me/622952275de1ae64c9ebe969.glb?morphTargets=ARKit');
    const { nodes, materials } = useGLTF('/avatar.glb');
    const meshes = [nodes.EyeLeft, nodes.EyeRight, nodes.Wolf3D_Head, nodes.Wolf3D_Teeth];
    console.log(nodes);

    nodes.RightHandIndex1.rotation.set(0, 0, 0);

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

        // poseTracker = await PoseLandmarker.createFromOptions(filesetResolver, {
        //     baseOptions: {
        //         modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
        //         delegate: DEVICE
        //     },
        //     runningMode: 'VIDEO'
        // });

        handTracker = await HandLandmarker.createFromOptions(filesetResolver, {
            baseOptions: {
                modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
                delegate: DEVICE
            },
            runningMode: 'VIDEO',
            numHands: 2,
            min_hand_detection_confidence: 0.95,
            min_hand_presence_confidence: 0.95
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
                                    // mirror left and right
                                    let blendshapeName = blendshape['categoryName'];
                                    if (blendshapeName.endsWith('Left')) {
                                        blendshapeName = blendshapeName.slice(0, -4) + 'Right';
                                    } else if (blendshapeName.endsWith('Right')) {
                                        blendshapeName = blendshapeName.slice(0, -5) + 'Left';
                                    }

                                    // apply to all affected meshes (e.g. face, teeth, etc.)
                                    for (const mesh of meshes) {
                                        const blenshapeIdx = mesh.morphTargetDictionary[blendshapeName];
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
                                nodes.Head.rotation.set(rotation.x, -rotation.y, -rotation.z);
                                nodes.Neck.rotation.set(rotation.x / 5, -rotation.y / 5, -rotation.z / 5);
                                nodes.Spine2.rotation.set(rotation.x / 10, -rotation.y / 10, -rotation.z / 10);
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

                            // solve and apply pose
                            if (result.worldLandmarks && result.worldLandmarks.length > 0) {                               
                                // cache landmarks
                                const landmarks = [];
                                for (const worldLandmark of result.worldLandmarks[0]) {
                                    landmarks.push(new Vector3(worldLandmark.x, worldLandmark.y, worldLandmark.z).negate());
                                }
                                landmarks[lINDEX].lerp(landmarks[lPINKY], 0.5);
                                landmarks[rINDEX].lerp(landmarks[rPINKY], 0.5);

                                // cache transforms to avoid reallocation
                                const axes = new Matrix3();
                                const xAxis = new Vector3(), yAxis = new Vector3(), zAxis = new Vector3();
                                const rotWorld = new Quaternion(), rotLocal = new Quaternion();
                                const userLimbWorld = new Vector3(), userLimbLocal = new Vector3();
                                const avatarLimbLocal = new Vector3(0, 1, 0);

                                // user left arm, avatar right arm
                                createPoseAxes(axes, xAxis, yAxis, zAxis, landmarks[rSHOULDER], landmarks[lSHOULDER])
                                solveRotation(nodes.RightArm, landmarks[lSHOULDER], landmarks[lELBOW], userLimbWorld, userLimbLocal, avatarLimbLocal, rotLocal, axes);
                                updateAxes(axes, xAxis, yAxis, zAxis, rotWorld, userLimbWorld);
                                solveRotation(nodes.RightForeArm, landmarks[lELBOW], landmarks[lWRIST], userLimbWorld, userLimbLocal, avatarLimbLocal, rotLocal, axes);
                                updateAxes(axes, xAxis, yAxis, zAxis, rotWorld, userLimbWorld);
                                solveRotation(nodes.RightHand, landmarks[lWRIST], landmarks[lINDEX], userLimbWorld, userLimbLocal, avatarLimbLocal, rotLocal, axes);

                                // user right arm, avatar left arm
                                createPoseAxes(axes, xAxis, yAxis, zAxis, landmarks[lSHOULDER], landmarks[rSHOULDER])
                                solveRotation(nodes.LeftArm, landmarks[rSHOULDER], landmarks[rELBOW], userLimbWorld, userLimbLocal, avatarLimbLocal, rotLocal, axes);
                                updateAxes(axes, xAxis, yAxis, zAxis, rotWorld, userLimbWorld);
                                solveRotation(nodes.LeftForeArm, landmarks[rELBOW], landmarks[rWRIST], userLimbWorld, userLimbLocal, avatarLimbLocal, rotLocal, axes);
                                updateAxes(axes, xAxis, yAxis, zAxis, rotWorld, userLimbWorld);
                                solveRotation(nodes.LeftHand, landmarks[rWRIST], landmarks[rINDEX], userLimbWorld, userLimbLocal, avatarLimbLocal, rotLocal, axes);
                            }
                        }
                    }

                    if (handTracker) {
                        const result = handTracker.detectForVideo(video.current, performance.now());
                        if (result) {
                            // video overlay
                            for (const landmark of result.landmarks) {
                                drawingUtils.drawLandmarks(landmark, {color: 'green', radius: CAM_HEIGHT / 1000 });
                                drawingUtils.drawConnectors(landmark, HandLandmarker.HAND_CONNECTIONS, { color: 'lime', lineWidth: CAM_HEIGHT / 1000 });
                            }

                            // cache transforms to avoid reallocation
                            const axes = new Matrix3();
                            const xAxis = new Vector3(), yAxis = new Vector3(), zAxis = new Vector3();
                            const rotWorld = new Quaternion(), rotLocal = new Quaternion();
                            const userLimbWorld = new Vector3(), userLimbLocal = new Vector3();
                            const avatarLimbLocal = new Vector3(0, 1, 0);

                            for (let handIdx = 0; handIdx < result.handedness.length; handIdx++) {
                                const landmarks = [];
                                for (const worldLandmark of result.worldLandmarks[handIdx]) {
                                    landmarks.push(new Vector3(worldLandmark.x, worldLandmark.y, worldLandmark.z).negate());
                                }

                                if (result.handedness[handIdx][0]["categoryName"] == 'Left') {
                                    xAxis.copy(landmarks[INDEX].clone().sub(landmarks[MIDDLE]).normalize());
                                    yAxis.copy(landmarks[INDEX].clone().sub(landmarks[WRIST]).normalize());
                                    zAxis.copy(xAxis.clone().cross(yAxis).normalize());
                                    axes.set(
                                        xAxis.x, yAxis.x, zAxis.x,
                                        xAxis.y, yAxis.y, zAxis.y,
                                        xAxis.z, yAxis.z, zAxis.z
                                    );

                                    let avatarBone = nodes.RightHandIndex1;
                                    for (let jointIdx = INDEX; ; jointIdx++) {

                                        userLimbWorld.copy(landmarks[jointIdx + 1].clone().sub(landmarks[jointIdx]).normalize());
                                        userLimbLocal.copy(userLimbWorld).applyMatrix3(axes.invert()).normalize();
                                        rotLocal.setFromUnitVectors(new Vector3(0, 1, 0), userLimbLocal);
                                        avatarBone.quaternion.slerp(rotLocal, SMOOTHING);

                                        if (jointIdx == INDEX + 2) {
                                            break;
                                        }

                                        avatarBone = avatarBone.children[0];
                                        updateAxes(axes, xAxis, yAxis, zAxis, rotWorld, userLimbWorld)
                                    }
                                } 
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
