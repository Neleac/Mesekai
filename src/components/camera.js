import { FloatButton } from 'antd';
import { CameraTwoTone, CameraOutlined } from '@ant-design/icons'
import { useState } from 'react'
import '../app/globals.css';


export default function CameraDisplay({video, canvas}){
    const [hideCam, setHideCam] = useState(false);
    return (
        <>
            <FloatButton
                icon={hideCam? <CameraOutlined /> : <CameraTwoTone />}
                type='default'
                style={{ position: 'absolute', top: '1%', right: '1%' }}
                onClick={() => {setHideCam(prevState => !prevState)}}
            />
            <div hidden={hideCam} style={{ position: 'absolute', top: '1%', right: '1%'}}>
                <video ref={video} id='cam-video'></video>
                <canvas ref={canvas} style={{ position: 'absolute', top: 0, left: 0, transform: 'scaleX(-1)', width: '100%', height: '100%'}}></canvas>
            </div>
        </>
    )
}
