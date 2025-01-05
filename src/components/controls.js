import { useEffect, useRef } from 'react'
import { CameraControls } from '@react-three/drei'

export default function Controls({ lookAt }) {
    const controls = useRef(null) 

    useEffect(() => {       
        controls.current.setLookAt(...lookAt, true)
    }, [lookAt])

    return (
        <CameraControls 
            ref={controls}
            dollyToCursor={true}
        />
    )
}