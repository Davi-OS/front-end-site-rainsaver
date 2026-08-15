import React, { useState, useEffect } from "react";
import { Card, Button, Input, List, Typography, Modal, message } from "antd";

const { TextArea } = Input;
const { Title } = Typography;

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function SuccessStories() {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [newMessageContent, setNewMessageContent] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [isReplyModalVisible, setIsReplyModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId"); // ID do usuário logado

  // Buscar mensagens da API
  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/mensagem`);
      if (!response.ok) throw new Error("Erro ao carregar mensagens.");
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      message.error("Erro ao carregar mensagens: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Criar nova mensagem
  const handleNewMessage = async () => {
    if (!userId) {
      message.warning("Você precisa estar logado para publicar uma mensagem.");
      return;
    }
    if (!newMessageContent) {
      message.warning("O conteúdo da mensagem não pode estar vazio.");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/mensagem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conteudo: newMessageContent,
          curtidas: 0,
          usuario: { id: parseInt(userId, 10) },
          mensagemPai: null,
        }),
      });
      if (!response.ok) throw new Error("Erro ao criar mensagem.");
      message.success("Mensagem criada com sucesso!");
      setNewMessageContent("");
      fetchMessages();
    } catch (error) {
      message.error("Erro ao criar mensagem: " + error.message);
    }
  };

  // Responder mensagem
  const handleReply = async () => {
    if (!userId) {
      message.warning("Você precisa estar logado para responder a uma mensagem.");
      return;
    }
    if (!replyContent) {
      message.warning("O conteúdo da resposta não pode estar vazio.");
      return;
    }
    if (!selectedMessage) {
      message.error("Nenhuma mensagem selecionada para responder.");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/mensagem/${selectedMessage.id}/responder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conteudo: replyContent,
          curtidas: 0,
          usuario: { id: parseInt(userId, 10) },
          mensagemPai: { id: selectedMessage.id },
        }),
      });
      if (!response.ok) throw new Error("Erro ao enviar resposta.");
      message.success("Resposta enviada com sucesso!");
      setReplyContent("");
      setIsReplyModalVisible(false);
      fetchMessages();
    } catch (error) {
      message.error("Erro ao enviar resposta: " + error.message);
    }
  };

  // Curtir ou descurtir mensagem ou resposta
  const handleToggleLike = async (id, isLiked, isReply = false) => {
    if (!userId) {
      message.warning("Você precisa estar logado para curtir.");
      return;
    }
    try {
      const path = isReply ? `mensagem/resposta/${id}/curtir` : `mensagem/${id}/curtir`;

      await fetch(`${API_BASE_URL}/${path}`, { method: "POST" });

      // Atualiza o estado local para refletir a curtida/descurtida
      setMessages((prevMessages) =>
        prevMessages.map((message) => {
          if (isReply) {
            // Atualiza curtida na resposta
            return {
              ...message,
              respostas: message.respostas?.map((reply) =>
                reply.id === id
                  ? {
                      ...reply,
                      curtido: !reply.curtido,
                      contadorCurtidas: reply.curtido
                        ? reply.contadorCurtidas - 1
                        : reply.contadorCurtidas + 1,
                    }
                  : reply
              ),
            };
          }
          // Atualiza curtida na mensagem
          return message.id === id
            ? {
                ...message,
                curtido: !message.curtido,
                contadorCurtidas: message.curtido
                  ? message.contadorCurtidas - 1
                  : message.contadorCurtidas + 1,
              }
            : message;
        })
      );
    } catch (error) {
      message.error("Erro ao curtir/descurtir.");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <Title level={3}>Casos de Sucesso</Title>
      <Card>
        <TextArea
          rows={4}
          placeholder="Compartilhe sua história de sucesso..."
          value={newMessageContent}
          onChange={(e) => setNewMessageContent(e.target.value)}
        />
        <Button type="primary" onClick={handleNewMessage} style={{ marginTop: "10px" }} disabled={!userId}>
          Publicar
        </Button>
      </Card>

      {messages.length > 0 ? (
        <List
          itemLayout="vertical"
          dataSource={messages}
          renderItem={(message) => (
            <Card
              style={{ marginTop: "20px" }}
              actions={[
                <Button
                  type="link"
                  onClick={() => {
                    setSelectedMessage(message);
                    setIsReplyModalVisible(true);
                  }}
                >
                  Responder
                </Button>,
                <Button type="link" onClick={() => handleToggleLike(message.id, message.curtido, false)}>
                  {message.curtido ? "Descurtir" : "Curtir"} ({message.contadorCurtidas || 0})
                </Button>,
              ]}
            >
              <Card.Meta title={`Por: ${message.usuario?.firstName || "Anônimo"}`} description={message.conteudo} />
              {message.respostas?.length > 0 && (
                <List
                  dataSource={message.respostas}
                  renderItem={(reply) => (
                    <Card size="small" style={{ marginTop: "10px" }}>
                      <p>{reply.conteudo}</p>
                      <p style={{ fontSize: "12px", color: "#888" }}>— {reply.usuario?.firstName || "Anônimo"}</p>
                      <Button type="link" onClick={() => handleToggleLike(reply.id, reply.curtido, true)}>
                        {reply.curtido ? "Descurtir" : "Curtir"} ({reply.contadorCurtidas || 0})
                      </Button>
                    </Card>
                  )}
                />
              )}
            </Card>
          )}
        />
      ) : (
        <p style={{ marginTop: "20px", textAlign: "center" }}>
          Nenhuma mensagem cadastrada ainda. Seja o primeiro a compartilhar sua história de sucesso!
        </p>
      )}

      <Modal
        title="Responder Mensagem"
        visible={isReplyModalVisible}
        onCancel={() => setIsReplyModalVisible(false)}
        onOk={handleReply}
      >
        <TextArea
          rows={4}
          placeholder="Digite sua resposta..."
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
        />
      </Modal>
    </div>
  );
}

export default SuccessStories;
