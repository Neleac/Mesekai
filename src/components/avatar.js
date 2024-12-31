import { useEffect } from 'react'

import { useGLTF } from '@react-three/drei'
import { Quaternion } from 'three'

import { animateBody, animateFace, animateHands, rotateHead } from '@/utils/solver'

const defaultLegQuats = []
for (let i = 0; i < 6; i++) {
    defaultLegQuats.push(new Quaternion())
}


export default function Avatar({ avatarUrl, userFace, userBody, userHands }) {
    const { nodes, _ } = useGLTF(avatarUrl)

    // store default leg rotations
    useEffect(() => {
        defaultLegQuats[0].copy(nodes.LeftUpLeg.quaternion)
        defaultLegQuats[1].copy(nodes.LeftLeg.quaternion)
        defaultLegQuats[2].copy(nodes.LeftFoot.quaternion)
        defaultLegQuats[3].copy(nodes.RightUpLeg.quaternion)
        defaultLegQuats[4].copy(nodes.RightLeg.quaternion)
        defaultLegQuats[5].copy(nodes.RightFoot.quaternion)
    }, [])

    if (userFace) {
        if (userFace.faceBlendshapes && userFace.faceBlendshapes.length > 0) {
            const meshes = [nodes.EyeLeft, nodes.EyeRight, nodes.Wolf3D_Head, nodes.Wolf3D_Teeth]
            animateFace(meshes, userFace.faceBlendshapes[0].categories)
        }

        if (userFace.facialTransformationMatrixes && userFace.facialTransformationMatrixes.length > 0) {
            rotateHead(nodes, userFace.facialTransformationMatrixes[0].data)
        }
    }

    if (userBody && userBody.worldLandmarks && userBody.worldLandmarks.length > 0) {
        animateBody(nodes, userBody.worldLandmarks[0], defaultLegQuats)
    }

    if (userHands) {
        animateHands(nodes, userHands)
    }
    
    return (
        <primitive object={nodes.Scene} position={[0, -1, 3.5]} />
    )
}
