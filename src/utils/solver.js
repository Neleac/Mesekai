import { Euler, Matrix4, Quaternion, Vector3, Matrix3, MathUtils } from 'three'

import { LM_VIS_THRESH, HEAD_SMOOTHING, BODY_SMOOTHING, HAND_SMOOTHING } from '@/utils/constants'


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
const lHIP = 23
const rHIP = 24
const lKNEE = 25
const rKNEE = 26
const lANKLE = 27
const rANKLE = 28
const lHEEL = 29
const rHEEL = 30

const WRIST = 0
const THUMB = 1
const INDEX = 5
const MIDDLE = 9
const RING = 13
const PINKY = 17
const FINGERS = [THUMB, INDEX, MIDDLE, RING, PINKY]

// cache landmarks and transforms to avoid reallocation
const poseLms = new Array(33)
for (let lmIdx = 0; lmIdx < poseLms.length; lmIdx++) {
    poseLms[lmIdx] = new Vector3()
}

const handLms = new Array(21)
for (let lmIdx = 0; lmIdx < handLms.length; lmIdx++) {
    handLms[lmIdx] = new Vector3()
}

const headRotMat = new Matrix4()
const headEuler = new Euler()
const headQuat = new Quaternion()

const invIdentityMat = new Matrix4().invert()
const shoulderRotMat = new Matrix4()
const spineEuler = new Euler()
const spineQuat = new Quaternion()
const zRotQuat = new Quaternion(0, 0, 1, 0)

const axes = new Matrix3()
const xAxis = new Vector3(), yAxis = new Vector3(), zAxis = new Vector3()
const rotWorld = new Quaternion(), rotLocal = new Quaternion()
const userLimbWorld = new Vector3(), userLimbLocal = new Vector3()
const avatarLimbLocal = new Vector3(0, 1, 0)


export function animateFace(meshes, blendshapes) {
    for (const blendshape of blendshapes) {
        // mirror left and right
        let blendshapeName = blendshape['categoryName']
        if (blendshapeName.endsWith('Left')) {
            blendshapeName = blendshapeName.slice(0, -4) + 'Right'
        } else if (blendshapeName.endsWith('Right')) {
            blendshapeName = blendshapeName.slice(0, -5) + 'Left'
        }

        // apply to all affected meshes (e.g. face, teeth, etc.)
        for (const mesh of meshes) {
            const blenshapeIdx = mesh.morphTargetDictionary[blendshapeName]
            if (blenshapeIdx) {
                mesh.morphTargetInfluences[blenshapeIdx] = blendshape['score']
            }
        }
    }
}


export function rotateHead(bones, faceMatrix) {
    headRotMat.fromArray(faceMatrix)
    headEuler.setFromRotationMatrix(headRotMat)

    headEuler.set(headEuler.x / 2, -headEuler.y, -headEuler.z)
    headQuat.setFromEuler(headEuler)
    bones[0].quaternion.slerp(headQuat, HEAD_SMOOTHING)
    
    headEuler.set(headEuler.x / 10, -headEuler.y / 5, -headEuler.z / 5)
    headQuat.setFromEuler(headEuler)
    bones[1].quaternion.slerp(headQuat, HEAD_SMOOTHING)
    
    headEuler.set(headEuler.x / 20, -headEuler.y / 10, -headEuler.z / 10)
    headQuat.setFromEuler(headEuler)
    bones[2].quaternion.slerp(headQuat, HEAD_SMOOTHING)  
}


export function animateBody(bodyBones, legBones, landmarks, defaultLegQuats) {
    // cache visible landmarks, else set to zero vector
    landmarks.forEach((landmark, lmIdx) => {
        if (landmark.visibility > LM_VIS_THRESH) {
            poseLms[lmIdx].set(-landmark.x, -landmark.y, -landmark.z)
        } else {
            poseLms[lmIdx].set(0, 0, 0)
        }
    })

    if (poseLms[lSHOULDER].length() > 0 && poseLms[rSHOULDER].length() > 0) {
        // torso direction
        const shoulderX = poseLms[rSHOULDER].clone().sub(poseLms[lSHOULDER]).normalize()
        const shoulderY = poseLms[lSHOULDER].clone().lerp(poseLms[rSHOULDER], 0.5).normalize()
        const shoulderZ = shoulderX.clone().cross(shoulderY).normalize()
        shoulderRotMat.set(
            shoulderX.x, shoulderY.x, shoulderZ.x, 0,
            shoulderX.y, shoulderY.y, shoulderZ.y, 0,
            shoulderX.z, shoulderY.z, shoulderZ.z, 0,
            0, 0, 0, 1
        ).multiply(invIdentityMat)

        spineEuler.setFromRotationMatrix(shoulderRotMat)
        spineEuler.set(spineEuler.x / 4, spineEuler.y / 2, spineEuler.z / 2)
        spineQuat.setFromEuler(spineEuler)
        bodyBones[0].quaternion.slerp(spineQuat, BODY_SMOOTHING)
        bodyBones[1].quaternion.slerp(spineQuat, BODY_SMOOTHING)

        // user left arm, avatar right arm
        createShoulderAxes(poseLms[rSHOULDER], poseLms[lSHOULDER])
        if (poseLms[lELBOW].length() > 0) {
            solveRotation(bodyBones[2], poseLms[lSHOULDER], poseLms[lELBOW], BODY_SMOOTHING)
            if (poseLms[lWRIST].length() > 0) {
                updateAxes()
                solveRotation(bodyBones[3], poseLms[lELBOW], poseLms[lWRIST], BODY_SMOOTHING)
                if (poseLms[lINDEX].length() > 0 && poseLms[lPINKY].length() > 0) {
                    poseLms[lINDEX].lerp(poseLms[lPINKY], 0.5)
                    updateAxes()
                    solveRotation(bodyBones[4], poseLms[lWRIST], poseLms[lINDEX], BODY_SMOOTHING)
                }
            }
        }

        // user right arm, avatar left arm
        createShoulderAxes(poseLms[lSHOULDER], poseLms[rSHOULDER])
        if (poseLms[rELBOW].length() > 0) {
            solveRotation(bodyBones[5], poseLms[rSHOULDER], poseLms[rELBOW], BODY_SMOOTHING)
            if (poseLms[rWRIST].length() > 0) {
                updateAxes()
                solveRotation(bodyBones[6], poseLms[rELBOW], poseLms[rWRIST], BODY_SMOOTHING)
                if (poseLms[rINDEX].length() > 0 && poseLms[rPINKY].length() > 0) {
                    poseLms[rINDEX].lerp(poseLms[rPINKY], 0.5)
                    updateAxes()
                    solveRotation(bodyBones[7], poseLms[rWRIST], poseLms[rINDEX], BODY_SMOOTHING)
                }
            }
        }

        // TODO: wrist rotation (forearm twist)
    }

    if (poseLms[lHIP].length() > 0 && poseLms[rHIP].length() > 0) {
        // user left leg, avatar right leg
        createHipAxes(poseLms[lHIP], poseLms[rHIP])
        if (poseLms[lKNEE].length() > 0) {
            solveRotation(legBones[0], poseLms[lHIP], poseLms[lKNEE], BODY_SMOOTHING, true)
            if (poseLms[lANKLE].length() > 0) {
                updateAxes()
                solveRotation(legBones[1], poseLms[lKNEE], poseLms[lANKLE], BODY_SMOOTHING)
                if (poseLms[lHEEL].length() > 0) {
                    updateAxes()
                    solveRotation(legBones[2], poseLms[lANKLE], poseLms[lHEEL], BODY_SMOOTHING)
                }
            }
        }

        // user right leg, avatar left leg
        createHipAxes(poseLms[lHIP], poseLms[rHIP])
        if (poseLms[rKNEE].length() > 0) {
            solveRotation(legBones[3], poseLms[rHIP], poseLms[rKNEE], BODY_SMOOTHING, true)
            if (poseLms[rANKLE].length() > 0) {
                updateAxes()
                solveRotation(legBones[4], poseLms[rKNEE], poseLms[rANKLE], BODY_SMOOTHING)
                if (poseLms[rHEEL].length() > 0) {
                    updateAxes()
                    solveRotation(legBones[5], poseLms[rANKLE], poseLms[rHEEL], BODY_SMOOTHING)
                }
            }
        }
    } else {
        // reset legs if not detected
        resetRotations(legBones, defaultLegQuats)
    }        
}


export function animateHands(bones, trackingResult) {
    for (let handIdx = 0; handIdx < trackingResult.handedness.length; handIdx++) {
        // cache landmarks
        trackingResult.worldLandmarks[handIdx].forEach((landmark, lmIdx) => {
            handLms[lmIdx].set(-landmark.x, -landmark.y, -landmark.z)
        })

        if (trackingResult.handedness[handIdx][0]['categoryName'] == 'Left') {
            solveHand(bones.RightHand, 'Left')
        } else {
            solveHand(bones.LeftHand, 'Right')
        }
    }
}


export function resetBlendshapes(meshes) {
    for (const mesh of meshes) {
        for (const key in mesh.morphTargetInfluences) {
            mesh.morphTargetInfluences[key] = 0
        }
    }
}


export function resetRotations(bones, quats) {
    bones.forEach((bone, boneIdx) => {
        bone.quaternion.copy(quats[boneIdx])
    })
}


// x: orthogonal to y and z
// y: along shoulder blade
// z: along spine
function createShoulderAxes(landmarkFrom, landmarkTo) {
    yAxis.copy(landmarkTo.clone().sub(landmarkFrom).normalize())
    zAxis.copy(landmarkTo.clone().lerp(landmarkFrom, 0.5).negate().normalize())
    xAxis.copy(yAxis.clone().cross(zAxis).normalize())
    axes.set(
        xAxis.x, yAxis.x, zAxis.x,
        xAxis.y, yAxis.y, zAxis.y,
        xAxis.z, yAxis.z, zAxis.z
    )
}


// x: along waist
// y: along world y axis
// z: orthogonal to x and y
function createHipAxes(lHipLm, rHipLm) {
    xAxis.copy(lHipLm.clone().sub(rHipLm).normalize())
    yAxis.set(0, -1, 0)
    zAxis.copy(xAxis.clone().cross(yAxis).normalize())
    axes.set(
        xAxis.x, yAxis.x, zAxis.x,
        xAxis.y, yAxis.y, zAxis.y,
        xAxis.z, yAxis.z, zAxis.z
    )
}


function updateAxes() {
    rotWorld.setFromUnitVectors(yAxis, userLimbWorld)
    xAxis.applyQuaternion(rotWorld)
    yAxis.applyQuaternion(rotWorld)
    zAxis.applyQuaternion(rotWorld)
    axes.set(
        xAxis.x, yAxis.x, zAxis.x,
        xAxis.y, yAxis.y, zAxis.y,
        xAxis.z, yAxis.z, zAxis.z
    )
}


function solveRotation(avatarBone, parentLm, childLm, smoothing, isHip=false) {
    userLimbWorld.copy(childLm.clone().sub(parentLm)).normalize()
    userLimbLocal.copy(userLimbWorld).applyMatrix3(axes.invert()).normalize()
    rotLocal.setFromUnitVectors(avatarLimbLocal, userLimbLocal)

    // hip identity rotation points leg up, make leg point down to avoid y rotation ambiguity (twisted hip)
    if (isHip) {
        rotLocal.multiplyQuaternions(zRotQuat, rotLocal)
    }

    avatarBone.quaternion.slerp(rotLocal, smoothing)
}


function solveHand(avatarWristBone, handedness) {
    for (let fingerIdx = 0; fingerIdx < avatarWristBone.children.length; fingerIdx++) {
        // create local axes
        if (handedness == 'Left') {
            xAxis.copy(handLms[INDEX].clone().sub(handLms[PINKY]).normalize())
        } else {
            xAxis.copy(handLms[PINKY].clone().sub(handLms[INDEX]).normalize())
        }
        
        yAxis.copy(handLms[MIDDLE].clone().sub(handLms[WRIST]).normalize())
        zAxis.copy(xAxis.clone().cross(yAxis).normalize())
        axes.set(
            xAxis.x, yAxis.x, zAxis.x,
            xAxis.y, yAxis.y, zAxis.y,
            xAxis.z, yAxis.z, zAxis.z
        )

        // solve and apply finger rotations
        let avatarBone = avatarWristBone.children[fingerIdx]
        for (let landmarkIdx = FINGERS[fingerIdx]; ; landmarkIdx++) {
            solveRotation(avatarBone, handLms[landmarkIdx], handLms[landmarkIdx + 1], HAND_SMOOTHING)
            
            // rotation constraints, TODO: thumbs
            avatarBone.rotation.y = 0
            if (fingerIdx > 0) {
                avatarBone.rotation.x = clampRadiansToDegrees(avatarBone.rotation.x, 0, 90)
                if (landmarkIdx == FINGERS[fingerIdx]) {
                    avatarBone.rotation.z = clampRadiansToDegrees(avatarBone.rotation.z, -15, 15)
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


// value in radians, min/max in degrees
function clampRadiansToDegrees(value, min, max) {
    min = MathUtils.degToRad(min)
    max = MathUtils.degToRad(max)
    return Math.min(Math.max(value, min), max)
}
