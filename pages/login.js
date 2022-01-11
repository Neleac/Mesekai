import Link from "next/link";
import React from "react";
import { Form, Input, Button, Checkbox } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import PageHeader from "../components/header";

export default function Login() {  
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [checked, setChecked] = React.useState(false);  

    const handleUsername = (e) => {
        setUsername(e.target.value);
    };

    const handlePassword = (e) => {
        setPassword(e.target.value);
    };

    const handleChecked = (e) => {
        setChecked(e.target.checked);
    };

    const handleSubmit = (e) => {
    // if (username === "" || password === "") {
    //   e.preventDefault();
    //   return;
    // }

    // const body = {
    //   username: username,
    //   password: password
    // };

    // fetch('/api/login', {
    //   method: "POST",
    //   body: JSON.stringify(body),
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    // })
    // .then((res) => {
    //   if (res.status == 200) {
    //     return res.json();
    //   } else {
    //     alert("Login Failure");
    //   }
    // })
    // .then((data) => {
    //   if(data.msg === "login success"){
    //     alert("Login Success");
    //     sessionStorage.setItem('user', JSON.stringify(data.body));
    //     setSStorage(sessionStorage.getItem('user'));
    //     if (checked) {
    //       localStorage.setItem('user', JSON.stringify(data.body));
    //       setLStorage(localStorage.getItem('user'));
    //     }
    //     location = '/';
    //   }
    // })
    // .catch((err) => console.log(err));
    };

    return (
        <>
            <PageHeader />
            <div id="login">
                <Form id="form" className="form" initialValues={{ remember: true }}>
                    <h1>Login</h1>
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: "Please input your username!" }]}
                    >
                        <Input
                            prefix={<UserOutlined className="site-form-item-icon" />}
                            placeholder="Username"
                            type="text"
                            name="username"
                            size="large"
                            value={username}
                            onChange={handleUsername}
                        />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: "Please input your password!" }]}
                    >
                        <Input
                            prefix={<LockOutlined className="site-form-item-icon" />}
                            placeholder="Password"
                            type="Password"
                            name="password"
                            size="large"
                            value={password}
                            onChange={handlePassword}
                        />
                    </Form.Item>
                    <Form.Item>
                        <Checkbox onChange={handleChecked}>Remember Me</Checkbox>
                        <br />
                        <br />
                        <Button
                            type="primary"
                            htmlType="submit"
                            id="submit"
                            className="login-form-button"
                            onClick={handleSubmit}
                        >
                            Log in
                        </Button>
                        <p>
                            Do not have an account?
                            <Link href="/registration"> Register Here!</Link>
                        </p>
                    </Form.Item>
                </Form>
            </div>
        </>
    );
}
