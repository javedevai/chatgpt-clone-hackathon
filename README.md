# 🚀 ChatGPT Clone — AI Assistant

A premium ChatGPT-like AI assistant built with **Next.js**, **React**, and **Tailwind CSS**, powered by **Google Gemini AI**.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?logo=tailwind-css)
![Gemini](https://img.shields.io/badge/Gemini-AI-green?logo=google)

## 🔗 Live Demo

👉 [**chatgpt-clone-hackathon.vercel.app**](https://chatgpt-clone-hackathon.vercel.app)

## ✨ Features

### Core
- 💬 Real-time chat with Google Gemini AI
- 🎨 Premium dark-mode ChatGPT-like UI
- 📱 Fully responsive (mobile + desktop)
- ⚡ Fast responses with Next.js API routes
- 💅 Glassmorphism design with smooth animations

### Bonus Features
- 🔄 **Multiple Model Selection** — Switch between Gemini models
- 🧠 **Conversation Memory** — Chat history persists in localStorage
- 🎛️ **System Prompt Customization** — Configure AI behavior
- ⏱️ **Message Timestamps** — Track when messages were sent
- 📝 **Markdown Rendering** — Code blocks, lists, tables, and more
- 🎯 **Auto-scroll** — Automatically scrolls to the latest message
- 🔒 **Secure** — API key stored server-side, never exposed to client

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 14 | React framework with API routes |
| React 18 | UI component library |
| Tailwind CSS | Utility-first styling |
| Google Gemini API | AI language model |
| Vercel | Deployment platform |

## 📁 Project Structure

```
src/
├── app/
│   ├── api/chat/route.js    # Gemini API proxy
│   ├── globals.css           # Global styles + animations
│   ├── layout.js             # Root layout
│   └── page.js               # Main chat page
└── components/
    ├── ChatArea.js            # Message list container
    ├── ChatInput.js           # Input bar with send button
    ├── MessageBubble.js       # Individual chat message
    ├── SettingsModal.js       # Model & prompt settings
    ├── Sidebar.js             # Chat history sidebar
    └── TypingIndicator.js     # "AI is thinking" animation
```

## 🚀 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/chatgpt-clone-hackathon.git
   cd chatgpt-clone-hackathon
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` with your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## 📦 API Used

- **Google Gemini API** (Free tier) via `generativelanguage.googleapis.com`
- Default model: `gemini-2.0-flash`

## 👨‍💻 Built for

Saylani Mass IT Training — Web Development Hackathon (February 2026)
