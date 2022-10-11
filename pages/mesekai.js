import React, { useEffect, useRef } from "react";
import { Button, Row, Col, Spin, Tabs } from "antd";
import { LoadingOutlined } from '@ant-design/icons';

import styles from '../styles/Mesekai.module.css'
import { init, animate, updateAvatar, updateWorld } from "../src/scene";
import { PoseDetector } from "../src/mediapipe";

const { TabPane } = Tabs;
const antIcon = <LoadingOutlined style={{ fontSize: 36 }} spin />;

export default function Avatar() {
    const preload = useRef();
    const canvas = useRef();
    const videoInput = useRef();

    useEffect(() => {
        // TODO: get authenticated user
        //let currUser = sessionStorage.getItem('user');
        let currUser = null;

        init(canvas.current, currUser);
        animate();

        const [detector, camera] = PoseDetector(
            preload.current,
            videoInput.current
        );

        camera.start();

        // clicking back button throws
        // TypeError: Cannot read properties of null (reading 'width')
        // maybe need to do something more here?
        return function cleanup() {
            detector.close();

            const tracks = camera.video.srcObject.getTracks();
            tracks.forEach(function (track) {
            track.stop();
            });
            camera.video.srcObject = null;

            // piece of sht doesnt work
            // https://github.com/google/mediapipe/issues/1606
            // camera.stop()
        };
    });

    return (
        <div id="mesekai">
            <Row>
                <Col span={4}>
                    <Tabs defaultActiveKey="1">
                        <TabPane tab="Avatars" key="1" type="card" >
                            <Button style={{background: `url('thumbnails/avatar/xbot.png')`,
                                            backgroundPosition: 'center'}} 
                                    onClick={updateAvatar.bind(this, "xbot")}>
                            X Bot
                            </Button>
                            <Button style={{background: `url('thumbnails/avatar/ybot.png')`,
                                            backgroundPosition: 'center'}} 
                                    onClick={updateAvatar.bind(this, "ybot")}>
                            Y Bot
                            </Button>
                            <Button style={{background: `url('thumbnails/avatar/liam.png')`,
                                            backgroundPosition: 'center'}} 
                                    onClick={updateAvatar.bind(this, "liam")}>
                            Liam
                            </Button>
                            <Button style={{background: `url('thumbnails/avatar/malcolm.png')`,
                                            backgroundPosition: 'center'}} 
                                    onClick={updateAvatar.bind(this, "malcolm")}>
                            Malcolm
                            </Button>
                            <Button style={{background: `url('thumbnails/avatar/regina.png')`,
                                            backgroundPosition: 'center'}} 
                                    onClick={updateAvatar.bind(this, "regina")}>
                            Regina
                            </Button>
                            <Button style={{background: `url('thumbnails/avatar/remy.png')`,
                                            backgroundPosition: 'center'}} 
                                    onClick={updateAvatar.bind(this, "remy")}>
                            Remy
                            </Button>
                            <Button style={{background: `url('thumbnails/avatar/shae.png')`,
                                            backgroundPosition: 'center'}} 
                                    onClick={updateAvatar.bind(this, "shae")}>
                            Shae
                            </Button>
                            <Button style={{background: `url('thumbnails/avatar/stefani.png')`,
                                            backgroundPosition: 'center'}} 
                                    onClick={updateAvatar.bind(this, "stefani")}>
                            Stefani
                            </Button>
                        </TabPane>
                        <TabPane tab="Worlds" key="2" type="card">
                            <Button style={{background: `url('thumbnails/world/grid.png')`,
                                            backgroundPosition: 'center'}} 
                                    onClick={updateWorld.bind(this, "grid")}>
                            Grid
                            </Button>
                            <Button style={{background: `url('thumbnails/world/house.png')`,
                                            backgroundPosition: 'center'}} 
                                    onClick={updateWorld.bind(this, "house")}>
                            House
                            </Button>
                            <Button style={{background: `url('thumbnails/world/forest.png')`,
                                            backgroundPosition: 'center'}} 
                                    onClick={updateWorld.bind(this, "forest")}>
                            Forest
                            </Button>
                            <Button style={{background: `url('thumbnails/world/castle.png')`,
                                            backgroundPosition: 'center'}} 
                                    onClick={updateWorld.bind(this, "castle")}>
                            Castle
                            </Button>
                            <Button style={{background: `url('thumbnails/world/space.png')`,
                                            backgroundPosition: 'center'}} 
                                    onClick={updateWorld.bind(this, "space station")}>
                            Space
                            </Button>
                        </TabPane>
                    </Tabs>
                </Col>
                <Col span={20}>
                    <div ref={canvas}></div>
                    <video hidden ref={videoInput} width="1920px" height="1080px"></video>
                </Col>
            </Row>

            <h1 ref={preload}><span className={styles.loadingtext}> Loading Avatar Tracking <Spin indicator={antIcon}/></span></h1>
        </div>
    );
}
