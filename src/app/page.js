'use client'

import { Button, Radio, Dropdown, Space } from 'antd'
import { DownOutlined, SmileOutlined, UserOutlined } from '@ant-design/icons'

import { Camera } from '@mediapipe/camera_utils'
import { DrawingUtils } from '@mediapipe/tasks-vision'
import { useEffect, useRef, useState } from 'react'
import { Environment, OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { AvatarCreator } from '@readyplayerme/react-avatar-creator'

import Avatar from '@/components/avatar'
import {
    createTrackers,
    drawFaceLandmarks,
    drawBodyLandmarks,
    drawHandLandmarks,
} from '@/utils/tracker'


const CAM_HEIGHT = 720
const CAM_WIDTH = 1280

let trackersCreated = false
let faceTracker, bodyTracker, handTracker

const environments = [
    { label: 'apartment', key: 'apartment' },
    { label: 'city', key: 'city' },
    { label: 'dawn', key: 'dawn' },
    { label: 'forest', key: 'forest' },
    { label: 'lobby', key: 'lobby' },
    { label: 'night', key: 'night' },
    { label: 'park', key: 'park' },
    { label: 'studio', key: 'studio' },
    { label: 'sunset', key: 'sunset' },
    { label: 'warehouse', key: 'warehouse' },
]


export default function Home() {
    const [inMesekai, setInMesekai] = useState(true)
    const [avatarUrl, setAvatarUrl] = useState(
        'https://models.readyplayer.me/622952275de1ae64c9ebe969.glb?morphTargets=ARKit'
    )
    const [faceTrackingResult, setFaceTrackingResult] = useState(null)
    const [bodyTrackingResult, setBodyTrackingResult] = useState(null)
    const [handTrackingResult, setHandTrackingResult] = useState(null)
    const [environment, setEnvironment] = useState('sunset')

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
        <>
            <video hidden ref={video}></video>
            <canvas hidden ref={canvas}></canvas>

            {inMesekai && (
                <div
                    style={{
                        position: 'relative',
                        width: '100%',
                        height: '100vh',
                    }}
                >
                    {/* Avatar scene */}
                    <Canvas
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                        }}
                    >
                        <Avatar
                            avatarUrl={avatarUrl}
                            userFace={faceTrackingResult}
                            userBody={bodyTrackingResult}
                            userHands={handTrackingResult}
                        />
                        <Environment preset={environment} background={true} />
                        <OrbitControls />
                    </Canvas>

                    {/* Environment selector */}
                    <Dropdown
                        menu={{
                            items: environments,
                            onClick: (event) => {
                                setEnvironment(event.key)
                            },
                        }}
                    >
                        <Button>
                            <Space>
                                Environment
                                <DownOutlined />
                            </Space>
                        </Button>
                    </Dropdown>
                </div>
            )}

            {!inMesekai && (
                <AvatarCreator
                    subdomain='mesekai-ptasby'
                    config={{
                        bodyType: 'fullbody',
                        quickStart: true,
                        language: 'en',
                        clearCache: false,
                    }}
                    style={{
                        width: '100%',
                        height: '100vh',
                        border: 'none',
                    }}
                    onAvatarExported={(event) => {
                        setAvatarUrl(`${event.data.url}?morphTargets=ARKit`)
                        setInMesekai(true)
                    }}
                />
            )}

            {/* AvatarCreator toggle */}
            <Radio.Group
                style={{ position: 'absolute', top: '1%', left: '45%' }}
                value={inMesekai}
                onChange={(event) => {
                    setInMesekai(event.target.value)
                }}
            >
                <Radio.Button value={true} style={{ width: '50%' }}>
                    Mesekai
                </Radio.Button>
                <Radio.Button value={false} style={{ width: '50%' }}>
                    Customize
                </Radio.Button>
            </Radio.Group>
        </>
    )
}
