# AI ChatBot Application

![Project Preview](./screenshots/screenshot.png)

A modern AI chat interface powered by Google Gemini, featuring Markdown rendering, LaTeX math support, code execution, and comprehensive accessibility controls. Supports both HTTP API and WebSocket transport modes.

---

## Features

- **Multi-Model Chat** -- Switch between Gemini 2.5 Flash, Gemini 2.5 Pro, Image generation, and TTS models.
- **Rich Markdown Rendering** -- Full GFM support, syntax-highlighted code blocks (highlight.js), LaTeX math (KaTeX), and raw HTML.
- **Python Code Execution** -- Run Python code inline via Gemini Code Execution tool.
- **Chat History** -- Conversations are persisted in localStorage and grouped by Today/Yesterday/Older.
- **Dual Transport** -- Use HTTP REST API or real-time WebSocket, switchable from Settings.
- **Client-Side API Key** -- Bring your own Gemini API key; stored locally and never sent to the server.
- **Accessibility** -- High contrast mode, font size adjustment (small/medium/large), reduced motion, dark/light/system theme.
- **Responsive Layout** -- Collapsible sidebar with mobile drawer support.
- **Serverless-Ready** -- Deploy to Vercel or Netlify with pre-configured serverless functions.

---

## Architecture

```
ai-chat-application/
├── client/                 # React + Vite + TypeScript frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── accessibility/   # AccessibilityProvider (theme, contrast, font, motion)
│   │   │   ├── chat/            # Chat, MessageInput
│   │   │   ├── layout/          # Layout, Sidebar, SettingsDrawer, WelcomeScreen, ApiKeyModal
│   │   │   ├── markdown/        # MarkdownRenderer, MarkdownDemo, SimpleMarkdownTest
│   │   │   └── messages/        # MessageList, MessageItem
│   │   ├── hooks/               # useChatApi (HTTP), useWebSocket (WS)
│   │   ├── utils/               # messageFormatter (marked + KaTeX legacy renderer)
│   │   └── App.tsx              # Root with routing between Chat / MarkdownDemo / SimpleMarkdownTest
│   └── package.json
├── server/                 # Express + WebSocket backend
│   └── index.js            # HTTP POST /api/chat, GET /api/health, WebSocket, Code Execution
├── api/                    # Vercel serverless functions
│   ├── chat.js
│   └── health.js
├── netlify/                # Netlify serverless functions
│   └── functions/chat.js
├── vercel.json             # Vercel deployment config
└── netlify.toml            # Netlify deployment config
```

> [!NOTE]
> The client can call the Gemini API directly (no backend needed) when a user-provided API key is present. The server is only required for WebSocket transport or when using the server's env-configured API key.

---

## Installation

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Google Gemini API key (free at [AI Studio](https://aistudio.google.com/app/apikey))

### Setup

```bash
# Clone the repository
git clone <repo-url>
cd ai-chat-application

# Install all dependencies
pnpm install

# Install client dependencies
cd client && pnpm install && cd ..

# Install server dependencies
cd server && pnpm install && cd ..
```

### Environment Variables

**Server** (`server/.env`):

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

**Client** (`client/.env`):

```env
VITE_CHAT_TRANSPORT=api        # 'api' for HTTP, 'ws' for WebSocket
VITE_WS_URL=ws://localhost:3001 # WebSocket server URL
```

> [!CAUTION]
> Never commit `.env` files. Only commit the `.env.example` templates provided in the repo.

---

## Usage

### Development

```bash
# Terminal 1: Start the server (required for WebSocket mode or env API key)
cd server && pnpm dev

# Terminal 2: Start the client dev server
cd client && pnpm dev
```

Open `http://localhost:5173` in your browser. On first load, the app prompts for a Gemini API key -- enter one from [AI Studio](https://aistudio.google.com/app/apikey).

### Transport Modes

- **HTTP API** (default) -- Messages are sent via `POST /api/chat`. Works with the server or Vercel serverless functions.
- **WebSocket** (`ws`) -- Real-time bidirectional communication. Requires the Node.js server to be running.

Switch transport in Settings (gear icon in sidebar) or via query parameter: `?transport=ws`.

### Model Selection

When a valid API key is provided, the app fetches available Gemini models dynamically. You can also manually select:

- Gemini 2.5 Flash (default)
- Gemini 2.5 Pro
- Gemini 2.5 Flash Image
- Gemini 3.1 Flash TTS

### Code Execution

Send a message starting with `::EXEC_CODE::` followed by a JSON payload with `language` and `code` fields, or click the Play button on any Python code block in an AI response.

### Chat History

Conversations are automatically saved to `localStorage`. Access them from the sidebar sidebar grouped by date. Click "New Chat" or the trash icon to start fresh.

---

## Deployment

### Vercel

The `vercel.json` configures static client hosting and serverless API functions:

```bash
npx vercel deploy --prod
```

### Netlify

The `netlify.toml` configures build commands, publish directory, and serverless function redirects:

```bash
npx netlify deploy --prod
```

> [!TIP]
> For serverless deployments, set `GEMINI_API_KEY` as an environment variable in the Vercel/Netlify dashboard. The client-side API key input is optional and can be used alongside or instead of the server-configured key.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Markdown | react-markdown, remark-gfm, remark-math, rehype-katex, rehype-raw |
| Code | highlight.js |
| Math | KaTeX |
| Icons | lucide-react |
| Backend | Express, ws (WebSocket) |
| AI SDK | @google/generative-ai |
| Deployment | Vercel, Netlify |
| Package Manager | pnpm |
