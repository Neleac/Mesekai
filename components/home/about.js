import Image from 'next/image'
import { Row, Col } from 'antd'

export default function AboutPage(){
    return(
        <div id="about">
            <Row>
                <Col span={12}>
                    <h1>How it Works</h1>
                    <p>
                       Mesekai is a real-time 3D virtual avatar and world web application. Users can select from a list of avatar and world presets
                       for their digital persona and environment. Avatar limbs, fingers, and facial expressions are controlled by the user&apos;s physical
                       body through webcam video. Pose estimation is performed using Google MediaPipe to track the user&apos;s body and face landkmarks. A 
                       forward kinematics solver uses the landmarks to calculate the joint rotations and facial blendshapes in order to animate the avatar.
                       Full body tracking is supported, take a few steps away from your computer and try it out!
                    </p>
                </Col>
                <Col span={12}>
                    <Image src="/misc/mediapipe.gif" width="687.5vh" height="386.25vh" alt="mesekai-about"/>
                </Col>
            </Row>
        </div>  
    )
}