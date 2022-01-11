import Image from 'next/image'
import { Button, Row, Col } from 'antd'

export default function AboutPage(){
    return(
        <div id="about">
            <Row>
                <Col span={12}>
                    <h1>
                        About Mesekai
                    </h1>
                    <p>The Mesekai team comes from a diverse background of technical experience and passions. We are web, database, user interface, computer graphics, 
                        and videogame designers and developers. We are excited about the prospect of entering a fantasy world built by our own ingenuity and imagination. 
                        Mesekai aims to build a holistic experience that will convince users of the value of interactions within a virtual world. In the grand scheme, 
                        it is a first step towards the eventual symbiosis of physical and virtual identities, of biological and artificial sentience.
                    </p>
                    <div id='button-middle'>
                        <Button type='primary' size={'large'} href="/registration">Sign Up Now!</Button>
                    </div>
                </Col>
                <Col span={12}>
                    <Image src="/misc/mesekai.png" width="1200vh" height="800vh" alt="mesekai-about"/>  
                </Col>
            </Row>
        </div>  
    )
}