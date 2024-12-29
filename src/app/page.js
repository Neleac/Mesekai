'use client'

import { Camera } from '@mediapipe/camera_utils'
import { DrawingUtils } from '@mediapipe/tasks-vision'
import { useEffect, useRef, useState } from 'react'
import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'

import Avatar from '@/components/avatar'
import { createTrackers, drawFaceLandmarks, drawBodyLandmarks, drawHandLandmarks } from '@/utils/tracker'


const CAM_HEIGHT = 720
const CAM_WIDTH = 1280

let trackersCreated = false
let faceTracker, bodyTracker, handTracker


export default function Home() {
    const [faceTrackingResult, setFaceTrackingResult] = useState(null)
    const [bodyTrackingResult, setBodyTrackingResult] = useState(null)
    const [handTrackingResult, setHandTrackingResult] = useState(null)

    const video = useRef(null)
    const canvas = useRef(null)
    useEffect(() => {
        const canvasCtx = canvas.current.getContext('2d')
        const drawingUtils = new DrawingUtils(canvasCtx)
        let lastVideoTime = -1
        let trackingResult
        
        const camera = new Camera(video.current, {
            onFrame: async () => {
                if (!trackersCreated) {
                    [faceTracker, bodyTracker, handTracker] = await createTrackers()
                    trackersCreated = true
                }

                if (lastVideoTime != video.current.currentTime) {
                    lastVideoTime = video.current.currentTime

                    canvasCtx.save()
                    canvasCtx.clearRect(0, 0, canvas.current.width, canvas.current.height)

                    trackingResult = faceTracker.detectForVideo(video.current, performance.now())
                    setFaceTrackingResult(trackingResult)
                    drawFaceLandmarks(trackingResult.faceLandmarks, drawingUtils, CAM_HEIGHT / 1000)

                    trackingResult = bodyTracker.detectForVideo(video.current, performance.now())
                    setBodyTrackingResult(trackingResult)
                    drawBodyLandmarks(trackingResult.landmarks, drawingUtils, CAM_HEIGHT / 1000, CAM_HEIGHT / 500)

                    trackingResult = handTracker.detectForVideo(video.current, performance.now())
                    setHandTrackingResult(trackingResult)
                    drawHandLandmarks(trackingResult.landmarks, drawingUtils, CAM_HEIGHT / 1000, CAM_HEIGHT / 1000)

                    canvasCtx.restore()
                }
            },
            width: CAM_WIDTH,
            height: CAM_HEIGHT
        })
        camera.start()

        return function cleanup() {
            camera.stop()
            if (faceTracker) {
                faceTracker.close()
            }
            if (bodyTracker) {
                bodyTracker.close()
            }
            if (handTracker) {
                handTracker.close()
            }
        }
    }, [])

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
    )
}
