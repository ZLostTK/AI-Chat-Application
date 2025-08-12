## AI Chat Application

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

## Desarrollo local (sin WS)

Recomendado: usar Vercel CLI o Netlify CLI para levantar el frontend y la función HTTP de chat.

### Opción A: Netlify (recomendado por simpleza)
1) Instalar dependencias del frontend:
```bash
cd client
npm ci
```
2) Volver a la raíz y arrancar entorno local con funciones:
```bash
cd ..
npm i -g netlify-cli  # si no la tienes
netlify dev
```
3) (Opcional) Exporta `GEMINI_API_KEY` antes de arrancar:
```bash
export GEMINI_API_KEY=tu_clave
```
4) Abre `http://localhost:8888`. El frontend llama a `POST /api/chat`.

### Opción B: Vercel
1) Instalar dependencias del frontend:
```bash
cd client && npm ci && cd ..
```
2) Arrancar entorno local con funciones:
```bash
npm i -g vercel  # si no la tienes
vercel dev
```
3) (Opcional) Exporta `GEMINI_API_KEY` antes de arrancar:
```bash
export GEMINI_API_KEY=tu_clave
```
4) Abre la URL que indica la CLI (suele ser `http://localhost:3000`).

Nota: En este flujo no necesitas correr un servidor WS. El cliente usa `fetch('/api/chat')`.

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