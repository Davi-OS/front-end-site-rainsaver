import React, { useState } from "react";
import { Row, Col, Form, Input, Button, Typography, Select, Divider, message } from "antd";

const { Title } = Typography;
const { Option } = Select;

function RegisterForm({ onRegister }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "Outros",
    email: "",
    password: "",
    confirmPassword: "",
    enderecos: [],
  });

  const [currentAddress, setCurrentAddress] = useState({
    logradouro: "",
    number: "",
    cep: "",
    cidade: "",
    estado: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setCurrentAddress((prevAddress) => ({ ...prevAddress, [name]: value }));
  };

  const fetchAddressByCep = async () => {
    const cep = currentAddress.cep.replace(/\D/g, "");
    if (cep.length !== 8) {
      message.error("Por favor, insira um CEP válido com 8 dígitos.");
      return;
    }
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (data.erro) {
        message.error("CEP não encontrado.");
        return;
      }
      setCurrentAddress((prevAddress) => ({
        ...prevAddress,
        logradouro: data.logradouro || "",
        cidade: data.localidade || "",
        estado: data.uf || "",
      }));
    } catch (error) {
      message.error("Não foi possível buscar o CEP.");
      console.error("Erro ao buscar o CEP:", error);
    }
  };

  const handleRegister = async () => {
    if (formData.password !== formData.confirmPassword) {
      message.error("As senhas não coincidem.");
      return;
    }

    const { logradouro, number, cep, cidade, estado } = currentAddress;
    if (!logradouro || !number || !cep || !cidade || !estado) {
      message.error("Por favor, preencha todos os campos do endereço.");
      return;
    }

    const dataToSend = {
      ...formData,
      enderecos: [currentAddress],
    };
    delete dataToSend.confirmPassword;

    onRegister(dataToSend);
  };

  return (
    <>
      <Title level={4}>Informações Pessoais</Title>
      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Form.Item
            label="Nome"
            labelCol={{ span: 24 }} // Define que a label ocupa toda a largura
            wrapperCol={{ span: 24 }} // Define que o campo ocupa toda a largura
            required>
            <Input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Nome" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item label="Sobrenome" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} required>
            <Input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Sobrenome" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item label="Gênero" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }}>
            <Select
              name="gender"
              value={formData.gender}
              onChange={(value) => setFormData((prevData) => ({ ...prevData, gender: value }))}>
              <Option value="Feminino">Feminino</Option>
              <Option value="Masculino">Masculino</Option>
              <Option value="Outros">Outros</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={24}>
          <Form.Item label="Email" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} required>
            <Input name="email" value={formData.email} onChange={handleChange} placeholder="Email" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item label="Senha" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} required>
            <Input.Password name="password" value={formData.password} onChange={handleChange} placeholder="Senha" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item label="Confirmar Senha" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} required>
            <Input.Password
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirmar Senha"
            />
          </Form.Item>
        </Col>
      </Row>

      <Divider />

      <Title level={4}>Endereço</Title>
      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Form.Item label="CEP" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} required>
            <Input
              name="cep"
              value={currentAddress.cep}
              onChange={handleAddressChange}
              onBlur={fetchAddressByCep}
              placeholder="CEP"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item label="Cidade" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} required>
            <Input name="cidade" value={currentAddress.cidade} onChange={handleAddressChange} placeholder="Cidade" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item label="Estado" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} required>
            <Input name="estado" value={currentAddress.estado} onChange={handleAddressChange} placeholder="Estado" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={16}>
          <Form.Item label="Logradouro" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} required>
            <Input name="logradouro" value={currentAddress.logradouro} placeholder="Logradouro" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item label="Número" labelCol={{ span: 24 }} wrapperCol={{ span: 24 }} required>
            <Input name="number" value={currentAddress.number} onChange={handleAddressChange} placeholder="Número" />
          </Form.Item>
        </Col>
      </Row>
      <Button type="primary" onClick={handleRegister} block>
        Registrar
      </Button>
    </>
  );
}

export default RegisterForm;
