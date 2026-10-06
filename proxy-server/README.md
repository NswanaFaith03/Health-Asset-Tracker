# AI Proxy Server

This is a simple Node.js/Express proxy server that handles NVIDIA AI API calls to avoid CORS issues in the browser.

## Why This Exists

Browsers block direct calls to the NVIDIA AI API from localhost due to CORS (Cross-Origin Resource Sharing) restrictions. This proxy server runs on the backend (Node.js) where CORS doesn't apply, then forwards requests to the NVIDIA API and returns the response to the frontend.

## How to Run

### Option 1: Run with the React app (Recommended)
```bash
cd /path/to/clinic-management-system
npm run dev:with-proxy
```

This will start both the React dev server (port 5173) and the proxy server (port 3001) simultaneously.

### Option 2: Run separately
```bash
# Terminal 1 - Start React app
cd /path/to/clinic-management-system
npm run dev

# Terminal 2 - Start proxy server
cd /path/to/clinic-management-system/proxy-server
npm start
```

## API Endpoints

### POST /api/chat
Calls the NVIDIA AI API with the provided message and conversation history.

**Request Body:**
```json
{
  "message": "User's message",
  "conversationType": "mental_buddy" | "hiv_counseling",
  "conversationHistory": [
    { "role": "user", "content": "Previous message" },
    { "role": "assistant", "content": "Previous response" }
  ]
}
```

**Response:**
```json
{
  "response": "AI's response"
}
```

### GET /health
Health check endpoint to verify the server is running.

**Response:**
```json
{
  "status": "ok",
  "message": "AI Proxy Server is running"
}
```

## Configuration

The proxy server runs on port 3001 by default. You can change this by setting the `PORT` environment variable:

```bash
PORT=4000 npm start
```

The frontend is configured to use `http://localhost:3001` by default. If you change the port, update the `VITE_PROXY_SERVER_URL` environment variable in your `.env` file:

```
VITE_PROXY_SERVER_URL=http://localhost:4000
```

## Security Notes

- The NVIDIA API key is currently hardcoded in `server.js`. For production, move this to environment variables.
- In production, deploy this proxy server to a secure backend (Vercel, Heroku, etc.) and update the frontend URL accordingly.
