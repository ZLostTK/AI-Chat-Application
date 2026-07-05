const fetch = global.fetch || ((...args) => import('node-fetch').then(({default: f}) => f(...args)));

const GEMINI_MODEL = 'gemini-2.5-flash';

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const bodyStr = Buffer.concat(chunks).toString('utf-8') || '{}';
    const body = JSON.parse(bodyStr);
    const userText = String(body.message || '').slice(0, 4000);
    // Use client-provided key, fall back to env
    const apiKey = body.apiKey || process.env.GEMINI_API_KEY;

    let aiText = '';
    if (!apiKey) {
      aiText = `No API key configured. Add one in Settings to use the AI.`;
    } else {
      const model = body.model || GEMINI_MODEL;
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const payload = {
        contents: [{ role: 'user', parts: [{ text: userText || 'Hola' }] }],
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ],
      };
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      if (!resp.ok) {
        aiText = `API error: ${data?.error?.message || resp.statusText}`;
      } else {
        aiText = (data?.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || '').trim();
        if (!aiText) aiText = 'No response from model.';
      }
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ sender: 'ai', text: aiText }));
  } catch (err) {
    console.error('Error en /api/chat:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Error processing request' }));
  }
};
