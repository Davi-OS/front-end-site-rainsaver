// frontend/src/pages/EconomyCalculator.js
import React, { useState, useEffect } from 'react';
import { Typography, Button, Input, Row, Col, Form, Divider, Card, Select, message } from 'antd';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const { Title, Text } = Typography;
const { Option } = Select;

function EconomyCalculator() {
  const [formData, setFormData] = useState({
    lastBillValue: '',
    lastBillConsumption: '',
    consumptionList: ['', '', '', '', '', ''],
    kwValue: '',
    connection: 'monofasico',
  });
  const [userId, setUserId] = useState(null);
  const [result, setResult] = useState(null);

  // Obtém o ID do usuário logado ao carregar o componente
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(parseInt(storedUserId, 10));
    } else {
      message.error('Usuário não está logado.');
    }
  }, []);

  const handleConsumptionChange = (index, value) => {
    const newConsumptionList = [...formData.consumptionList];
    newConsumptionList[index] = value;
    setFormData((prevData) => ({ ...prevData, consumptionList: newConsumptionList }));
  };

  const handleSubmit = async () => {
    try {
      if (!userId) {
        message.error('ID do usuário não encontrado. Faça login para continuar.');
        return;
      }
      const response = await fetch(`${API_BASE_URL}/fotovoltaico/calc-economy`, {
      //const response = await fetch('http://localhost:8080/fotovoltaico/calc-economy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lastBillValue: parseFloat(formData.lastBillValue || 0).toFixed(2),
          lastBillConsumption: parseInt(formData.lastBillConsumption, 10),
          consumptionList: formData.consumptionList.map(value => parseInt(value || 0, 10)),
          kwValue: parseFloat(formData.kwValue || 0).toFixed(2),
          connection: formData.connection,
          userId: userId  // ID do usuário inserido automaticamente
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao calcular economia.');
      }

      const data = await response.json();
      setResult(data.payload);
    } catch (error) {
      console.error('Erro ao calcular economia:', error);
      message.error(error.message);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '20px auto', padding: '20px' }}>
      <Row gutter={24} justify="center">
        
        {/* Se o resultado ainda não estiver calculado, o formulário fica centralizado */}
        <Col span={result ? 12 : 24}>
          <Card bordered style={{ backgroundColor: '#fff' }}>
            <Title level={3} style={{ textAlign: 'center' }}>Calculadora de Economia Fotovoltaica</Title>
            <Form onFinish={handleSubmit} layout="vertical">
              
              {/* Última Conta */}
              <Divider>Última Conta</Divider>
              <Form.Item label="Valor da Última Conta (em R$)">
                <Input
                  type="number"
                  placeholder="Exemplo: 280.00"
                  value={formData.lastBillValue}
                  onChange={(e) => setFormData({ ...formData, lastBillValue: e.target.value })}
                  required
                />
              </Form.Item>

              <Form.Item label="Consumo da Última Conta (em kWh)">
                <Input
                  type="number"
                  placeholder="Exemplo: 350"
                  value={formData.lastBillConsumption}
                  onChange={(e) => setFormData({ ...formData, lastBillConsumption: e.target.value })}
                  required
                />
              </Form.Item>

              {/* Consumos dos Últimos 6 Meses */}
              <Divider>Consumos dos Últimos 6 Meses (em kWh)</Divider>
              <Row gutter={16}>
                {formData.consumptionList.map((value, index) => (
                  <Col span={8} key={index}>
                    <Form.Item label={`Mês ${index + 1}`}>
                      <Input
                        type="number"
                        placeholder="Consumo em kWh"
                        value={formData.consumptionList[index]}
                        onChange={(e) => handleConsumptionChange(index, e.target.value)}
                        required
                      />
                    </Form.Item>
                  </Col>
                ))}
              </Row>

              {/* Informações Adicionais */}
              <Divider>Informações Adicionais</Divider>
              <Form.Item label="Valor do kWh (em R$)">
                <Input
                  type="number"
                  placeholder="Exemplo: 0.75"
                  value={formData.kwValue}
                  onChange={(e) => setFormData({ ...formData, kwValue: e.target.value })}
                  required
                />
              </Form.Item>

              <Form.Item label="Tipo de Conexão">
                <Select
                  value={formData.connection}
                  onChange={(value) => setFormData({ ...formData, connection: value })}
                  required
                >
                  <Option value="monofasico">Monofásico</Option>
                  <Option value="bifasico">Bifásico</Option>
                  <Option value="trifasico">Trifásico</Option>
                </Select>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Calcular Economia
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Exibe o resultado ao lado do formulário apenas após o cálculo */}
        {result && (
          <Col span={12}>
            <Card bordered style={{ backgroundColor: '#fff', padding: '20px' }}>
              <Title level={4} style={{ textAlign: 'center' }}>Detalhes da Economia - Conta de Energia</Title>
              <Divider />
              
              <Row justify="space-between" style={{ marginBottom: '10px' }}>
                <Text strong>Consumo Médio Mensal (kWh):</Text>
                <Text>{result.averageConsumptionKw}</Text>
              </Row>

              <Row justify="space-between" style={{ marginBottom: '10px' }}>
                <Text strong>Valor Médio da Conta (R$):</Text>
                <Text>{result.averageBillValue}</Text>
              </Row>

              <Row justify="space-between" style={{ marginBottom: '10px' }}>
                <Text strong>Iluminação Pública (R$):</Text>
                <Text>{result.publicLighting}</Text>
              </Row>

              <Row justify="space-between" style={{ marginBottom: '10px' }}>
                <Text strong>Valor Mínimo da Conta (R$):</Text>
                <Text>{result.minBillValue}</Text>
              </Row>

              <Divider dashed />

              <Row justify="space-between">
                <Text strong style={{ color: 'green' }}>Economia Média (R$):</Text>
                <Text style={{ color: 'green', fontWeight: 'bold' }}>{result.averageBillEconomy}</Text>
              </Row>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
}

export default EconomyCalculator;
