import Image from 'next/image'
import { Row, Col } from 'antd'

export default function AboutPage(){
    return(
        <div id="about">
            <Row>
                <Col span={12}>
                    <h1>
                        About Us
                    </h1>
                    <p>
                       Mesekai is a real-time 3D virtual avatar and world web application. Users can select from a list of avatar and world presets
                       for their digital persona and environment. Avatar limbs, fingers, and facial expressions are controlled by the user&apos;s physical
                       body through webcam video. The app is built using MediaPipe, Three.js, and React. The Mesekai team comes from a diverse background 
                       of technical experience and passions. We are web, database, user interface, computer graphics, and videogame designers and developers. 
                       We are excited about the prospect of entering a fantasy world built by our own ingenuity and imagination.
                    </p>
                </Col>
                <Col span={12}>
                    <Image src="/misc/mesekai.png" width="1200vh" height="800vh" alt="mesekai-about"/>  
                </Col>
            </Row>
        </div>  
    )
}