export const CAM_HEIGHT = 1080
export const CAM_WIDTH = 1920

export const TRACKER_DEVICE = 'GPU'
export const TRACKER_MODE = 'VIDEO'

export const SCENES = [
    { label: 'Apartment', key: 'Apartment' },
    { label: 'City', key: 'City' },
    { label: 'Dawn', key: 'Dawn' },
    { label: 'Forest', key: 'Forest' },
    { label: 'Lobby', key: 'Lobby' },
    { label: 'Night', key: 'Night' },
    { label: 'Park', key: 'Park' },
    { label: 'Studio', key: 'Studio' },
    { label: 'Sunset', key: 'Sunset' },
    { label: 'Warehouse', key: 'Warehouse' },
]

// min landmark visibility to be used for tracking
export const LM_VIS_THRESH = 0.5

// lower = smoother, higher = more responsive
export const HEAD_SMOOTHING = 0.75
export const BODY_SMOOTHING = 0.25
export const HAND_SMOOTHING = 0.5
