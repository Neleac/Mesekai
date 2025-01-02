import { useGLTF } from '@react-three/drei'

import { animateBody, animateFace, animateHands, rotateHead, resetBlendshapes, resetRotations } from '@/utils/solver'

let headBones, bodyBones, handBones, legBones, meshes
const defaultHeadQuats = []
const defaultBodyQuats = []
const defaultHandQuats = []
const defaultLegQuats = []


function getHandBones(bone) {
    for (const child of bone.children) {
        handBones.push(child)
        getHandBones(child)
    }
}


function getDefaultHandQuats(bone) {
    for (const child of bone.children) {
        defaultHandQuats.push(child.quaternion.clone())
        getDefaultHandQuats(child)
    }
}


export default function Avatar({ avatarUrl, userFace, userBody, userHands }) {
    const { nodes, _ } = useGLTF(avatarUrl)
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
    handBones = []
    for (const bone of [nodes.LeftHand, nodes.RightHand]) {
        getHandBones(bone)
    }

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

    if (defaultHandQuats.length == 0) {
        for (const bone of [nodes.LeftHand, nodes.RightHand]) {
            getDefaultHandQuats(bone)
        }
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
    } else {
        resetBlendshapes(meshes)
        resetRotations(headBones, defaultHeadQuats)
    }

    if (userBody) {
        if (userBody.worldLandmarks && userBody.worldLandmarks.length > 0) {
            animateBody(bodyBones, legBones, userBody.worldLandmarks[0], defaultLegQuats)
        }
    } else {
        resetRotations(bodyBones, defaultBodyQuats)
        resetRotations(legBones, defaultLegQuats)
    }

    if (userHands) {
        animateHands(nodes, userHands)
    } else {
        resetRotations(handBones, defaultHandQuats)
    }
    
    return (
        <primitive object={nodes.Scene} position={[0, -1, 3.5]} />
    )
}
