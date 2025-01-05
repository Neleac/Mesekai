import { FloatButton } from 'antd'
import { CameraTwoTone, CameraOutlined } from '@ant-design/icons'
import { useState } from 'react'

import '@/app/globals.css'
import { CAM_WIDTH, CAM_HEIGHT } from '@/utils/constants'


export default function CameraDisplay({ video, canvas }){
    const [hideCam, setHideCam] = useState(false)
    return (
        <>
            <FloatButton
                icon={hideCam? <CameraOutlined /> : <CameraTwoTone />}
                style={{ position: 'absolute', top: '1%', right: '1%' }}
                onClick={() => {setHideCam(prevState => !prevState)}}
            />
            <div hidden={hideCam} style={{ position: 'absolute', top: '1%', right: '1%', zIndex: 1, pointerEvents: 'none' }}>
                <video ref={video} id='cam-video'></video>
                <canvas ref={canvas} width={CAM_WIDTH} height={CAM_HEIGHT} style={{ position: 'absolute', top: 0, left: 0, transform: 'scaleX(-1)', width: '100%', height: '100%'}}></canvas>
            </div>
        </>
    )
}
