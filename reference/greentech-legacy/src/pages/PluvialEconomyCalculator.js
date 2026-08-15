import React, { useState, useEffect } from 'react';
import { Typography, Button, Card, Form, Divider, Select, Input, message } from 'antd';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const { Title, Text } = Typography;
const { Option } = Select;

function PluvialEconomyCalculator() {
  const [formData, setFormData] = useState({
    selectedAddressId: '',
    roofArea: '',
  });
  const [addresses, setAddresses] = useState([]);
  const [result, setResult] = useState(null); // Estado para armazenar o resultado do cálculo

  // Função para buscar o usuário e endereços
  const fetchUserAndAddresses = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      message.warning('Usuário não autenticado.');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/person/${userId}`);
      if (!response.ok) throw new Error('Erro ao buscar dados do usuário');
      const data = await response.json();
      setAddresses(data.enderecos || []);
    } catch (error) {
      message.error('Erro ao carregar endereços: ' + error.message);
    }
  };

  useEffect(() => {
    fetchUserAndAddresses();
  }, []);

  const handleSubmit = async () => {
    if (!formData.selectedAddressId) {
      message.warning('Selecione um endereço antes de continuar.');
      return;
    }
    if (!formData.roofArea) {
      message.warning('Insira a área do telhado para o cálculo.');
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/pluvial/endereco/${formData.selectedAddressId}/${formData.roofArea}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao calcular economia pluvial.');
      }
      const data = await response.json();
      setResult(data.pluvialEconomy); // Armazena o resultado do cálculo no estado
      message.success('Cálculo realizado com sucesso!');
    } catch (error) {
      message.error('Erro ao realizar o cálculo: ' + error.message);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px' }}>
      <Card bordered style={{ backgroundColor: '#fff' }}>
        <Title level={3} style={{ textAlign: 'center' }}>Calculadora de Economia Pluvial</Title>
        {addresses.length === 0 ? (
          <div
            style={{
              backgroundColor: '#fffae6',
              padding: '16px',
              borderRadius: '4px',
              marginBottom: '20px',
              textAlign: 'center',
            }}
          >
            <Text style={{ color: '#d48806' }}>
              Você ainda não tem um endereço cadastrado. Por favor, vá para a página de Configurações para adicionar um endereço.
            </Text>
          </div>
        ) : (
          <Form onFinish={handleSubmit} layout="vertical">
            <Divider>Endereço</Divider>
            <Form.Item label="Selecione o Endereço">
              <Select
                value={formData.selectedAddressId}
                onChange={(value) => setFormData({ ...formData, selectedAddressId: value })}
                placeholder="Selecione um endereço"
                style={{ width: '100%' }}
                required
              >
                {addresses.map((address, index) => (
                  <Option key={index} value={address.endereco_id}>
                    {`${address.logradouro}, ${address.cidade} - ${address.estado}`}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Área de Captação do Telhado (em m²)">
              <Input
                type="number"
                value={formData.roofArea}
                onChange={(e) => setFormData({ ...formData, roofArea: e.target.value })}
                placeholder="Exemplo: 50"
                required
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Calcular Economia Pluvial
              </Button>
            </Form.Item>
          </Form>
        )}

        {/* Exibe o Resultado se Disponível */}
        {result && (
          <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f0f2f5', borderRadius: '8px' }}>
            <Title level={4}>Resultado do Cálculo</Title>
            <p><strong>Consumo no Primeiro Trimestre:</strong> {result.first_quarter_captaion} m³ ou Litros</p>
            <p><strong>Consumo no Segundo Trimestre:</strong> {result.second_quarter_captaion} m³ ou Litros</p>
            <p><strong>Consumo no Terceiro Trimestre:</strong> {result.third_quarter_captaion} m³ ou Litros</p>
            <p><strong>Consumo no Quarto Trimestre:</strong> {result.fourth_quarter_captaion} m³ ou Litros</p>
          </div>
        )}
      </Card>
    </div>
  );
}

export default PluvialEconomyCalculator;
