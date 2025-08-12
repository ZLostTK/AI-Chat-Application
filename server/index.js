require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { GoogleGenerativeAI } = require('@google/generative-ai'); // SDK oficial

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

// Función genérica de conversación
const callGeminiAPI = async (message) => {
  if (!genAI) {
    return `Simulación: recibí tu mensaje "${message}"`;
  }
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(message);
    const response = await result.response;
    console.log('La respuesta se ha enviado ✅')
    return response.text();
  } catch (error) {
    console.error('❌ Error llamando a Gemini:', error);
    return 'Error: no se pudo conectar a la IA.';
  }
};

// Función para ejecutar código con Gemini Code Execution (Python)
const executeCodeWithGemini = async ({ language = 'python', code = '' }) => {
  if (!genAI) {
    return 'Simulación de ejecución: entorno no configurado.';
  }
  try {
    // Solo se admite Python en Code Execution hoy
    const lang = (language || 'python').toLowerCase();
    if (lang !== 'python' && lang !== 'py') {
      return 'La ejecución en Gemini está disponible solo para Python.';
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      tools: [{ codeExecution: {} }],
    });

    const prompt = `Ejecuta exactamente el siguiente código Python y devuelve únicamente la salida del programa. No expliques nada adicional.\n\n\`\`\`python\n${code}\n\`\`\``;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const resp = await result.response;

    // Intentar extraer un resultado estructurado si está disponible
    try {
      const candidates = resp.candidates || [];
      for (const cand of candidates) {
        const parts = (cand.content && cand.content.parts) || [];
        for (const p of parts) {
          if (p && (p.codeExecutionResult || p.code_execution_result)) {
            const r = p.codeExecutionResult || p.code_execution_result;
            const out = r.output || r.stdout || r.logs || '';
            if (out) return String(out);
          }
        }
      }
    } catch (_) {
      // si falla, devolvemos el texto plano
    }

    return resp.text();
  } catch (error) {
    console.error('❌ Error ejecutando código con Gemini:', error);
    return 'Error: no se pudo ejecutar el código.';
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

      let aiResponse;
      if (typeof userMessage === 'string' && userMessage.startsWith('::EXEC_CODE::')) {
        try {
          const payload = JSON.parse(userMessage.replace('::EXEC_CODE::', ''));
          aiResponse = await executeCodeWithGemini(payload || {});
        } catch (err) {
          console.error('❌ Payload de ejecución inválido:', err);
          aiResponse = 'Error: payload de ejecución inválido.';
        }
      } else {
        aiResponse = await callGeminiAPI(userMessage);
      }

      // Send response back to the specific client that sent the message
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ sender: 'ai', text: aiResponse }));
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