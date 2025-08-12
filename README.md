## AI Chat Application [![DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/ZLostTK/AI-Chat-Application) [![Netlify Status](https://api.netlify.com/api/v1/badges/97033f85-09d9-4326-b78c-1c70e649ff16/deploy-status)](https://app.netlify.com/projects/ai-chat-application-theta/deploys)

Aplicación de chat con frontend React (Vite + TypeScript) y backend sin WebSocket usando endpoints HTTP compatibles con despliegue gratis en Vercel o Netlify.

### Requisitos
- Node.js 18+
- npm o pnpm
- Opcional (para desarrollo local con funciones):
  - Vercel CLI o Netlify CLI

### Variables de entorno
- `GEMINI_API_KEY`: clave de Google Gemini para respuestas reales.
  - Si no la defines, el backend responde en modo simulación.

### Estructura relevante
- `client/`: frontend React (Vite)
- `api/chat.js`: función HTTP para Vercel (`POST /api/chat`)
- `netlify/functions/chat.js`: función HTTP para Netlify (redirigida a `/api/chat`)
- `vercel.json` y `netlify.toml`: configuración de despliegue
- `server/index.js`: servidor WebSocket de desarrollo (opcional, no requerido)

---

## Modos de conexión: API HTTP vs WebSocket

El cliente soporta dos transportes: API HTTP (`/api/chat`) y WebSocket. Puedes alternar entre ambos sin cambiar código de negocio.

- API HTTP: usa `useChatApi` con `fetch('/api/chat')`. Ideal para Vercel/Netlify sin WS.
- WebSocket: usa `useWebSocket(url)` para conexión en tiempo real (por ejemplo, `ws://localhost:3001`).

### Cómo alternar el transporte

Orden de precedencia para seleccionar transporte (de mayor a menor):
1. Parámetro de URL `?transport=ws|api` y opcional `&wsUrl=ws://host:puerto`
2. `localStorage.setItem('chat:transport','ws'|'api')`
3. Variable de entorno `VITE_CHAT_TRANSPORT=ws|api` y `VITE_WS_URL=ws://host:puerto`
4. Valor por defecto: `api`

El componente `Chat` detecta esto automáticamente al montar:

- Si `transport=ws`, usará `useWebSocket` apuntando a `VITE_WS_URL` o `ws://localhost:3001` si no está definida.
- Si `transport=api`, usará `useChatApi`.

En la UI, verás una etiqueta `API` o `WS` junto al estado de conexión; en modo WS también muestra la URL.

### Ejemplos rápidos

- Forzar HTTP API temporalmente (URL):
  `http://localhost:5173/?transport=api`

- Forzar WebSocket con URL explícita (URL):
  `http://localhost:5173/?transport=ws&wsUrl=ws://localhost:3001`

- Persistir preferencia en el navegador (desde consola dev):
  ```js
  localStorage.setItem('chat:transport', 'ws');
  // opcionalmente:
  localStorage.setItem('chat:transport', 'api');
  ```

- Configurar por variables de entorno (crear `.env` en `client/` o exportar antes de dev/build):
  ```bash
  # client/.env.local
  VITE_CHAT_TRANSPORT=ws   # o api
  VITE_WS_URL=ws://localhost:3001
  ```

### Consejos para depurar WebSocket

- Asegúrate de que el servidor WS está arrancado y accesible desde el navegador:
  ```bash
  cd server
  npm install
  node index.js  # ws://localhost:3001
  ```
- Comprueba CORS/CSR: los WS no usan CORS, pero proxies/dev servers pueden bloquear si usas wss sin certificado válido.
- Observa la consola del navegador: el hook `useWebSocket` loguea eventos (open, message, close, reconnect).
- El cliente reintenta la conexión automáticamente cada 3s si se corta.

Si ves "error al conectar" en modo WS, revisa:
- Que `ws://localhost:3001` sea alcanzable (puerto abierto, sin firewall).
- Que el servidor envíe JSON con `{ sender: 'ai', text: '...' }` para respuestas.
- Que no haya colisiones con el proxy del dev server (puedes probar con `?wsUrl=ws://127.0.0.1:3001`).

---

## Despliegue en producción

### Vercel
1) Configurar variable `GEMINI_API_KEY` en Settings → Environment Variables.
2) Conectar el repositorio y desplegar.
   - `vercel.json`:
     - Construye el frontend (`client`) como estático.
     - Expone la función `api/chat.js` en `/api/chat`.

### Netlify
1) Configurar variable `GEMINI_API_KEY` en Site settings → Environment variables.
2) Conectar el repositorio y desplegar.
   - `netlify.toml`:
     - Construye el frontend (`client/dist`).
     - Redirige `/api/*` a `/.netlify/functions/*` (nuestra `functions/chat.js`).

---

## Desarrollo opcional con WebSocket (local)
El archivo `server/index.js` mantiene un servidor WS para pruebas locales. El frontend actual está preparado para HTTP; si deseas usar WS, necesitarías restaurar el hook de WS en `client` y apuntar a `ws://localhost:3001`.

Para arrancar el WS localmente:
```bash
cd server
npm install
node index.js
# Servirá en ws://localhost:3001
```

---

## Solución de problemas
- 404 en `/api/chat` en local: asegúrate de usar `netlify dev` o `vercel dev` desde la raíz.
- Respuesta "Simulación": define `GEMINI_API_KEY` en el entorno.
- Node < 18: actualiza Node (se usa `fetch` nativo en funciones Vercel/Netlify).
