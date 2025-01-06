'use client'

import { Button, Dropdown, Radio, Space, Switch } from 'antd'
import { DownOutlined } from '@ant-design/icons'

import { Camera } from '@mediapipe/camera_utils'
import { DrawingUtils } from '@mediapipe/tasks-vision'
import { useEffect, useRef, useState } from 'react'
import { Environment } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { AvatarCreator } from '@readyplayerme/react-avatar-creator'

import Avatar, { resetFace, resetBody, resetLegs, resetHands } from '@/components/avatar'
import CameraDisplay from '@/components/camera'
import Controls from '@/components/controls'
import { 
    CAM_WIDTH, CAM_HEIGHT, SCENES, DEFAULT_SCENE, 
    FULLBODY_LOOKAT, HALFBODY_LOOKAT, HEADONLY_LOOKAT, 
    LM_VIS_THRESH, lHIP, rHIP, 
    BODY_SMOOTHING_FRAMES, HAND_SMOOTHING_FRAMES
} from '@/utils/constants'
import {
    createTrackers,
    drawFaceLandmarks,
    drawBodyLandmarks,
    drawHandLandmarks,
    computeAvgLandmarks
} from '@/utils/tracker'
import './globals.css'
import Social from '@/components/social'

let trackersCreated = false
let faceTracker, bodyTracker, handTracker

let trackFace = true
let trackBody = true
let trackHands = true

const bodyFrames = []
const lHandFrames = []
const rHandFrames = []


function processFrame(frame, drawingUtils, setFaceLandmarks, setBodyLandmarks, setlHandLandmarks, setrHandLandmarks, setLegsVisible) {    
    if (trackFace) {
        const trackingResult = faceTracker.detectForVideo(frame, performance.now())
        
        // animate avatar
        setFaceLandmarks(trackingResult)

        // draw video overlay
        drawFaceLandmarks(trackingResult.faceLandmarks, drawingUtils, CAM_HEIGHT / 1000)
    }

    if (trackBody) {
        const trackingResult = bodyTracker.detectForVideo(frame, performance.now())

        // animate avatar
        if (trackingResult.worldLandmarks && trackingResult.worldLandmarks.length > 0) {
            const landmarks = trackingResult.worldLandmarks[0]
            bodyFrames.push(landmarks)

            if (bodyFrames.length == BODY_SMOOTHING_FRAMES) {
                computeAvgLandmarks(bodyFrames)
                setBodyLandmarks(bodyFrames[0])
                bodyFrames.shift()
                setLegsVisible(landmarks[lHIP].visibility > LM_VIS_THRESH && landmarks[rHIP].visibility > LM_VIS_THRESH)
            }
        }

        // draw video overlay
        drawBodyLandmarks(trackingResult.landmarks, drawingUtils, CAM_HEIGHT / 1000, CAM_HEIGHT / 500)
    }

    if (trackHands) {
        const trackingResult = handTracker.detectForVideo(frame, performance.now())
        
        // animate avatar
        for (let handIdx = 0; handIdx < trackingResult.handedness.length; handIdx++) {
            const handedness = trackingResult.handedness[handIdx][0]['categoryName']
            const handFrames = (handedness == 'Left') ? lHandFrames : rHandFrames
            const landmarks = trackingResult.worldLandmarks[handIdx]
            handFrames.push(landmarks)

            if (handFrames.length == HAND_SMOOTHING_FRAMES) {
                computeAvgLandmarks(handFrames)
                if (handedness == 'Left') {
                    setlHandLandmarks(handFrames[0])
                } else {
                    setrHandLandmarks(handFrames[0])
                }
                handFrames.shift()
            }
        }

        // draw video overlay
        drawHandLandmarks(trackingResult.landmarks, drawingUtils, CAM_HEIGHT / 1000, CAM_HEIGHT / 1000)
    }
}


export default function Home() {
    const [inMesekai, setInMesekai] = useState(true)
    const [avatarUrl, setAvatarUrl] = useState(
        'https://models.readyplayer.me/622952275de1ae64c9ebe969.glb?morphTargets=ARKit'
    )
    const [faceLandmarks, setFaceLandmarks] = useState(null)
    const [bodyLandmarks, setBodyLandmarks] = useState(null)
    const [lHandLandmarks, setlHandLandmarks] = useState(null)
    const [rHandLandmarks, setrHandLandmarks] = useState(null)
    const [legsVisible, setLegsVisible] = useState(false)
    const [trackLegs, setTrackLegs] = useState(true)
    const [scene, setScene] = useState(DEFAULT_SCENE)
    const [lookAt, setLookAt] = useState(FULLBODY_LOOKAT)

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
                    processFrame(
                        video.current, drawingUtils, 
                        setFaceLandmarks, 
                        setBodyLandmarks, 
                        setlHandLandmarks, 
                        setrHandLandmarks, 
                        setLegsVisible
                    )
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
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                    }}
                >
                    <Avatar
                        avatarUrl={avatarUrl}
                        userFace={faceLandmarks}
                        userBody={bodyLandmarks}
                        userLHand={lHandLandmarks}
                        userRHand={rHandLandmarks}
                        legsVisible={legsVisible}
                        trackLegs={trackLegs}
                    />
                    <Environment preset={scene} background={true} />
                    <Controls lookAt={lookAt} />
                </Canvas>

                <Space direction='vertical' align='start'
                    style={{
                        position: 'absolute',
                        top: '1%',
                        left: '1%',
                    }}
                >
                    {/* body part tracking selection */}
                    <Switch checkedChildren='Face' unCheckedChildren='Face' defaultChecked 
                        onChange={(checked) => {
                            trackFace = checked
                            if (!checked) {
                                setFaceLandmarks(null)
                                resetFace()
                            }
                        }}
                    />
                    <Switch checkedChildren='Body' unCheckedChildren='Body' defaultChecked
                        onChange={(checked) => {
                            trackBody = checked
                            if (checked) {
                                if (trackLegs) {
                                    setLookAt(FULLBODY_LOOKAT)
                                } else {
                                    setLookAt(HALFBODY_LOOKAT)
                                }
                            } else {
                                setBodyLandmarks(null)
                                resetBody()
                                resetLegs()
                                setLookAt(HEADONLY_LOOKAT)
                            }
                        }}
                    />
                    <Switch checkedChildren='Legs' unCheckedChildren='Legs' defaultChecked
                        checked={trackLegs && bodyLandmarks}
                        disabled={!bodyLandmarks}
                        onChange={(checked) => {
                            setTrackLegs(checked)
                            if (checked) {
                                setLookAt(FULLBODY_LOOKAT)
                            } else {
                                resetLegs()
                                setLookAt(HALFBODY_LOOKAT)
                            }
                        }}
                    />
                    <Switch checkedChildren='Hands' unCheckedChildren='Hands' defaultChecked
                        onChange={(checked) => {
                            trackHands = checked
                            if (!checked) {
                                setlHandLandmarks(null)
                                setrHandLandmarks(null)
                                resetHands()
                            }
                        }}
                    />

                    {/* scene selection */}
                    <Dropdown
                        menu={{
                            items: SCENES,
                            selectable: true,
                            defaultSelectedKeys: [DEFAULT_SCENE],
                            onClick: (event) => {
                                setScene(event.key)
                            },
                        }}
                    >
                        <Button size='small' style={{ fontSize: '0.75em' }}>
                            <Space>
                                Scene
                                <DownOutlined />
                            </Space>
                        </Button>
                    </Dropdown>
                </Space>

                <Social />
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
                value={inMesekai}
                onChange={(event) => {
                    setInMesekai(event.target.value)
                }}
                size='large'
                style={{ position: 'absolute', bottom: '1%', left: '1%' }}
            >
                <Radio.Button value={true} style={{ width: '50%', fontFamily: 'Kristen ITC' }}>
                    Mesekai
                </Radio.Button>
                <Radio.Button value={false} style={{ width: '50%' }}>
                    Customize
                </Radio.Button>
            </Radio.Group>
        </>
    )
}
