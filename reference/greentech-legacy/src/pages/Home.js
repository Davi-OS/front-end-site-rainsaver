import React from "react";
import { Layout, Row, Col, Typography, Card } from "antd";
import {
  BulbOutlined,
  CloudOutlined,
  TrophyOutlined,
  GlobalOutlined,
  TeamOutlined,
  HeartOutlined,
  SolutionOutlined,
} from "@ant-design/icons";

const { Content } = Layout;
const { Title, Paragraph } = Typography;

function Home() {
  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "#f0f2f5" }}>
      <Content style={{ padding: "50px" }}>
        {/* Introdução do Projeto */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <Title>Bem-vindo ao GreenTech!</Title>
          <Paragraph style={{ fontSize: "16px", color: "#555", textAlign: "justify" }}>
            <strong>GreenTech</strong> é uma plataforma revolucionária projetada para integrar
            sustentabilidade e tecnologia de forma prática e acessível. Nosso foco é oferecer
            soluções inovadoras que capacitem indivíduos, organizações e empresas a fazer escolhas
            conscientes sobre o uso de recursos naturais, como energia e água.
          </Paragraph>
          <Paragraph style={{ fontSize: "16px", color: "#555", textAlign: "justify" }}>
            Através de ferramentas interativas, como calculadoras de economia energética e
            simuladores de reaproveitamento de água, tornamos possível entender o impacto financeiro
            e ambiental das ações sustentáveis. Mais do que uma plataforma, GreenTech é um movimento
            que busca inspirar mudanças reais, promovendo o equilíbrio entre desenvolvimento
            econômico e responsabilidade ambiental.
          </Paragraph>
          <Paragraph style={{ fontSize: "16px", color: "#555", textAlign: "justify" }}>
            Juntos, construímos um futuro mais verde, mais sustentável e mais eficiente.
          </Paragraph>
        </div>

        {/* Objetivos */}
        <Row
          gutter={[16, 16]}
          justify="center"
          style={{ marginBottom: "40px", display: "flex", flexWrap: "wrap" }}
        >
          <Col xs={24} sm={12} md={8}>
            <Card hoverable style={{ height: "100%" }}>
              <BulbOutlined style={{ fontSize: "48px", color: "#ffa500" }} />
              <Title level={4} style={{ marginTop: "16px" }}>
                Energia Solar
              </Title>
              <Paragraph style={{ textAlign: "justify" }}>
                Fornecemos ferramentas para calcular os benefícios da energia solar e ajudá-lo a
                reduzir os custos de energia.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card hoverable style={{ height: "100%" }}>
              <CloudOutlined style={{ fontSize: "48px", color: "#40a9ff" }} />
              <Title level={4} style={{ marginTop: "16px" }}>
                Reuso de Água
              </Title>
              <Paragraph style={{ textAlign: "justify" }}>
                Estimamos o impacto do reuso de água da chuva para maximizar os benefícios econômicos
                e ambientais.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card hoverable style={{ height: "100%" }}>
              <TrophyOutlined style={{ fontSize: "48px", color: "#ffc53d" }} />
              <Title level={4} style={{ marginTop: "16px" }}>
                Casos de Sucesso
              </Title>
              <Paragraph style={{ textAlign: "justify" }}>
                Conheça histórias reais de pessoas e empresas que adotaram práticas sustentáveis e
                geraram impactos positivos.
              </Paragraph>
            </Card>
          </Col>
        </Row>

        {/* Sobre o Projeto */}
        <div style={{ marginBottom: "40px", textAlign: "justify" }}>
          <Title level={3}>Sobre o Projeto</Title>
          <Paragraph style={{ fontSize: "16px", color: "#555" }}>
            <strong>Sobre o GreenTech</strong>
          </Paragraph>
          <Paragraph style={{ fontSize: "16px", color: "#555" }}>
            O <strong>GreenTech</strong> nasceu como um projeto interdisciplinar desenvolvido por
            uma equipe talentosa de estudantes da PUC Minas. Alinhando tecnologia e sustentabilidade,
            o objetivo central do projeto é incentivar a adoção de práticas responsáveis, viabilizando
            o acesso a informações, ferramentas e simulações detalhadas que tornam a sustentabilidade
            algo prático e alcançável.
          </Paragraph>
        </div>

        {/* Visão, Missão e Valores */}
        <div style={{ marginBottom: "40px" }}>
          <Title level={3}>Visão, Missão e Valores</Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Card hoverable style={{ height: "100%", textAlign: "center" }}>
                <GlobalOutlined style={{ fontSize: "48px", color: "#52c41a" }} />
                <Title level={4} style={{ marginTop: "16px" }}>
                  Visão
                </Title>
                <Paragraph style={{ textAlign: "justify" }}>
                  Ser uma referência em inovação tecnológica no setor de sustentabilidade, promovendo
                  um equilíbrio entre economia e responsabilidade ambiental.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card hoverable style={{ height: "100%", textAlign: "center" }}>
                <HeartOutlined style={{ fontSize: "48px", color: "#ff4d4f" }} />
                <Title level={4} style={{ marginTop: "16px" }}>
                  Missão
                </Title>
                <Paragraph style={{ textAlign: "justify" }}>
                  Capacitar indivíduos e organizações a adotar práticas sustentáveis que promovam
                  economia e cuidado com o planeta.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card hoverable style={{ height: "100%", textAlign: "center" }}>
                <TeamOutlined style={{ fontSize: "48px", color: "#1890ff" }} />
                <Title level={4} style={{ marginTop: "16px" }}>
                  Valores
                </Title>
                <Paragraph style={{ textAlign: "justify" }}>
                  Sustentabilidade, inovação, acessibilidade, educação e impacto social são os
                  pilares que guiam o nosso trabalho.
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>

        {/* Equipe */}
        <div style={{ marginBottom: "40px" }}>
          <Title level={3} style={{ textAlign: "center" }}>
            Nossa Equipe
          </Title>
          <Row gutter={[16, 16]} justify="center">
            <Col xs={24} sm={12} md={8}>
              <Card hoverable style={{ height: "100%" }}>
                <TeamOutlined style={{ fontSize: "48px", color: "#40a9ff" }} />
                <Title level={4} style={{ marginTop: "16px" }}>
                  Kelly de Lima Ferreira
                </Title>
                <Paragraph>
                  <strong>Papel:</strong> Gerente de Projeto
                </Paragraph>
                <Paragraph>
                  Coordena as atividades da equipe e garante o cumprimento dos
                  prazos e objetivos do projeto.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card hoverable style={{ height: "100%" }}>
                <SolutionOutlined style={{ fontSize: "48px", color: "#ffa500" }} />
                <Title level={4} style={{ marginTop: "16px" }}>
                  Gustavo Nunes Pontes
                </Title>
                <Paragraph>
                  <strong>Papel:</strong> Designer de Interface
                </Paragraph>
                <Paragraph>
                  Responsável por criar a experiência do usuário (UX) e o design
                  visual da plataforma.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card hoverable style={{ height: "100%" }}>
                <TeamOutlined style={{ fontSize: "48px", color: "#ffc53d" }} />
                <Title level={4} style={{ marginTop: "16px" }}>
                  Luiz Henrique Ferraz
                </Title>
                <Paragraph>
                  <strong>Papel:</strong> Desenvolvedor Backend
                </Paragraph>
                <Paragraph>
                  Desenvolveu a base técnica e as APIs que suportam as
                  funcionalidades da plataforma.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card hoverable style={{ height: "100%" }}>
                <SolutionOutlined style={{ fontSize: "48px", color: "#40a9ff" }} />
                <Title level={4} style={{ marginTop: "16px" }}>
                  Marcelo Vitor Martins
                </Title>
                <Paragraph>
                  <strong>Papel:</strong> Analista de Requisitos
                </Paragraph>
                <Paragraph>
                  Realizou a análise e documentação dos requisitos do sistema.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card hoverable style={{ height: "100%" }}>
                <TeamOutlined style={{ fontSize: "48px", color: "#ffa500" }} />
                <Title level={4} style={{ marginTop: "16px" }}>
                  Davi de Oliveira Santos
                </Title>
                <Paragraph>
                  <strong>Papel:</strong> Testes e Qualidade
                </Paragraph>
                <Paragraph>
                  Garantiu que todas as funcionalidades atendessem aos requisitos
                  com excelência.
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
      </Content>
    </Layout>
  );
}

export default Home;
