import React, { useState } from "react";
import {
  Box,
  Button,
  Paper,
  TextField,
  IconButton,
  Typography,
  Divider,
  useTheme,
  alpha,
  Avatar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChatIcon from "@mui/icons-material/Chat";
import SendIcon from "@mui/icons-material/Send";
import CircularProgress from "@mui/material/CircularProgress";

// ✅ Import the existing Axios instance
import api from "../services/api"; // This is your configured axios instance

export default function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I'm PharmaBot, your AI pharmacy assistant. Ask me about any medicine.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // ✅ Use `api.post()` instead of `apiPost`
      const response = await api.post("/ai/medicine-chat", { query: input });

      const aiMessage = {
        sender: "ai",
        text: response.data?.response || "I couldn't generate a response.",
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("AI Request Failed:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Sorry, I'm having trouble connecting to the AI service.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={toggleChat}
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          backgroundColor: theme.palette.primary.main,
          color: "white",
          borderRadius: "50%",
          width: 60,
          height: 60,
          minWidth: 0,
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          "&:hover": {
            backgroundColor: theme.palette.primary.dark,
          },
          zIndex: 1300,
          transition: "all 0.3s ease",
        }}
        aria-label="Open AI Assistant"
      >
        <ChatIcon sx={{ fontSize: 30 }} />
      </Button>

      {/* Chat Panel */}
      {isOpen && (
        <Paper
          sx={{
            position: "fixed",
            bottom: 80,
            right: 16,
            width: 380,
            maxHeight: 500,
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            borderRadius: 2,
            overflow: "hidden",
            zIndex: 1300,
            backgroundColor: "background.paper",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 2,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 30, height: 30 }}>
                <ChatIcon fontSize="small" />
              </Avatar>
              <Typography variant="h6" fontWeight="bold">
                PharmaBot
              </Typography>
            </Box>
            <IconButton size="small" onClick={toggleChat}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Messages */}
          <Box
            sx={{
              flex: 1,
              p: 2,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 1,
              backgroundColor: "background.default",
            }}
          >
            {messages.map((msg, idx) => (
              <Box
                key={idx}
                sx={{
                  alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                  backgroundColor:
                    msg.sender === "user"
                      ? alpha(theme.palette.primary.main, 0.1)
                      : alpha(theme.palette.grey[300], 0.3),
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  maxWidth: "80%",
                  wordBreak: "break-word",
                }}
              >
                <Typography variant="body2">{msg.text}</Typography>
              </Box>
            ))}
            {loading && (
              <Box sx={{ alignSelf: "flex-start", px: 2, py: 1 }}>
                <CircularProgress size={20} />
              </Box>
            )}
          </Box>

          <Divider />

          {/* Input */}
          <Box sx={{ p: 1, display: "flex", gap: 1 }}>
            <TextField
              size="small"
              fullWidth
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about Paracetamol, Amoxicillin..."
              variant="outlined"
              disabled={loading}
              multiline
              maxRows={3}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              sx={{ minWidth: 40 }}
            >
              <SendIcon fontSize="small" />
            </Button>
          </Box>
        </Paper>
      )}

      {/* Animation */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
}