require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { GoogleGenerativeAI } = require('@google/generative-ai'); // Paquete correcto

const PORT = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Inicializar Express + HTTP + WebSocket
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Inicializar Gemini si hay API Key
let genAI = null;
if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY); // Inicialización correcta
  console.log('✅ Gemini API key configurada');
} else {
  console.warn('⚠️ No hay GEMINI_API_KEY, se usarán respuestas simuladas');
}

// Función para llamar a Gemini o usar fallback
const callGeminiAPI = async (message) => {
  if (!genAI) {
    return `Simulación: recibí tu mensaje "${message}"`;
  }
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Modelo actualizado
    const result = await model.generateContent(message);
    const response = await result.response;
    console.log('La respuesta se ha enviado ✅')
    return response.text();
  } catch (error) {
    console.error('❌ Error llamando a Gemini:', error);
    return 'Error: no se pudo conectar a la IA.';
  }
};

// Resto del código permanece igual...
wss.on('connection', (ws) => {
  console.log('🔌 Cliente conectado');

  ws.on('message', async (message) => {
    try {
      // Parse the incoming message
      const parsedMessage = JSON.parse(message.toString());
      const userMessage = parsedMessage.message;
      console.log(`📩 Mensaje recibido: ${userMessage}`);

      const aiResponse = await callGeminiAPI(userMessage);

      // Send response back to the specific client that sent the message
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ 
          sender: 'ai',
          text: aiResponse 
        }));
      }
    } catch (error) {
      console.error('❌ Error procesando mensaje:', error);
      // Send error response back to client
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ 
          sender: 'ai',
          text: 'Error: No se pudo procesar tu mensaje.' 
        }));
      }
    }
  });

  ws.on('close', () => {
    console.log('🔌 Cliente desconectado');
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor WebSocket escuchando en ws://localhost:${PORT}`);
});