# ChatGPT Clone — Saylani Hackathon

A pixel-perfect ChatGPT clone built with **HTML**, **Tailwind CSS**, and **Vanilla JavaScript**, powered by the **Google Gemini API**.

## Features

- 🎨 Pixel-perfect ChatGPT UI
- 🌙 Dark/Light mode toggle
- 💬 Chat history with localStorage
- 🤖 AI responses via Google Gemini 1.5 Flash
- 📱 Fully responsive design
- 🔒 Secure API key handling (serverless proxy)

## Tech Stack

- HTML5, Vanilla JavaScript, Tailwind CSS (CDN)
- Google Gemini API (via AI Studio)
- Vercel Serverless Functions (for secure deployment)

## Local Development

1. Clone the repo
2. Create a `.env` file and add your key:
   ```env
   GEMINI_API_KEY=your_key_here
   ```
3. Since this app uses a backend proxy for security, local development requires the **Vercel CLI** to run the serverless function:
   ```bash
   npm i -g vercel
   vercel dev
   ```
4. Open `http://localhost:3000`

## Secure Deployment (Vercel)

1. Push code to **GitHub** (The `.env` file is ignored and safe).
2. Import the repo into **Vercel**.
3. Go to **Settings → Environment Variables** and add `GEMINI_API_KEY`.
4. The website will work immediately for all visitors without requiring them to enter a key.

## File Structure

```
├── index.html        # Main UI
├── style.css         # Custom styles & animations
├── script.js         # Frontend logic (Gemini API integration)
├── api/
│   └── chat.js       # Serverless proxy (reads GEMINI_API_KEY from env)
├── .env.example      # Environment variable template
├── .gitignore        # Excludes .env from commits
└── README.md         # This file
```
