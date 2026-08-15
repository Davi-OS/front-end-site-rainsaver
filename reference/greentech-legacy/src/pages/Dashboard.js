import React from "react";
import RegionsDashboard from "../components/RegionsDashboard";
import { Typography } from "antd";

const { Title } = Typography;

const Dashboard = () => {
  return (
    <div style={{ padding: "24px" }}>
      <Title level={3}>Regiões mais acessadas</Title>
      <RegionsDashboard />
    </div>
  );
};

export default Dashboard;
