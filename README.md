# DevVault

A modern, full-stack code snippet manager for developers with automated AI tagging, summaries, and instant search.

**Live Demo:** [https://devvault-app-blond.vercel.app](https://devvault-app-blond.vercel.app/)

---

## Features

- **Instant AI Summaries & Tags**: Automatically extracts clean, relevant tags and concise code summaries using Groq Cloud AI (with Gemini fallback).
- **Secure Authentication**: Protected routes with JWT authentication and secure cookie handling.
- **Full Snippet Management**: Create, edit, organize, delete, and copy snippets across various programming languages.
- **Quick Search & Filter**: Instant search by snippet title, code content, or language/tags.
- **Modern Developer UI**: Clean dark interface built with Tailwind CSS, custom code highlighting, and toast feedback.

---

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Axios
- **Backend**: Node.js, Express, Mongoose (MongoDB Atlas), Zod
- **AI Integration**: Groq SDK (`qwen/qwen3.8-27b`), Google Gemini API
- **Deployment**: Vercel

---

## Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- A MongoDB Atlas database connection URI
- A free [Groq Cloud API Key](https://console.groq.com) or [Google Gemini API Key](https://aistudio.google.com/)

### 2. Clone & Install

```bash
git clone https://github.com/your-username/DevVault.git
cd DevVault

# Install root, server, and client dependencies
npm run install:all
```

### 3. Environment Setup

#### Server Configuration (`server/.env`)
Create a `.env` file inside the `server/` directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

#### Client Configuration (`client/.env`)
Create a `.env` file inside the `client/` directory (optional for local development):

```env
VITE_API_URL=http://localhost:5000
```

### 4. Run Locally

Start both server and client concurrently from the project root:

```bash
npm run dev
```

Or run them individually:

```bash
# Terminal 1 - Backend (port 5000)
npm run dev:server

# Terminal 2 - Frontend (port 5173)
npm run dev:client
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## License

This project is open-source and available under the [MIT License](LICENSE).
