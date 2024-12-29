import { useGLTF } from '@react-three/drei';

export default function Avatar({ setNodes }) {
    const { nodes, _ } = useGLTF('https://models.readyplayer.me/622952275de1ae64c9ebe969.glb?morphTargets=ARKit');
    setNodes(nodes);

    return (
        <primitive object={nodes.Scene} position={[0, -1, 3.5]} />
    );
}