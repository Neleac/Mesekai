import React from "react";
import "antd/dist/antd.css";
import { Layout, Space } from "antd";

const { Footer } = Layout;

export default function PageFooter() {
    return (
        <Footer style={{ textAlign: "center" }}>
            Mesekai 2021
            <br />
        </Footer>
    );
}
