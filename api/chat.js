const fetch = global.fetch || ((...args) => import('node-fetch').then(({default: f}) => f(...args)));

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const bodyStr = Buffer.concat(chunks).toString('utf-8') || '{}';
    const body = JSON.parse(bodyStr);
    const userText = String(body.message || '').slice(0, 4000);

    let aiText = '';
    if (!apiKey) {
      aiText = `Simulación (sin GEMINI_API_KEY): recibí tu mensaje: "${userText}"`;
    } else {
      const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + encodeURIComponent(apiKey);
      const payload = {
        contents: [
          { role: 'user', parts: [{ text: userText || 'Hola' }] }
        ]
      };
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await resp.json();
      // Extraer texto
      aiText = (data?.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || '').trim();
      if (!aiText) aiText = 'No se recibió respuesta del modelo.';
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ sender: 'ai', text: aiText }));
  } catch (err) {
    console.error('Error en /api/chat:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Error procesando la solicitud' }));
  }
};


