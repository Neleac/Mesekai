import { useEffect } from 'react'
import { useGLTF } from '@react-three/drei'

import { 
    animateBody, 
    animateFace, 
    animateHand, 
    rotateHead, 
    resetBlendshapes, 
    resetRotations 
} from '@/utils/solver'

let headBones = [] 
let bodyBones = []  
let lHandBones = []  
let rHandBones = []  
let legBones = []  
let meshes = [] 
const defaultHeadQuats = []
const defaultBodyQuats = []
const defaultLHandQuats = []
const defaultRHandQuats = []
const defaultLegQuats = []


function getHandBones(bone, handBones) {
    for (const child of bone.children) {
        handBones.push(child)
        getHandBones(child, handBones)
    }
}


function getDefaultHandQuats(bone, defaultHandQuats) {
    for (const child of bone.children) {
        defaultHandQuats.push(child.quaternion.clone())
        getDefaultHandQuats(child, defaultHandQuats)
    }
}


export function resetFace() {
    resetBlendshapes(meshes)
    resetRotations(headBones, defaultHeadQuats)
}


export function resetBody() {
    resetRotations(bodyBones, defaultBodyQuats)
}


export function resetLegs() {
    resetRotations(legBones, defaultLegQuats)
}


export function resetHands() {
    resetRotations(lHandBones, defaultLHandQuats)
    resetRotations(rHandBones, defaultRHandQuats)
}


export default function Avatar({ avatarUrl, userFace, userBody, userLHand, userRHand, legsVisible, trackLegs }) {
    const { nodes, _ } = useGLTF(avatarUrl)

    useEffect(() => {
        // store bones and meshes
        meshes = [nodes.EyeLeft, nodes.EyeRight, nodes.Wolf3D_Head, nodes.Wolf3D_Teeth]
        headBones = [nodes.Head, nodes.Neck, nodes.Spine2]
        bodyBones = [
            nodes.Spine, nodes.Spine1, 
            nodes.RightArm, nodes.RightForeArm, nodes.RightHand, 
            nodes.LeftArm, nodes.LeftForeArm, nodes.LeftHand
        ]
        legBones = [
            nodes.RightUpLeg, nodes.RightLeg, nodes.RightFoot,
            nodes.LeftUpLeg, nodes.LeftLeg, nodes.LeftFoot
        ]
        lHandBones = [], rHandBones = []
        getHandBones(nodes.LeftHand, lHandBones)
        getHandBones(nodes.RightHand, rHandBones)
    }, [nodes])
    
    // store default rotations
    if (defaultHeadQuats.length == 0) {
        for (const bone of headBones) {
            defaultHeadQuats.push(bone.quaternion.clone())
        }
    }

    if (defaultBodyQuats.length == 0) {
        for (const bone of bodyBones) {
            defaultBodyQuats.push(bone.quaternion.clone())
        }
    }

    if (defaultLHandQuats.length == 0) {
        getDefaultHandQuats(nodes.LeftHand, defaultLHandQuats)
    }

    if (defaultRHandQuats.length == 0) {
        getDefaultHandQuats(nodes.RightHand, defaultRHandQuats)
    }

    if (defaultLegQuats.length == 0) {
        for (const bone of legBones) {
            defaultLegQuats.push(bone.quaternion.clone())
        }
    }

    // set rotations based on tracking result, or reset to default
    // TODO: don't reset to default every render
    if (userFace) {
        if (userFace.faceBlendshapes && userFace.faceBlendshapes.length > 0) {
            animateFace(meshes, userFace.faceBlendshapes[0].categories)
        }

        if (userFace.facialTransformationMatrixes && userFace.facialTransformationMatrixes.length > 0) {
            rotateHead(headBones, userFace.facialTransformationMatrixes[0].data)
        }
    }

    if (userBody) {
        animateBody(bodyBones, legBones, userBody, legsVisible, trackLegs, defaultLegQuats)
    }

    if (userLHand) {
        animateHand(nodes.RightHand, userLHand, 'Left')
    }

    if (userRHand) {
        animateHand(nodes.LeftHand, userRHand, 'Right')
    }

    return (
        <primitive object={nodes.Scene} />
    )
}
