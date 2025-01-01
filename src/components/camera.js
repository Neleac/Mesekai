import {EyeTwoTone, EyeInvisibleTwoTone} from '@ant-design/icons'
import { FloatButton } from 'antd';
import { useState } from 'react'
import '../app/globals.css';

export default function CameraSelf({video, canvas}){
    const [hideCam, setHideCam] = useState(false);
    return (
        <>
        <FloatButton
            icon={hideCam? <EyeTwoTone /> : <EyeInvisibleTwoTone />}
            type="default"
            style={{ insetInlineEnd: 24 }}
            onClick={() => {setHideCam(prevState => !prevState);}}
        />
            <div hidden={hideCam} style={{ position: 'absolute', top: 10, left: 10, width: '30%', height: '30%' }}>
                <video ref={video} id="cam-video"></video>
                <canvas ref={canvas} style={{ position: 'absolute', top: 0, left: 0, transform: 'scaleX(-1)', width: '100%', height: '100%'}}></canvas>
            </div>
        </>
);
}