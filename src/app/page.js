"use client";

import { useEffect, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { Holistic, POSE_CONNECTIONS, FACEMESH_TESSELATION, HAND_CONNECTIONS } from "@mediapipe/holistic";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export default function Home() {
    //const { nodes, materials } = useGLTF("https://models.readyplayer.me/622952275de1ae64c9ebe969.glb?morphTargets=ARKit");
    const { nodes, materials } = useGLTF("/avatar.glb");
    console.log(nodes);
    const meshes = [nodes.EyeLeft, nodes.EyeRight, nodes.Wolf3D_Head, nodes.Wolf3D_Teeth];

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
    // const holistic = new Holistic({locateFile: (file) => {
    //     return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
    // }});
    // holistic.setOptions({
    //     modelComplexity: 1,
    //     smoothLandmarks: true,
    //     minDetectionConfidence: 0.5,
    //     minTrackingConfidence: 0.5
    // });

    const video = useRef(null);
    const canvas = useRef(null);
    useEffect(() => {
        // draw pose estimation results
        // const canvasCtx = canvas.current.getContext('2d');
        // holistic.onResults((result) => {
        //     canvasCtx.save();
        //     canvasCtx.clearRect(0, 0, canvas.current.width, canvas.current.height);
        //     canvasCtx.drawImage(result.image, 0, 0, canvas.current.width, canvas.current.height);
        //     drawConnectors(canvasCtx, result.poseLandmarks, POSE_CONNECTIONS, {color: '#00FF00', lineWidth: 4});
        //     drawLandmarks(canvasCtx, result.poseLandmarks, {color: '#FF0000', lineWidth: 2});
        //     drawConnectors(canvasCtx, result.faceLandmarks, FACEMESH_TESSELATION, {color: '#C0C0C070', lineWidth: 1});
        //     drawConnectors(canvasCtx, result.leftHandLandmarks, HAND_CONNECTIONS, {color: '#CC0000', lineWidth: 5});
        //     drawLandmarks(canvasCtx, result.leftHandLandmarks, {color: '#00FF00', lineWidth: 2});
        //     drawConnectors(canvasCtx, result.rightHandLandmarks, HAND_CONNECTIONS, {color: '#00CC00', lineWidth: 5});
        //     drawLandmarks(canvasCtx, result.rightHandLandmarks, {color: '#FF0000', lineWidth: 2});
        //     canvasCtx.restore();
        // });

        let lastVideoTime = -1;
        const camera = new Camera(video.current, {
            onFrame: async () => {
                if (faceLandmarker && lastVideoTime != video.current.currentTime) {
                    lastVideoTime = video.current.currentTime;

                    //await holistic.send({image: video.current});

                    const faceResult = faceLandmarker.detectForVideo(video.current, performance.now());
                    if (faceResult && faceResult.faceBlendshapes && faceResult.faceBlendshapes.length > 0)
                    {
                        const blendshapeResult = faceResult.faceBlendshapes[0].categories;
                        blendshapeResult.forEach(result => {
                            meshes.forEach(mesh => {
                                const blenshapeIdx = mesh.morphTargetDictionary[result["categoryName"]];
                                if (blenshapeIdx)
                                {
                                    mesh.morphTargetInfluences[blenshapeIdx] = result["score"];
                                }
                            });
                        });
                    }
                }
            },
            width: 1280,
            height: 720
        });
        camera.start();

        return function cleanup() {
            camera.stop();
            //holistic.close();
            if (faceLandmarker) {
                faceLandmarker.close();
            }
        };
    });

    return (<>
        <video ref={video} width="640px" height="360px"></video>
        <canvas hidden ref={canvas} width="640px" height="360px"></canvas>
        <div style={{ width: "50vw", height: "50vh" }}>
            <Canvas>
                <ambientLight intensity={0.1} />
                <directionalLight position={[0, 0, 1]} />
                <primitive object={nodes.Scene} position={[0, -17.5, 0]} scale={[10, 10, 10]} />
            </Canvas>
        </div>
    </>);
}
