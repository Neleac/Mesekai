import Link from "next/link";
import React from "react";
import { Form, Input, Button } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";

import PageHeader from "../components/header";
import PageFooter from "../components/footer";

export default function Registration() {
    const [username, setUsername] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [cPassword, setCPassword] = React.useState("");

    const handleUsername = (e) => {
        setUsername(e.target.value);
    };

    const handleEmail = (e) => {
        setEmail(e.target.value);
    };

    const handlePassword = (e) => {
        setPassword(e.target.value);
    };

    const handleConfirmPassword = (e) => {
        setCPassword(e.target.value);
    };

    const handleSubmit = (e) => {
    // const body = {
    //   username: username,
    //   email: email,
    //   password: password,
    // };

    // if (cPassword != password) {
    //   alert("passwords don't match");
    //   e.preventDefault();
    // } else {
    //   fetch("/api/register", {
    //     method: "POST",
    //     body: JSON.stringify(body),
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //   })
    //     .then((res) => {
    //       if (res.status == 200) {
    //         alert("Registration Success");
    //         window.location = "/login";
    //       } else {
    //         alert("Registration Failure");
    //       }
    //     })
    //     .catch((err) => console.log(err));
    // }
    };

    return (
        <>
            <PageHeader />
            <div id="registration">
                <Form id="form" className="form" initialValues={{ remember: true }}>
                    <h1>Register for free!</h1>
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: "Please input your username" }]}
                    >
                        <Input
                            prefix={<UserOutlined className="site-form-item-icon" />}
                            type="text"
                            id="username"
                            placeholder="Username"
                            size="large"
                            value={username}
                            onChange={handleUsername}
                        />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        rules={[{ required: true, message: "Please input your email" }]}
                    >
                        <Input
                            prefix={<MailOutlined className="site-form-item-icon" />}
                            type="email"
                            id="email"
                            size="large"
                            placeholder="Email"
                            value={email}
                            onChange={handleEmail}
                        />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: "Please input your password" }]}
                    >
                        <Input
                            prefix={<LockOutlined className="site-form-item-icon" />}
                            type="password"
                            id="password"
                            size="large"
                            placeholder="Password"
                            value={password}
                            onChange={handlePassword}
                        />
                    </Form.Item>
                    <Form.Item
                        name="cpassword"
                        rules={[
                            { required: true, message: "Please confirm your password" },
                        ]}
                    >
                        <Input
                            prefix={<LockOutlined className="site-form-item-icon" />}
                            type="password"
                            id="cpassword"
                            size="large"
                            placeholder="Confirm Password"
                            value={cPassword}
                            onChange={handleConfirmPassword}
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            id="submit"
                            className="registration-form-button"
                            onClick={handleSubmit}
                        >
                            Register
                        </Button>
                    </Form.Item>
                    <p>
                        Have an account already?
                        <Link href="/login"> Login Here!</Link>
                    </p>
                </Form>
            </div>
            <PageFooter />
        </>
    );
}
