import { FaceLandmarker, PoseLandmarker, HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'

import { TRACKER_DEVICE, TRACKER_MODE } from '@/utils/constants'


export async function createTrackers() {
    const filesetResolver = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm')
    
    const faceTracker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: TRACKER_DEVICE
        },
        runningMode: TRACKER_MODE,
        min_face_detection_confidence: 0.95,
        min_face_presence_confidence: 0.95,
        min_tracking_confidence: 0.95,
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: true
    })

    const bodyTracker = await PoseLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task',
            delegate: TRACKER_DEVICE
        },
        runningMode: TRACKER_MODE,
        min_pose_detection_confidence: 0.95,
        min_pose_presence_confidence: 0.95,
        min_tracking_confidence: 0.95
    })

    const handTracker = await HandLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: TRACKER_DEVICE
        },
        runningMode: TRACKER_MODE,
        numHands: 2,
        min_hand_detection_confidence: 0.95,
        min_hand_presence_confidence: 0.95
    })

    return [faceTracker, bodyTracker, handTracker]
}


export function drawFaceLandmarks(landmarks, drawingUtils, lineWidth) {
    if (landmarks.length > 0) {
        drawingUtils.drawConnectors(landmarks[0], FaceLandmarker.FACE_LANDMARKS_TESSELATION, { color: '#C0C0C070', lineWidth: lineWidth })
        drawingUtils.drawConnectors(landmarks[0], FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE, { color: 'cyan', lineWidth: lineWidth })
        drawingUtils.drawConnectors(landmarks[0], FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW, { color: 'cyan', lineWidth: lineWidth })
        drawingUtils.drawConnectors(landmarks[0], FaceLandmarker.FACE_LANDMARKS_LEFT_EYE, { color: 'cyan', lineWidth: lineWidth })
        drawingUtils.drawConnectors(landmarks[0], FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW, { color: 'cyan', lineWidth: lineWidth })
        drawingUtils.drawConnectors(landmarks[0], FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, { color: '#E0E0E0', lineWidth: lineWidth })
        drawingUtils.drawConnectors(landmarks[0], FaceLandmarker.FACE_LANDMARKS_LIPS, { color: 'cyan', lineWidth: lineWidth })
        drawingUtils.drawConnectors(landmarks[0], FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS, { color: 'cyan', lineWidth: lineWidth })
        drawingUtils.drawConnectors(landmarks[0], FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS, { color: 'cyan', lineWidth: lineWidth })
    }
}


export function drawBodyLandmarks(landmarks, drawingUtils, landmarkRadius, lineWidth) {
    if (landmarks.length > 0) {
        drawingUtils.drawLandmarks(landmarks[0], {radius: landmarkRadius})
        drawingUtils.drawConnectors(landmarks[0], PoseLandmarker.POSE_CONNECTIONS, { color: 'lime', lineWidth: lineWidth })
    }
}


export function drawHandLandmarks(landmarks, drawingUtils, landmarkRadius, lineWidth) {
    for (const handLandmarks of landmarks) {
        drawingUtils.drawLandmarks(handLandmarks, {color: 'green', radius: landmarkRadius })
        drawingUtils.drawConnectors(handLandmarks, HandLandmarker.HAND_CONNECTIONS, { color: 'lime', lineWidth: lineWidth })
    }
}

// given array of shape (nFrames, nLandmarks), modifies index 0 to be the average of all frames
export function computeAvgLandmarks(landmarksFrames) {
    for (let frameIdx = 1; frameIdx < landmarksFrames.length; frameIdx++) {
        for (let landmarkIdx = 0; landmarkIdx < landmarksFrames[frameIdx].length; landmarkIdx++) {
            const landmark = landmarksFrames[frameIdx][landmarkIdx]
            landmarksFrames[0][landmarkIdx].x += landmark.x
            landmarksFrames[0][landmarkIdx].y += landmark.y
            landmarksFrames[0][landmarkIdx].z += landmark.z
        }
    }

    for (let landmarkIdx = 0; landmarkIdx < landmarksFrames[0].length; landmarkIdx++) {
        landmarksFrames[0][landmarkIdx].x /= landmarksFrames.length
        landmarksFrames[0][landmarkIdx].y /= landmarksFrames.length
        landmarksFrames[0][landmarkIdx].z /= landmarksFrames.length
    }
}
