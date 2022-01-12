import { Button } from "antd";
import Image from 'next/image'

export default function Landing() {
    return (
        <div id="base">
            <div id="Title">Mesekai</div>
            <div id="desc">
                Step into a virtual world with just a webcam!
            </div>
            <div id="button-middle">
                <Image src="/misc/front-page-char.png" width="1276px" height="859px"/>
                <Button type="primary" size={"large"} href="/mesekai">
                    Enter
                </Button>
                <br/>
            </div>
        </div>
    );
}