import React from "react";
import { Anchor, Layout} from "antd";

const { Link } = Anchor;
const { Header } = Layout;

export default function PageHeader() {
    return (
        <Header style={{ backgroundColor: "#DADADA" }}>
            <div className="header">
                <Anchor targetOffset="65">
                    <div id="logo">
                        <Link href="/" title="MESEKAI" />
                    </div>
                    <Link href="/#base" title="Home" />
                    <Link href="/#about" title="About" />
                    <Link href="/#members" title="Team" />
                </Anchor>
            </div>
        </Header>
    );
}
