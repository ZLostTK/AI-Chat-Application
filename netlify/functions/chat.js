exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const body = JSON.parse(event.body || '{}');
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
      aiText = (data?.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || '').trim();
      if (!aiText) aiText = 'No se recibió respuesta del modelo.';
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender: 'ai', text: aiText })
    };
  } catch (err) {
    console.error('Error en Netlify function /chat:', err);
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Error procesando la solicitud' }) };
  }
};


