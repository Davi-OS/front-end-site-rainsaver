// frontend/src/pages/UserList.js
import React, { useEffect, useState } from 'react';
import { Table, Typography, Space, Button, Modal, Form, Input, message } from 'antd';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const { Title } = Typography;

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/person`);
      // const response = await fetch('http://localhost:8080/person');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      message.error('Erro ao carregar a lista de usuários');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/person/${id}`, {
      //await fetch(`http://localhost:8080/person/${id}`, {
        method: 'DELETE',
      });
      setUsers(users.filter((user) => user.id !== id));
      message.success('Usuário excluído com sucesso');
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      message.error('Erro ao excluir usuário');
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingUser(null);
    setIsModalOpen(false);
  };

  const saveUserChanges = async (values) => {
    try {
      const updatedData = {
        ...values,
        enderecos: values.enderecos.map((endereco) => ({
          ...endereco,
        })),
      };

      const response = await fetch(`${API_BASE_URL}/person/${editingUser.id}`, {
      // const response = await fetch(`http://localhost:8080/person/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar usuário');
      }

      const updatedUser = await response.json();
      setUsers(users.map((user) => (user.id === updatedUser.id ? updatedUser : user)));
      message.success('Usuário atualizado com sucesso');
      closeModal();
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      message.error('Erro ao atualizar usuário');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Nome',
      dataIndex: 'firstName',
      key: 'firstName',
      render: (text, record) => `${record.firstName} ${record.lastName}`,
    },
    {
      title: 'Gênero',
      dataIndex: 'gender',
      key: 'gender',
    },
    {
      title: 'Ação',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" onClick={() => openEditModal(record)}>
            Editar
          </Button>
          <Button type="primary" danger onClick={() => deleteUser(record.id)}>
            Excluir
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Title level={3}>Lista de Usuários</Title>
      <Table columns={columns} dataSource={users} loading={loading} rowKey="id" pagination={{ pageSize: 10 }} />

      {/* Modal para edição de usuário */}
      <Modal title="Editar Usuário" visible={isModalOpen} onCancel={closeModal} footer={null}>
        {editingUser && (
          <Form
            layout="vertical"
            onFinish={saveUserChanges}
            initialValues={{
              firstName: editingUser.firstName,
              lastName: editingUser.lastName,
              gender: editingUser.gender,
              enderecos: editingUser.enderecos || [{}],
            }}
          >
            <Form.Item
              label="Primeiro Nome"
              name="firstName"
              rules={[{ required: true, message: 'Por favor, insira o primeiro nome' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Último Nome"
              name="lastName"
              rules={[{ required: true, message: 'Por favor, insira o último nome' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Gênero"
              name="gender"
              rules={[{ required: true, message: 'Por favor, insira o gênero' }]}
            >
              <Input />
            </Form.Item>

            {/* Campos de endereço */}
            <Form.List name="enderecos">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, fieldKey, ...restField }) => (
                    <div key={key} style={{ marginBottom: 10 }}>
                      <Form.Item
                        {...restField}
                        label="Logradouro"
                        name={[name, 'logradouro']}
                        rules={[{ required: true, message: 'Por favor, insira o logradouro' }]}
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        label="Número"
                        name={[name, 'number']}
                        rules={[{ required: true, message: 'Por favor, insira o número' }]}
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        label="CEP"
                        name={[name, 'cep']}
                        rules={[{ required: true, message: 'Por favor, insira o CEP' }]}
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        label="Cidade"
                        name={[name, 'cidade']}
                        rules={[{ required: true, message: 'Por favor, insira a cidade' }]}
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        label="Estado"
                        name={[name, 'estado']}
                        rules={[{ required: true, message: 'Por favor, insira o estado' }]}
                      >
                        <Input />
                      </Form.Item>
                      <Button type="dashed" onClick={() => remove(name)} style={{ width: '100%', marginBottom: 10 }}>
                        Remover Endereço
                      </Button>
                    </div>
                  ))}
                  <Button type="dashed" onClick={() => add()} style={{ width: '100%' }}>
                    Adicionar Novo Endereço
                  </Button>
                </>
              )}
            </Form.List>

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Salvar Alterações
              </Button>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}

export default UserList;
