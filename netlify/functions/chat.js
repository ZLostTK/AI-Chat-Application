exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const userText = String(body.message || '').slice(0, 4000);
    const apiKey = body.apiKey || process.env.GEMINI_API_KEY;

    let aiText = '';
    if (!apiKey) {
      aiText = 'No API key configured. Add one in Settings to use the AI.';
    } else {
      const model = body.model || 'gemini-2.5-flash';
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

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender: 'ai', text: aiText }),
    };
  } catch (err) {
    console.error('Error en Netlify function /chat:', err);
    return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Error processing request' }) };
  }
};
