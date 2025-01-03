'use client'

import { Button, Dropdown, Radio, Space, Switch } from 'antd'
import { DownOutlined } from '@ant-design/icons'

import { Camera } from '@mediapipe/camera_utils'
import { DrawingUtils } from '@mediapipe/tasks-vision'
import { useEffect, useRef, useState } from 'react'
import { Environment, OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { AvatarCreator } from '@readyplayerme/react-avatar-creator'

import Avatar from '@/components/avatar'
import CameraDisplay from '@/components/camera'
import {
    createTrackers,
    drawFaceLandmarks,
    drawBodyLandmarks,
    drawHandLandmarks,
} from '@/utils/tracker'

import {CAM_WIDTH,CAM_HEIGHT } from "../utils/constants"

let trackersCreated = false
let faceTracker, bodyTracker, handTracker

const scenes = [
    { label: 'Apartment', key: 'apartment' },
    { label: 'City', key: 'city' },
    { label: 'Dawn', key: 'dawn' },
    { label: 'Forest', key: 'forest' },
    { label: 'Lobby', key: 'lobby' },
    { label: 'Night', key: 'night' },
    { label: 'Park', key: 'park' },
    { label: 'Studio', key: 'studio' },
    { label: 'Sunset', key: 'sunset' },
    { label: 'Warehouse', key: 'warehouse' },
]

let trackFace = true
let trackBody = false
let trackHands = false
let trackingResult
function processFrame(frame, drawingUtils, setFaceTrackingResult, setBodyTrackingResult, setHandTrackingResult) {
    if (trackFace) {
        trackingResult = faceTracker.detectForVideo(frame, performance.now())
        setFaceTrackingResult(trackingResult)
        drawFaceLandmarks(trackingResult.faceLandmarks, drawingUtils, CAM_HEIGHT / 1000)
    }

    if (trackBody) {
        trackingResult = bodyTracker.detectForVideo(frame, performance.now())
        setBodyTrackingResult(trackingResult)
        drawBodyLandmarks(trackingResult.landmarks, drawingUtils, CAM_HEIGHT / 1000, CAM_HEIGHT / 500)
    }

    if (trackHands) {
        trackingResult = handTracker.detectForVideo(frame, performance.now())
        setHandTrackingResult(trackingResult)
        drawHandLandmarks(trackingResult.landmarks, drawingUtils, CAM_HEIGHT / 1000, CAM_HEIGHT / 1000)
    }
}


export default function Home() {
    const [inMesekai, setInMesekai] = useState(true)
    const [avatarUrl, setAvatarUrl] = useState(
        'https://models.readyplayer.me/622952275de1ae64c9ebe969.glb?morphTargets=ARKit'
    )
    const [faceTrackingResult, setFaceTrackingResult] = useState(null)
    const [bodyTrackingResult, setBodyTrackingResult] = useState(null)
    const [handTrackingResult, setHandTrackingResult] = useState(null)
    const [scene, setScene] = useState('sunset')

    const video = useRef(null)
    const canvas = useRef(null)
    useEffect(() => {
        const canvasCtx = canvas.current.getContext('2d')
        const drawingUtils = new DrawingUtils(canvasCtx)
        let lastVideoTime = -1

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
                    processFrame(video.current, drawingUtils, setFaceTrackingResult, setBodyTrackingResult, setHandTrackingResult)
                    canvasCtx.restore()
                }
            },
            width: CAM_WIDTH,
            height: CAM_HEIGHT
        })
        camera.start()

        return function cleanup() {
            camera.stop()
        }
    }, [])

    return (
        <>
            <div
                hidden={!inMesekai}
                style={{
                    position: 'relative',
                    width: '100vw',
                    height: '100vh',
                }}
            >
                <CameraDisplay video={video} canvas={canvas}/>
                
                {/* avatar scene */}
                <Canvas
                    style={{
                        zIndex: -1,
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
                    <Environment preset={scene} background={true} />
                    <OrbitControls />
                </Canvas>

                <Space direction='horizontal' align='start'
                    style={{
                        position: 'absolute',
                        top: '1%',
                        left: '1%',
                    }}
                >
                    {/* body part tracking selection */}
                    <Space direction='vertical'>
                        <Switch checkedChildren="Face" unCheckedChildren="Face" defaultChecked 
                            onChange={(checked) => {
                                trackFace = checked
                                setFaceTrackingResult(null)
                            }}
                        />
                        <Switch checkedChildren="Body" unCheckedChildren="Body" 
                            onChange={(checked) => {
                                trackBody = checked
                                setBodyTrackingResult(null)
                            }}
                        />
                        <Switch checkedChildren="Hands" unCheckedChildren="Hands" 
                            onChange={(checked) => {
                                trackHands = checked
                                setHandTrackingResult(null)
                            }}
                        />
                    </Space>

                    {/* scene selection */}
                    <Dropdown
                        menu={{
                            items: scenes,
                            onClick: (event) => {
                                setScene(event.key)
                            },
                        }}
                    >
                        <Button>
                            <Space>
                                Scene
                                <DownOutlined />
                            </Space>
                        </Button>
                    </Dropdown>
                </Space>
            </div>

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

            {/* avatar creator toggle */}
            <Radio.Group
                style={{ position: 'absolute', bottom: '1%', left: '1%' }}
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
