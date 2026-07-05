require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { GoogleGenerativeAI } = require('@google/generative-ai'); // SDK oficial

const PORT = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Inicializar Express + HTTP + WebSocket
const app = express();
app.use(express.json());
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Inicializar Gemini si hay API Key (env fallback)
let genAI = null;
if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  console.log('✅ Gemini API key configurada desde env');
} else {
  console.warn('⚠️ No hay GEMINI_API_KEY en env, se aceptarán keys desde el cliente');
}

// Obtener o inicializar genAI para una key específica
function getGenAI(apiKey) {
  if (!apiKey) return genAI; // fallback a env
  return new GoogleGenerativeAI(apiKey);
}

// Función genérica de conversación (acepta apiKey y modelo opcionales)
const callGeminiAPI = async (message, apiKey, modelName = 'gemini-2.5-flash') => {
  const ai = getGenAI(apiKey);
  if (!ai) {
    return `Simulación: recibí tu mensaje "${message}"`;
  }
  try {
    console.log(`[Server] model=${modelName} via callGeminiAPI`);
    const model = ai.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('❌ Error llamando a Gemini:', error);
    return 'Error: no se pudo conectar a la IA.';
  }
};

// HTTP endpoint para /api/chat (útil en desarrollo local sin Vercel)
app.post('/api/chat', async (req, res) => {
  try {
    const { message, apiKey, model: modelName } = req.body || {};
    const userText = String(message || '').slice(0, 4000);
    const finalModel = modelName || 'gemini-2.5-flash';
    console.log(`[Server] POST /api/chat model=${finalModel}`);
    const ai = apiKey ? new GoogleGenerativeAI(apiKey) : genAI;
    if (!ai) {
      return res.json({ sender: 'ai', text: 'No API key configured. Add one in Settings.' });
    }
    const model = ai.getGenerativeModel({ model: finalModel });
    const result = await model.generateContent(userText);
    const response = await result.response;
    res.json({ sender: 'ai', text: response.text() || 'No response.' });
  } catch (err) {
    console.error('❌ Error en /api/chat:', err);
    res.status(500).json({ error: 'Error processing request' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Función para ejecutar código con Gemini Code Execution (Python)
const executeCodeWithGemini = async ({ language = 'python', code = '' }, apiKey) => {
  const ai = getGenAI(apiKey);
  if (!ai) {
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

wss.on('connection', (ws) => {
  console.log('🔌 Cliente conectado');

  ws.on('message', async (message) => {
    try {
      const parsedMessage = JSON.parse(message.toString());
      const userMessage = parsedMessage.message;
      const apiKey = parsedMessage.apiKey; // client-provided key
      const modelName = parsedMessage.model || 'gemini-2.5-flash';
      console.log(`📩 Mensaje recibido: ${userMessage?.slice(0, 50)}... [Server] model=${modelName}`);

      let aiResponse;
      if (typeof userMessage === 'string' && userMessage.startsWith('::EXEC_CODE::')) {
        try {
          const payload = JSON.parse(userMessage.replace('::EXEC_CODE::', ''));
          aiResponse = await executeCodeWithGemini(payload || {}, apiKey);
        } catch (err) {
          console.error('❌ Payload de ejecución inválido:', err);
          aiResponse = 'Error: payload de ejecución inválido.';
        }
      } else {
        aiResponse = await callGeminiAPI(userMessage, apiKey, modelName);
      }

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ sender: 'ai', text: aiResponse }));
      }
    } catch (error) {
      console.error('❌ Error procesando mensaje:', error);
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