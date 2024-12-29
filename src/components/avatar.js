import { useGLTF } from '@react-three/drei';

import { animateBody, animateFace, animateHands, rotateHead } from '@/utils/solver';


export default function Avatar({ userFace, userBody, userHands }) {
    const { nodes, _ } = useGLTF('https://models.readyplayer.me/622952275de1ae64c9ebe969.glb?morphTargets=ARKit');
    const meshes = [nodes.EyeLeft, nodes.EyeRight, nodes.Wolf3D_Head, nodes.Wolf3D_Teeth];

    if (userFace) {
        if (userFace.faceBlendshapes && userFace.faceBlendshapes.length > 0) {
            animateFace(meshes, userFace.faceBlendshapes[0].categories);
        }

        if (userFace.facialTransformationMatrixes && userFace.facialTransformationMatrixes.length > 0) {
            rotateHead(nodes, userFace.facialTransformationMatrixes[0].data)
        }
    }

    if (userBody && userBody.worldLandmarks && userBody.worldLandmarks.length > 0) {
        animateBody(nodes, userBody.worldLandmarks[0]);
    }

    if (userHands) {
        animateHands(nodes, userHands);
    }
    
    return (
        <primitive object={nodes.Scene} position={[0, -1, 3.5]} />
    );
}
