# AI ChatBot

Aplicación de chat con IA usando Gemini API. Soporta texto, generación de imágenes y TTS (text-to-speech) con selección de modelo, historial de conversaciones, tema oscuro/claro y conexión vía HTTP API o WebSocket.

---

## Stack

| Capa | Tecnología |
|---|---|
| **Frontend** | React 18 + TypeScript + Vite + Tailwind CSS |
| **Backend** | Express + WebSocket (`ws`) |
| **IA** | Google Gemini API (SDK `@google/generative-ai`) |
| **Despliegue** | Vercel (serverless) / Netlify (functions) |

---

## Funcionalidades

### Modelos de IA

- **Texto:** cualquier modelo Gemini que soporte `generateContent` (ej. `gemini-2.5-flash`)
- **Imagen:** modelos con "image" en el nombre → activa `responseModalities: ['TEXT', 'IMAGE']`, renderiza `inlineData` como markdown
- **TTS:** modelos con "tts" en el nombre → activa `responseModalities: ['AUDIO']`, usa voz `Kore`, renderiza audio HTML
- Modelos conocidos inyectados aunque la API no los liste:
  - `gemini-2.5-flash-preview-image` — Gemini 2.5 Flash Image
  - `gemini-3.1-flash-tts-preview` — Gemini 3.1 Flash TTS
- Límite de salida: **500 tokens** por respuesta
- System instruction: *"Responde de forma breve y concisa. Sé directo, sin rodeos."*

### Transporte

| Modo | Descripción |
|---|---|
| **HTTP API** | `fetch('/api/chat')` — serverless (Vercel/Netlify) |
| **WebSocket** | Conexión persistente en tiempo real (`ws://localhost:3001`) |

Selección por precedencia:
1. Parámetro URL `?transport=ws|api` (+ `&wsUrl=ws://host:puerto`)
2. `localStorage('chat:transport')`
3. `VITE_CHAT_TRANSPORT` / `VITE_WS_URL` en `.env`
4. Default: `api`

### Gestión de API Key

- Modal al primer inicio (`ApiKeyModal`)
- Almacenada en `localStorage('gemini:apiKey')`
- Gestión en SettingsDrawer (ver últimos 4 chars / editar / eliminar)
- Llamadas directas del navegador a Gemini API cuando hay key (sin proxy)
- Fallback al servidor cuando no hay key

### Historial de conversaciones

- Guardado automático en `localStorage('chat:conversations')`
- Agrupado por fecha: Hoy / Ayer / Anteriores
- Sidebar con título (primer mensaje, 50 chars máx.)
- Clic para cargar, botón "New Chat" para empezar una nueva
- Sincronización entre pestañas vía evento `storage`

### Conexión y estado

- Health check cada **30 segundos** (Gemini API directa o `/api/health`)
- Indicador: Connected (verde), Disconnected (gris), API Key Needed (ámbar)
- Reconexión automática cada 3s en modo WebSocket
- Logs en consola del navegador y servidor con el modelo usado

### Tema y accesibilidad

- Modos: Oscuro / Claro / Sistema
- Alto contraste
- Tamaño de fuente: Pequeño / Medio / Grande
- Movimiento reducido
- Colores vía CSS custom properties (`--color-bg-primary`, `--color-text-primary`, etc.)

### SettingsDrawer

Panel deslizable (desktop: lateral derecho, mobile: bottom sheet 85vh):
- **Appearance** — Dark / Light / System
- **Accessibility** — High Contrast, Font Size, Reduced Motion
- **Connection** — HTTP API / WebSocket
- **API Key** — mostrar últimos 4 caracteres, botón Change/Add
- **About** — v1.0.0

### Páginas demo

- Chat (página principal)
- Markdown Demo (renderizado de markdown)
- Simple Test (prueba básica)

---

## Requisitos

- Node.js 18+
- pnpm (o npm)
- Opcional: Vercel CLI / Netlify CLI (despliegue local)

## Variables de entorno

| Variable | Dónde | Descripción |
|---|---|---|
| `GEMINI_API_KEY` | servidor | Key para respuestas reales (fallback si el cliente no envía) |
| `VITE_CHAT_TRANSPORT` | `client/.env` | `ws` o `api` |
| `VITE_WS_URL` | `client/.env` | URL del WebSocket (default `ws://localhost:3001`) |
| `PORT` | servidor | Puerto del servidor Express+WS (default 3001) |

---

## Estructura del proyecto

```
├── client/                        # Frontend React + Vite
│   └── src/
│       ├── components/
│       │   ├── accessibility/     # AccessibilityProvider, contexto de tema
│       │   ├── chat/              # Chat, MessageInput, MessageList, MessageItem
│       │   ├── layout/            # Layout, Sidebar, SettingsDrawer, ApiKeyModal, WelcomeScreen
│       │   ├── markdown/          # MarkdownRenderer (audio, imágenes, código)
│       │   └── messages/          # MessageItem, MessageList
│       ├── hooks/
│       │   ├── useChatApi.ts      # Hook HTTP directo a Gemini API
│       │   └── useWebSocket.ts    # Hook WebSocket con reconexión automática
│       ├── utils/
│       │   └── messageFormatter.ts
│       ├── App.tsx
│       ├── index.css              # Temas CSS variables, animaciones
│       └── main.tsx
├── server/
│   └── index.js                   # Express + WebSocket + Gemini SDK
├── api/
│   ├── chat.js                    # Función serverless Vercel
│   └── health.js                  # Health check endpoint
├── netlify/
│   └── functions/chat.js          # Función serverless Netlify
├── vercel.json
└── netlify.toml
```

---

## Desarrollo local

```bash
# 1. Cliente
cd client
pnpm install
pnpm dev          # http://localhost:5173

# 2. (Opcional) Servidor Express + WebSocket
cd server
pnpm install
node index.js     # ws://localhost:3001 + /api/health + /api/chat
```

Forzar modo WebSocket:
```
http://localhost:5173/?transport=ws&wsUrl=ws://localhost:3001
```

Forzar modo HTTP API:
```
http://localhost:5173/?transport=api
```

---

## Despliegue

### Vercel

1. Configurar `GEMINI_API_KEY` en Settings → Environment Variables
2. Conectar repositorio y desplegar
   - `vercel.json` construye `client/` como estático y expone `api/chat.js`

### Netlify

1. Configurar `GEMINI_API_KEY` en Site settings → Environment variables
2. Conectar repositorio y desplegar
   - `netlify.toml` construye `client/dist` y redirige `/api/*` a `/.netlify/functions/*`

---

## Solución de problemas

| Problema | Causa |
|---|---|
| 404 en `/api/chat` local | Usar `netlify dev` o `vercel dev` desde la raíz |
| Respuesta "Simulación" | Falta `GEMINI_API_KEY` en el entorno |
| 429 Too Many Requests | Cuota gratuita agotada, esperar o usar key de pago |
| WebSocket no conecta | Puerto incorrecto, proxy bloqueando, usar `?wsUrl=` para debug |
| Imagen no se genera | El modelo debe contener "image" en el nombre (ej. `gemini-2.5-flash-preview-image`) |
| Node < 18 | Actualizar Node (se usa `fetch` nativo) |
