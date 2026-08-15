import React, { useState, useEffect } from "react";
import { Layout, Menu, Button, message } from "antd";
import {
  HomeOutlined,
  BellOutlined,
  DashboardOutlined,
  CalculatorOutlined,
  CloudOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import Home from "./pages/Home";
import LoginRegister from "./pages/LoginRegister";
import EconomyCalculator from "./pages/EconomyCalculator";
import PluvialEconomyCalculator from "./pages/PluvialEconomyCalculator";
 // import Users from "./pages/UserList";
import Dashboard from "./pages/Dashboard";
import SettingsPage from "./pages/SettingsPage";
import SuccessStories from './pages/SuccessStories';
import "./styles/App.css";

const { Header, Sider, Content } = Layout;

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Mapear nomes de páginas para exibição no cabeçalho
  const pageTitles = {
    home: "Home",
    successStories: "Casos de Sucesso",
    dashboard: "Dashboard",
    economyCalculator: "Economia Solar",
    pluvialEconomyCalculator: "Economia Pluvial",
    settings: "Configurações", // Adicionado título para a página de configurações
    login: "Login",
  };

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated");
    setIsAuthenticated(authStatus === "true");
  }, []);

  const handleLogin = (userId) => {
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("userId", userId);
    setIsAuthenticated(true);
    message.success("Login realizado com sucesso!");
    setCurrentPage("home");
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userId");
    setIsAuthenticated(false);
    setCurrentPage("home");
    message.info("Você foi desconectado.");
  };

  const navigateTo = (page) => setCurrentPage(page);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Barra superior fixa */}
      <Header
        style={{
          position: "fixed",
          top: 0,
          width: "100%",
          backgroundColor: "#001529",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 1000,
        }}>
        <div style={{ color: "#fff", fontSize: "18px", fontWeight: "bold" }}>
          GreenTech
          <span style={{ marginLeft: "85px", fontWeight: "normal", whiteSpace: "nowrap" }}>
            {pageTitles[currentPage] || "Página"}
          </span>
        </div>
        {!isAuthenticated ? (
          <Button type="primary" onClick={() => navigateTo("login")}>
            Entrar
          </Button>
        ) : (
          <Button type="default" onClick={handleLogout}>
            Sair
          </Button>
        )}
      </Header>

      <Layout style={{ marginTop: 64 }}>
        {/* Menu lateral */}
        <Sider
          theme="dark"
          width={200}
          style={{
            position: "fixed",
            height: "100vh",
            left: 0,
            top: 64,
            zIndex: 999,
          }}>
          <Menu mode="inline" theme="dark" selectedKeys={[currentPage]} style={{ height: "100%", borderRight: 0 }}>
            <Menu.Item key="home" icon={<HomeOutlined />} onClick={() => navigateTo("home")}>
              Home
            </Menu.Item>
            <Menu.Item key="successStories" icon={<BellOutlined />} onClick={() => navigateTo("successStories")}>
              Casos de Sucesso
            </Menu.Item>
            {isAuthenticated && (
              <>
                <Menu.Item key="dashboard" icon={<DashboardOutlined />} onClick={() => navigateTo("dashboard")}>
                  Dashboard
                </Menu.Item>
                <Menu.Item
                  key="economyCalculator"
                  icon={<CalculatorOutlined />}
                  onClick={() => navigateTo("economyCalculator")}>
                  Economia Solar
                </Menu.Item>
                <Menu.Item
                  key="pluvialEconomyCalculator"
                  icon={<CloudOutlined />}
                  onClick={() => navigateTo("pluvialEconomyCalculator")}>
                  Economia Pluvial
                </Menu.Item>
                <Menu.Item key="settings" icon={<SettingOutlined />} onClick={() => navigateTo("settings")}>
                  Configurações
                </Menu.Item>
              </>
            )}
          </Menu>
        </Sider>

        {/* Conteúdo principal */}
        <Layout
          style={{
            marginLeft: 200,
            padding: "24px",
            backgroundColor: "#f0f2f5",
          }}>
          <Content>
            {currentPage === "home" && <Home />}
            {currentPage === "successStories" && <SuccessStories />}
            {currentPage === "login" && <LoginRegister onLogin={handleLogin} />}
            {currentPage === "dashboard" && isAuthenticated && <Dashboard />}
            {currentPage === "economyCalculator" && isAuthenticated && <EconomyCalculator />}
            {currentPage === "pluvialEconomyCalculator" && isAuthenticated && <PluvialEconomyCalculator />}
            {currentPage === "settings" && isAuthenticated && <SettingsPage />} 
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default App;
