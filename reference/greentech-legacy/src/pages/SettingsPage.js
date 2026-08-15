import React, { useState, useEffect, useCallback } from "react";
import { Tabs, Form, Input, Button, Table, Modal, message } from "antd";

const { TabPane } = Tabs;

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function SettingsPage() {
  const [user, setUser] = useState(null); // Dados do usuário
  const [addresses, setAddresses] = useState([]); // Lista de endereços
  const [isModalVisible, setIsModalVisible] = useState(false); // Controle da modal
  const [modalAddress, setModalAddress] = useState(null); // Endereço para edição ou criação

  const userId = localStorage.getItem("userId");

  // Função para buscar informações do usuário e endereços
  const fetchUserData = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/person/${userId}`);
      if (!response.ok) throw new Error("Erro ao buscar dados do usuário.");
      const data = await response.json();
      setUser(data);
      setAddresses(data.enderecos || []);
    } catch (error) {
      message.error("Erro ao carregar dados: " + error.message);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) fetchUserData();
  }, [userId, fetchUserData]);

  // Atualizar dados do perfil do usuário
  const handleUpdateProfile = async (values) => {
    try {
      const response = await fetch(`${API_BASE_URL}/person/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...user, ...values }),
      });
      if (!response.ok) throw new Error("Erro ao atualizar perfil.");
      message.success("Perfil atualizado com sucesso!");
      fetchUserData();
    } catch (error) {
      message.error("Erro ao atualizar perfil: " + error.message);
    }
  };

  // Abrir modal para criar ou editar endereço
  const openAddressModal = (address = null) => {
    setModalAddress(
      address || {
        cep: "",
        logradouro: "",
        bairro: "",
        cidade: "",
        estado: "",
        numero: "",
      }
    );
    setIsModalVisible(true);
  };

  // Fechar modal
  const closeAddressModal = () => {
    setIsModalVisible(false);
    setModalAddress(null);
  };

  // Adicionar ou atualizar endereço
  const handleSaveAddress = async () => {
    const updatedAddresses = modalAddress.endereco_id
      ? addresses.map((addr) =>
          addr.endereco_id === modalAddress.endereco_id ? modalAddress : addr
        )
      : [...addresses, { ...modalAddress, endereco_id: Date.now() }];

    try {
      const response = await fetch(`${API_BASE_URL}/person/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...user, enderecos: updatedAddresses }),
      });
      if (!response.ok) throw new Error("Erro ao salvar endereço.");
      message.success("Endereço salvo com sucesso!");
      fetchUserData();
      closeAddressModal();
    } catch (error) {
      message.error("Erro ao salvar endereço: " + error.message);
    }
  };

  // Excluir endereço
  const handleDeleteAddress = async (addressId) => {
    const filteredAddresses = addresses.filter(
      (addr) => addr.endereco_id !== addressId
    );

    try {
      const response = await fetch(`${API_BASE_URL}/person/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...user, enderecos: filteredAddresses }),
      });
      if (!response.ok) throw new Error("Erro ao excluir endereço.");
      message.success("Endereço excluído com sucesso!");
      fetchUserData();
    } catch (error) {
      message.error("Erro ao excluir endereço: " + error.message);
    }
  };

  // Buscar endereço pelo CEP usando ViaCEP
  const fetchAddressByCep = async (cep) => {
    if (!cep || cep.length !== 8) {
      message.warning("Por favor, insira um CEP válido.");
      return;
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        message.error("CEP não encontrado.");
        return;
      }

      setModalAddress((prev) => ({
        ...prev,
        logradouro: data.logradouro || "",
        bairro: data.bairro || "",
        cidade: data.localidade || "",
        estado: data.uf || "",
      }));
    } catch (error) {
      message.error("Erro ao buscar CEP: " + error.message);
    }
  };

  const columns = [
    {
      title: "Cep",
      dataIndex: "cep",
      key: "cep",
    },
    {
      title: "Logradouro",
      dataIndex: "logradouro",
      key: "logradouro",
    },
    {
      title: "Número",
      dataIndex: "number",
      key: "number",
    },
    {
      title: "Cidade",
      dataIndex: "cidade",
      key: "cidade",
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
    },
    {
      title: "Ações",
      key: "actions",
      render: (_, record) => (
        <>
          <Button
            type="link"
            onClick={() => openAddressModal(record)}
            style={{ marginRight: 8 }}
          >
            Editar
          </Button>
          <Button
            type="link"
            danger
            onClick={() => handleDeleteAddress(record.endereco_id)}
          >
            Excluir
          </Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <Tabs defaultActiveKey="1">
        {/* Aba Editar Perfil */}
        <TabPane tab="Perfil" key="1">
          {user && (
            <Form
              layout="vertical"
              initialValues={{
                name: user.firstName,
                username: user.lastName,
              }}
              onFinish={handleUpdateProfile}
            >
              <Form.Item label="Nome" name="name">
                <Input placeholder="Seu nome" />
              </Form.Item>
              <Form.Item label="Sobrenome" name="username">
                <Input placeholder="Seu sobrenome" />
              </Form.Item>
            </Form>
          )}
        </TabPane>

        {/* Aba Endereços */}
        <TabPane tab="Endereços" key="2">
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
            <Button type="primary" onClick={() => openAddressModal()}>
              Novo Endereço
            </Button>
          </div>
          <Table
            dataSource={addresses}
            columns={columns}
            rowKey={(record) => record.endereco_id}
          />

          {/* Modal para editar ou adicionar endereço */}
          <Modal
            title={modalAddress?.endereco_id ? "Editar Endereço" : "Novo Endereço"}
            visible={isModalVisible}
            onCancel={closeAddressModal}
            onOk={handleSaveAddress}
            okText="Salvar"
            cancelText="Cancelar"
          >
            <Form layout="vertical">
              <Form.Item label="CEP">
                <Input
                  value={modalAddress?.cep || ""}
                  onChange={(e) =>
                    setModalAddress({ ...modalAddress, cep: e.target.value })
                  }
                  onBlur={(e) => fetchAddressByCep(e.target.value)}
                />
              </Form.Item>
              <Form.Item label="Logradouro">
                <Input
                  value={modalAddress?.logradouro || ""}
                  onChange={(e) =>
                    setModalAddress({
                      ...modalAddress,
                      logradouro: e.target.value,
                    })
                  }
                />
              </Form.Item>
              <Form.Item label="Número">
                <Input
                  value={modalAddress?.number || ""}
                  onChange={(e) =>
                    setModalAddress({
                      ...modalAddress,
                      number: e.target.value,
                    })
                  }
                />
              </Form.Item>
              <Form.Item label="Cidade">
                <Input
                  value={modalAddress?.cidade || ""}
                  onChange={(e) =>
                    setModalAddress({
                      ...modalAddress,
                      cidade: e.target.value,
                    })
                  }
                />
              </Form.Item>
              <Form.Item label="Estado">
                <Input
                  value={modalAddress?.estado || ""}
                  onChange={(e) =>
                    setModalAddress({
                      ...modalAddress,
                      estado: e.target.value,
                    })
                  }
                />
              </Form.Item>
            </Form>
          </Modal>
        </TabPane>
      </Tabs>
    </div>
  );
}

export default SettingsPage;
