# Developer Snippet Vault & AI Publisher

Production-grade full-stack snippet vault built with Node.js, Express, React, Tailwind CSS, MongoDB Atlas, and Google Gemini API.

## Features

- **Authentication**: JWT authentication stored in httpOnly, Secure, SameSite cookies with bcrypt (salt cost 12).
- **Snippet Management**: Full CRUD capabilities with ownership verification (`owner == req.user.id`).
- **AI Auto-Tagging & Summaries**: Google Gemini API generates 3-5 normalized lowercase tags and single-sentence summaries upon saving.
- **Resilient AI Pipeline**: Non-blocking saves with fallback states and on-demand metadata regeneration.
- **Design System**: Linear/Vercel/GitHub-inspired interface featuring Zinc neutrals and deep teal accents (`#0F766E` / `#2DD4BF`).
- **Developer UX**: Global search (`Ctrl+K` / `/`), instant tag filters, line numbers, one-click copy, and system-synced dark mode.
- **Serverless Ready**: Configured for Vercel deployment with cached Mongoose connection pools.

## Monorepo Architecture

```
d:/DevVault/
├── client/
│   ├── src/
│   │   ├── api/            # Axios API client with session interceptors
│   │   ├── components/     # CodeBlock, SnippetCard, Navbar, ConfirmDialog, TagBadge
│   │   ├── context/        # AuthContext, ThemeContext, ToastContext
│   │   ├── lib/            # Language palettes & constants
│   │   ├── pages/          # Landing, Login, Register, Dashboard, SnippetNew, SnippetEdit, SnippetDetail
│   │   ├── routes/         # ProtectedRoute
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── vercel.json         # SPA URL rewrite configuration
│   └── vite.config.js      # Vite build & local API proxy
├── server/
│   ├── api/
│   │   └── index.js        # Vercel serverless function entry
│   ├── src/
│   │   ├── config/         # Cached MongoDB connection pool
│   │   ├── controllers/    # Auth and Snippet business logic
│   │   ├── middleware/     # JWT verification, Zod validation, error handler
│   │   ├── models/         # User and Snippet Mongoose schemas
│   │   ├── routes/         # Express API routes with rate limiters
│   │   ├── services/       # Google Gemini AI integration
│   │   ├── validators/     # Zod input validation schemas
│   │   ├── app.js          # Express middleware and routing
│   │   └── server.js       # Standalone local HTTP server
│   ├── vercel.json         # Serverless routing configuration
│   └── .env.example
└── package.json
```

## Environment Variables

### Server (`server/.env`)

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/snippet-vault?retryWrites=true&w=majority
JWT_SECRET=supersecretjwtkeythatisatleast32characterslong
GEMINI_API_KEY=your_gemini_api_key_here
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Client (`client/.env`)

```env
VITE_API_URL=http://localhost:5000
```

## Quick Start

### 1. Install Dependencies

```bash
npm run install:all
```

### 2. Run Locally

To run the backend:
```bash
cd server
npm start
```

To run the frontend:
```bash
cd client
npm run dev
```

## Vercel Deployment

1. Push repository to GitHub.
2. In Vercel, deploy two projects or import the monorepo:
   - **Server Project**: Set Root Directory to `server`. Configure `MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `CLIENT_URL`, and `NODE_ENV=production`.
   - **Client Project**: Set Root Directory to `client`, framework to `Vite`. Configure `VITE_API_URL` to point to the server deployment URL.
3. Configure MongoDB Atlas Network Access (`0.0.0.0/0`) for serverless connections.
