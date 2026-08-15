// frontend/src/pages/LoginRegister.js
import React, { useState } from "react";
import { Row, Col, Typography, Divider, Button, message } from "antd";
import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const { Title } = Typography;

function LoginRegister({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);

  const handleLogin = async (values) => {
    try {
      const response = await fetch(`${API_BASE_URL}/person/login`, {
      // const response = await fetch("http://localhost:8080/person/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      if (response.ok) {
        message.success("Login realizado com sucesso!");
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userId", data.person.id);
        onLogin(data.person.id); // Chama a função passada como prop
      } else {
        message.error(data.message || "Erro ao fazer login.");
      }
    } catch (error) {
      message.error("Erro ao fazer login.");
      console.error(error);
    }
  };

  const handleRegister = async (formData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/person`, { 
      // const response = await fetch("http://localhost:8080/person", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        message.success("Registro realizado com sucesso!");
        setIsLogin(true);
      } else {
        const errorData = await response.json();
        message.error(errorData.message || "Erro ao registrar o usuário.");
      }
    } catch (error) {
      message.error("Erro ao registrar o usuário.");
      console.error(error);
    }
  };

  return (
    <Row style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Col span={12} style={{ padding: "40px", textAlign: "center" }}>
        <Title level={2}>Bem-vindo ao Projeto GreenTech</Title>
        <p>Soluções sustentáveis para um futuro melhor. Cadastre-se para explorar as funcionalidades.</p>
      </Col>
      <Col span={10} style={{ padding: "40px", backgroundColor: "#fff" }}>
        <Title level={3} style={{ textAlign: "center" }}>
          {isLogin ? "Login" : "Registrar"}
        </Title>
        {isLogin ? <LoginForm onFinish={handleLogin} /> : <RegisterForm onRegister={handleRegister} />}
        <Divider />
        <Button type="link" onClick={() => setIsLogin(!isLogin)} block>
          {isLogin ? "Não tem uma conta? Registre-se" : "Já tem uma conta? Faça login"}
        </Button>
      </Col>
    </Row>
  );
}

export default LoginRegister;
