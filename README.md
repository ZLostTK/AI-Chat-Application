# AI Chat Application

This is a simple chat application with a React frontend and a Node.js backend with WebSocket communication.

## How to run the application

### Prerequisites

- Node.js
- pnpm

### Backend

1.  Navigate to the `server` directory:
    ```bash
    cd server
    ```
2.  Install the dependencies:
    ```bash
    pnpm install
    ```
3.  Start the server:
    ```bash
    node index.js
    ```
    The server will be running on `ws://localhost:3001`.

### Frontend

1.  Navigate to the `client` directory:
    ```bash
    cd client
    ```
2.  Install the dependencies:
    ```bash
    pnpm install
    ```
3.  Start the client:
    ```bash
    pnpm start
    ```
    The application will open in your browser at `http://localhost:3000`.

## Gemini API

To use the AI features, you need to add your Gemini API key in the `server/index.js` file.