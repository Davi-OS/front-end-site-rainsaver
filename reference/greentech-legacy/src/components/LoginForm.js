import React from "react";
import { Form, Input, Button } from "antd";

function LoginForm({ onFinish }) {
  return (
    <Form layout="vertical" onFinish={onFinish}>
      <Form.Item label="Email" name="email" rules={[{ required: true, message: "Por favor, insira seu email!" }]}>
        <Input name="email" placeholder="Email" />
      </Form.Item>
      <Form.Item label="Senha" name="password" rules={[{ required: true, message: "Por favor, insira sua senha!" }]}>
        <Input.Password name="password" placeholder="Senha" />
      </Form.Item>
      <Button type="primary" htmlType="submit" block>
        Entrar
      </Button>
    </Form>
  );
}

export default LoginForm;
