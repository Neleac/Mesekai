"use client"

import { Camera } from "@mediapipe/camera_utils"
import {
  FaceLandmarker,
  PoseLandmarker,
  HandLandmarker,
  FilesetResolver,
  DrawingUtils,
} from "@mediapipe/tasks-vision"
import { useEffect, useRef } from "react"
import { useGLTF, OrbitControls } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { Euler, Matrix4, Quaternion, Vector3, Matrix3, Mesh } from "three"

// hardware configuration
const DEVICE = "GPU"
const CAM_HEIGHT = 720
const CAM_WIDTH = 1280

// landmark indices
const lSHOULDER = 11
const rSHOULDER = 12
const lELBOW = 13
const rELBOW = 14
const lWRIST = 15
const rWRIST = 16
const lPINKY = 17
const rPINKY = 18
const lINDEX = 19
const rINDEX = 20

const WRIST = 0
const THUMB = 1
const INDEX = 5
const MIDDLE = 9
const RING = 13
const PINKY = 17
const FINGERS = [THUMB, INDEX, MIDDLE, RING, PINKY]

// lower = smoother, higher = more responsive
const HEAD_SMOOTHING = 0.75
const BODY_SMOOTHING = 0.25
const HAND_SMOOTHING = 0.5

// cache transforms to avoid reallocation
const axes = new Matrix3()
const xAxis = new Vector3(),
  yAxis = new Vector3(),
  zAxis = new Vector3()
const rotWorld = new Quaternion(),
  rotLocal = new Quaternion()
const userLimbWorld = new Vector3(),
  userLimbLocal = new Vector3()
const avatarLimbLocal = new Vector3(0, 1, 0)

function createPoseAxes(landmarkFrom, landmarkTo) {
  yAxis.copy(landmarkTo.clone().sub(landmarkFrom).normalize())
  zAxis.copy(landmarkTo.clone().lerp(landmarkFrom, 0.5).negate().normalize())
  xAxis.copy(yAxis.clone().cross(zAxis).normalize())
  axes.set(
    xAxis.x,
    yAxis.x,
    zAxis.x,
    xAxis.y,
    yAxis.y,
    zAxis.y,
    xAxis.z,
    yAxis.z,
    zAxis.z
  )
}

function updateAxes() {
  rotWorld.setFromUnitVectors(yAxis, userLimbWorld)
  xAxis.applyQuaternion(rotWorld)
  yAxis.applyQuaternion(rotWorld)
  zAxis.applyQuaternion(rotWorld)
  axes.set(
    xAxis.x,
    yAxis.x,
    zAxis.x,
    xAxis.y,
    yAxis.y,
    zAxis.y,
    xAxis.z,
    yAxis.z,
    zAxis.z
  )
}

function solveRotation(
  avatarBone: AvatarBone,
  parentLm,
  childLm,
  smoothing: number
) {
  userLimbWorld.copy(childLm.clone().sub(parentLm)).normalize()
  userLimbLocal.copy(userLimbWorld).applyMatrix3(axes.invert()).normalize()
  rotLocal.setFromUnitVectors(avatarLimbLocal, userLimbLocal)
  avatarBone.quaternion.slerp(rotLocal, smoothing)
}

interface AvatarBone {
  children: AvatarBone[]
  quaternion: Quaternion
  rotation: Euler
}

function solveHand(
  avatarWristBone: AvatarBone,
  handedness: string,
  landmarks: Vector3[]
) {
  for (
    let fingerIdx = 0;
    fingerIdx < avatarWristBone.children.length;
    fingerIdx++
  ) {
    // create local axes
    if (handedness == "Left") {
      xAxis.copy(landmarks[INDEX].clone().sub(landmarks[PINKY]).normalize())
    } else {
      xAxis.copy(landmarks[PINKY].clone().sub(landmarks[INDEX]).normalize())
    }

    yAxis.copy(landmarks[MIDDLE].clone().sub(landmarks[WRIST]).normalize())
    zAxis.copy(xAxis.clone().cross(yAxis).normalize())
    axes.set(
      xAxis.x,
      yAxis.x,
      zAxis.x,
      xAxis.y,
      yAxis.y,
      zAxis.y,
      xAxis.z,
      yAxis.z,
      zAxis.z
    )

    // solve and apply finger rotations
    let avatarBone = avatarWristBone.children[fingerIdx]
    for (let landmarkIdx = FINGERS[fingerIdx]; ; landmarkIdx++) {
      solveRotation(
        avatarBone,
        landmarks[landmarkIdx],
        landmarks[landmarkIdx + 1],
        HAND_SMOOTHING
      )

      // rotation constraints, TODO: thumbs
      avatarBone.rotation.y = 0
      if (fingerIdx > 0) {
        avatarBone.rotation.x = clamp(avatarBone.rotation.x, 0, 90)
        if (landmarkIdx == FINGERS[fingerIdx]) {
          avatarBone.rotation.z = clamp(avatarBone.rotation.z, -15, 15)
        } else {
          avatarBone.rotation.z = 0
        }
      }

      if (landmarkIdx == FINGERS[fingerIdx] + 2) {
        break
      }
      avatarBone = avatarBone.children[0]
      updateAxes()
    }
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export default function Home() {
  // avatar
  // const { nodes, materials } = useGLTF('https://models.readyplayer.me/622952275de1ae64c9ebe969.glb?morphTargets=ARKit');
  const { nodes, materials } = useGLTF("/avatar.glb")
  const meshes: Mesh[] = [
    nodes.EyeLeft as Mesh,
    nodes.EyeRight as Mesh,
    nodes.Wolf3D_Head as Mesh,
    nodes.Wolf3D_Teeth as Mesh,
  ]
  console.log(nodes)

  // face, pose, hands landmark detection models
  let faceTracker: FaceLandmarker,
    poseTracker: PoseLandmarker,
    handTracker: HandLandmarker

  async function createTrackers() {
    const filesetResolver = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    )

    faceTracker = await FaceLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
        delegate: DEVICE,
      },
      runningMode: "VIDEO",
      outputFaceBlendshapes: true,
      outputFacialTransformationMatrixes: true,
    })

    poseTracker = await PoseLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
        delegate: DEVICE,
      },
      runningMode: "VIDEO",
    })

    handTracker = await HandLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        delegate: DEVICE,
      },
      runningMode: "VIDEO",
      numHands: 2,
      minHandDetectionConfidence: 0.95,
      minHandPresenceConfidence: 0.95,
    })
  }
  createTrackers()

  const video = useRef<HTMLVideoElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvasCtx = canvas.current.getContext("2d")
    const drawingUtils = new DrawingUtils(canvasCtx)
    let lastVideoTime = -1

    const camera = new Camera(video.current, {
      onFrame: async () => {
        if (lastVideoTime != video.current.currentTime) {
          lastVideoTime = video.current.currentTime

          canvasCtx.save()
          canvasCtx.clearRect(0, 0, canvas.current.width, canvas.current.height)

          if (faceTracker) {
            const result = faceTracker.detectForVideo(
              video.current,
              performance.now()
            )
            if (result) {
              // video overlay
              if (result.faceLandmarks) {
                for (const landmarks of result.faceLandmarks) {
                  drawingUtils.drawConnectors(
                    landmarks,
                    FaceLandmarker.FACE_LANDMARKS_TESSELATION,
                    { color: "#C0C0C070", lineWidth: CAM_HEIGHT / 1000 }
                  )
                  drawingUtils.drawConnectors(
                    landmarks,
                    FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
                    { color: "cyan", lineWidth: CAM_HEIGHT / 1000 }
                  )
                  drawingUtils.drawConnectors(
                    landmarks,
                    FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
                    { color: "cyan", lineWidth: CAM_HEIGHT / 1000 }
                  )
                  drawingUtils.drawConnectors(
                    landmarks,
                    FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
                    { color: "cyan", lineWidth: CAM_HEIGHT / 1000 }
                  )
                  drawingUtils.drawConnectors(
                    landmarks,
                    FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
                    { color: "cyan", lineWidth: CAM_HEIGHT / 1000 }
                  )
                  drawingUtils.drawConnectors(
                    landmarks,
                    FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
                    { color: "#E0E0E0", lineWidth: CAM_HEIGHT / 1000 }
                  )
                  drawingUtils.drawConnectors(
                    landmarks,
                    FaceLandmarker.FACE_LANDMARKS_LIPS,
                    { color: "cyan", lineWidth: CAM_HEIGHT / 1000 }
                  )
                  drawingUtils.drawConnectors(
                    landmarks,
                    FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
                    { color: "cyan", lineWidth: CAM_HEIGHT / 1000 }
                  )
                  drawingUtils.drawConnectors(
                    landmarks,
                    FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
                    { color: "cyan", lineWidth: CAM_HEIGHT / 1000 }
                  )
                }
              }

              // facial expressions
              if (result.faceBlendshapes && result.faceBlendshapes.length > 0) {
                for (const blendshape of result.faceBlendshapes[0].categories) {
                  // mirror left and right
                  let blendshapeName = blendshape["categoryName"]
                  if (blendshapeName.endsWith("Left")) {
                    blendshapeName = blendshapeName.slice(0, -4) + "Right"
                  } else if (blendshapeName.endsWith("Right")) {
                    blendshapeName = blendshapeName.slice(0, -5) + "Left"
                  }

                  // apply to all affected meshes (e.g. face, teeth, etc.)
                  for (const mesh of meshes) {
                    const blenshapeIdx =
                      mesh.morphTargetDictionary[blendshapeName]
                    if (blenshapeIdx) {
                      mesh.morphTargetInfluences[blenshapeIdx] =
                        blendshape["score"]
                    }
                  }
                }
              }

              // head rotation
              if (
                result.facialTransformationMatrixes &&
                result.facialTransformationMatrixes.length > 0
              ) {
                const headRotMat = new Matrix4().fromArray(
                  result.facialTransformationMatrixes[0].data
                )
                const headRot = new Euler().setFromRotationMatrix(headRotMat)
                nodes.Head.quaternion.slerp(
                  new Quaternion().setFromEuler(
                    new Euler(headRot.x / 2, -headRot.y, -headRot.z)
                  ),
                  HEAD_SMOOTHING
                )
                nodes.Neck.quaternion.slerp(
                  new Quaternion().setFromEuler(
                    new Euler(headRot.x / 10, -headRot.y / 5, -headRot.z / 5)
                  ),
                  HEAD_SMOOTHING
                )
                nodes.Spine2.quaternion.slerp(
                  new Quaternion().setFromEuler(
                    new Euler(headRot.x / 20, -headRot.y / 10, -headRot.z / 10)
                  ),
                  HEAD_SMOOTHING
                )
              }
            }
          }

          if (poseTracker) {
            const result = poseTracker.detectForVideo(
              video.current,
              performance.now()
            )
            if (result) {
              // video overlay
              for (const landmark of result.landmarks) {
                drawingUtils.drawLandmarks(landmark, {
                  radius: CAM_HEIGHT / 1000,
                })
                drawingUtils.drawConnectors(
                  landmark,
                  PoseLandmarker.POSE_CONNECTIONS,
                  { color: "lime", lineWidth: CAM_HEIGHT / 500 }
                )
              }

              // solve and apply pose
              if (result.worldLandmarks && result.worldLandmarks.length > 0) {
                // cache landmarks
                const landmarks: Vector3[] = []
                for (const worldLandmark of result.worldLandmarks[0]) {
                  landmarks.push(
                    new Vector3(
                      worldLandmark.x,
                      worldLandmark.y,
                      worldLandmark.z
                    ).negate()
                  )
                }
                landmarks[lINDEX].lerp(landmarks[lPINKY], 0.5)
                landmarks[rINDEX].lerp(landmarks[rPINKY], 0.5)

                // torso direction
                const shoulderX = landmarks[rSHOULDER]
                  .clone()
                  .sub(landmarks[lSHOULDER])
                  .normalize()
                const shoulderY = landmarks[lSHOULDER]
                  .clone()
                  .lerp(landmarks[rSHOULDER], 0.5)
                  .normalize()
                const shoulderZ = shoulderX.clone().cross(shoulderY).normalize()
                const shoulderRotMat = new Matrix4(
                  shoulderX.x,
                  shoulderY.x,
                  shoulderZ.x,
                  0,
                  shoulderX.y,
                  shoulderY.y,
                  shoulderZ.y,
                  0,
                  shoulderX.z,
                  shoulderY.z,
                  shoulderZ.z,
                  0,
                  0,
                  0,
                  0,
                  1
                ).multiply(new Matrix4().invert())

                const spineRot = new Euler().setFromRotationMatrix(
                  shoulderRotMat
                )
                spineRot.x /= 4
                spineRot.y /= 2
                spineRot.z /= 2
                nodes.Spine.quaternion.slerp(
                  new Quaternion().setFromEuler(spineRot),
                  BODY_SMOOTHING
                )
                nodes.Spine1.quaternion.slerp(
                  new Quaternion().setFromEuler(spineRot),
                  BODY_SMOOTHING
                )

                // user left arm, avatar right arm
                createPoseAxes(landmarks[rSHOULDER], landmarks[lSHOULDER])
                solveRotation(
                  nodes.RightArm,
                  landmarks[lSHOULDER],
                  landmarks[lELBOW],
                  BODY_SMOOTHING
                )
                updateAxes()
                solveRotation(
                  nodes.RightForeArm,
                  landmarks[lELBOW],
                  landmarks[lWRIST],
                  BODY_SMOOTHING
                )
                updateAxes()
                solveRotation(
                  nodes.RightHand,
                  landmarks[lWRIST],
                  landmarks[lINDEX],
                  BODY_SMOOTHING
                )

                // user right arm, avatar left arm
                createPoseAxes(landmarks[lSHOULDER], landmarks[rSHOULDER])
                solveRotation(
                  nodes.LeftArm,
                  landmarks[rSHOULDER],
                  landmarks[rELBOW],
                  BODY_SMOOTHING
                )
                updateAxes()
                solveRotation(
                  nodes.LeftForeArm,
                  landmarks[rELBOW],
                  landmarks[rWRIST],
                  BODY_SMOOTHING
                )
                updateAxes()
                solveRotation(
                  nodes.LeftHand,
                  landmarks[rWRIST],
                  landmarks[rINDEX],
                  BODY_SMOOTHING
                )

                // TODO: wrist rotation
              }
            }
          }

          if (handTracker) {
            const result = handTracker.detectForVideo(
              video.current,
              performance.now()
            )
            if (result) {
              // video overlay
              for (const landmark of result.landmarks) {
                drawingUtils.drawLandmarks(landmark, {
                  color: "green",
                  radius: CAM_HEIGHT / 1000,
                })
                drawingUtils.drawConnectors(
                  landmark,
                  HandLandmarker.HAND_CONNECTIONS,
                  { color: "lime", lineWidth: CAM_HEIGHT / 1000 }
                )
              }

              // solve and apply hands
              for (
                let handIdx = 0;
                handIdx < result.handedness.length;
                handIdx++
              ) {
                // cache landmarks
                const landmarks: Vector3[] = []
                for (const worldLandmark of result.worldLandmarks[handIdx]) {
                  landmarks.push(
                    new Vector3(
                      worldLandmark.x,
                      worldLandmark.y,
                      worldLandmark.z
                    ).negate()
                  )
                }

                if (result.handedness[handIdx][0]["categoryName"] == "Left") {
                  solveHand(nodes.RightHand, "Left", landmarks)
                } else {
                  solveHand(nodes.LeftHand, "Right", landmarks)
                }
              }
            }
          }

          canvasCtx.restore()
        }
      },
      width: CAM_WIDTH,
      height: CAM_HEIGHT,
    })
    camera.start()

    return function cleanup() {
      camera.stop()
      if (faceTracker) {
        faceTracker.close()
      }
      if (poseTracker) {
        poseTracker.close()
      }
      if (handTracker) {
        handTracker.close()
      }
    }
  })

  return (
    <div className="flex">
      <div
        style={{ position: "relative", width: CAM_WIDTH, height: CAM_HEIGHT }}
      >
        <video
          ref={video}
          width={CAM_WIDTH}
          height={CAM_HEIGHT}
          className="w-full transform -scale-x-100"
        ></video>
        <canvas
          ref={canvas}
          width={CAM_WIDTH}
          height={CAM_HEIGHT}
          className="absolute top-0 left-0 w-full transform -scale-x-100"
        ></canvas>
      </div>
      <Canvas style={{ width: "100vw", height: "100vh" }}>
        <OrbitControls />
        <ambientLight intensity={0.1} />
        <directionalLight position={[0, 0, 1]} />
        <primitive
          object={nodes.Scene}
          position={[0, -7.5, 0]}
          scale={[5, 5, 5]}
        />
      </Canvas>
    </div>
  )
}
