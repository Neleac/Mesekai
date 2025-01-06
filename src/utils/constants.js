export const CAM_HEIGHT = 1080
export const CAM_WIDTH = 1920

export const TRACKER_DEVICE = 'GPU'
export const TRACKER_MODE = 'VIDEO'

export const SCENES = [
    { label: 'Apartment', key: 'apartment' },
    { label: 'City', key: 'city' },
    { label: 'Desert', key: 'dawn' },
    { label: 'Forest', key: 'forest' },
    { label: 'Lobby', key: 'lobby' },
    { label: 'Night', key: 'night' },
    { label: 'Park', key: 'park' },
    { label: 'Studio', key: 'studio' },
    { label: 'Pier', key: 'sunset' },
    { label: 'Warehouse', key: 'warehouse' },
]
export const DEFAULT_SCENE = 'sunset'

export const FULLBODY_LOOKAT = [0, 1, 1.5, 0, 1, 0]
export const HALFBODY_LOOKAT = [0, 1.5, 1, 0, 1.5, 0]
export const HEADONLY_LOOKAT = [0, 1.8, 0.3, 0, 1.7, 0]

// min landmark visibility to be used for tracking
export const LM_VIS_THRESH = 0.5

// number of frames to average (smooths landmarks)
// lower = more responsive, higher = smoother
export const BODY_SMOOTHING_FRAMES = 8
export const HAND_SMOOTHING_FRAMES = 8

// spherical interpolation factor (smooths rotations)
// lower = smoother, higher = more responsive
export const HEAD_SMOOTHING = 0.75
export const BODY_SMOOTHING = 0.5
export const HAND_SMOOTHING = 0.95

// landmark indices
export const lSHOULDER = 11
export const rSHOULDER = 12
export const lELBOW = 13
export const rELBOW = 14
export const lWRIST = 15
export const rWRIST = 16
export const lPINKY = 17
export const rPINKY = 18
export const lINDEX = 19
export const rINDEX = 20
export const lHIP = 23
export const rHIP = 24
export const lKNEE = 25
export const rKNEE = 26
export const lANKLE = 27
export const rANKLE = 28
export const lHEEL = 29
export const rHEEL = 30

export const WRIST = 0
export const THUMB = 1
export const INDEX = 5
export const MIDDLE = 9
export const RING = 13
export const PINKY = 17
export const FINGERS = [THUMB, INDEX, MIDDLE, RING, PINKY]
