# Story Weaver API

> Microservice for AI-powered video script generation and project management.

## ✨ Features

- **AI Script Generation**: Generate video scripts using Google Gemini AI
- **Project Management**: CRUD operations for video projects
- **Video Rendering**: FFmpeg-based video render pipeline (MVP stub)
- **PocketBase Integration**: Embedded database for project/scene storage
- **CORS Support**: Configurable cross-origin resource sharing

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ (ESM) | Runtime |
| Express | 5.x | Web Framework |
| PocketBase SDK | 0.26.x | Database Client |
| Google Generative AI | 0.24.x | AI Script Generation |
| Zod | 4.x | Validation |

## 📁 Project Structure

```
apps/story-weaver-api/
├── src/
│   ├── config/             # Environment & service config
│   ├── controllers/        # Route handlers
│   ├── database/           # PocketBase collections
│   ├── middleware/         # Auth & validation
│   ├── routes/             # API route definitions
│   ├── services/           # Business logic (VideoProject, AIService)
│   ├── utils/              # Helper functions
│   └── index.ts            # Entry point
├── .env.example            # Environment template
└── package.json
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **pnpm** 8+
- **PocketBase** server running (port 8090)
- **Google Gemini API Key** (for AI features)
- **FFmpeg** (optional, for video rendering)

### 1. Environment Setup

```bash
# Navigate to the app directory
cd apps/story-weaver-api

# Copy environment template
cp .env.example .env

# Edit .env with your values
```

### 2. Required Environment Variables

Create a `.env` file in `apps/story-weaver-api`:

```env
# Server
PORT=3002
NODE_ENV=development

# URLs
CLIENT_URL=http://localhost:3102
SERVER_URL=http://localhost:3002

# PocketBase
POCKETBASE_URL=http://localhost:8090
POCKETBASE_ADMIN_EMAIL=admin@example.com
POCKETBASE_ADMIN_PASSWORD=your_secure_password

# CORS (comma-separated for multiple origins)
ALLOWED_ORIGINS=http://localhost:5173

# Google Gemini AI
# Get your key at: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key

# FFmpeg (optional - leave blank if in system PATH)
FFMPEG_PATH=
```

### 3. Start Development Server

```bash
# From monorepo root
pnpm dev --filter @superapp/story-weaver-api

# Or from app directory
pnpm dev
```

Server will start at `http://localhost:3002`

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with hot reload |
| `pnpm build` | Build TypeScript to JavaScript |
| `pnpm start` | Run production build |
| `pnpm lint` | Run ESLint |

## 🔌 API Endpoints

**Base URL (Direct)**: `http://localhost:3002/api`
**Base URL (Via Proxy)**: `http://localhost:5173/api/story-weaver`

### Video Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/projects` | List all video projects |
| `GET` | `/projects/:id` | Get project by ID |
| `POST` | `/projects` | Create a new project |
| `PUT` | `/projects/:id` | Update a project |
| `DELETE` | `/projects/:id` | Delete a project |
| `POST` | `/projects/generate-script` | Generate script using AI |
| `POST` | `/projects/:id/render` | Trigger video rendering |

### Video Scenes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/scenes?projectId=:id` | List scenes for a project |
| `POST` | `/scenes` | Create a new scene |
| `PUT` | `/scenes/:id` | Update a scene |
| `DELETE` | `/scenes/:id` | Delete a scene |

## 🤖 AI Script Generation

The `/projects/generate-script` endpoint uses Google Gemini AI to:

1. Take a topic/description as input
2. Generate a structured video script with multiple scenes
3. Create visual prompts for each scene
4. Estimate scene durations

**Request:**
```json
{
  "topic": "5 tips for better sleep",
  "style": "educational",
  "targetDuration": 60
}
```

**Response:**
```json
{
  "title": "5 Tips for Better Sleep",
  "description": "A short video about improving sleep quality",
  "scenes": [
    {
      "order": 1,
      "narration": "Welcome to our guide...",
      "visualPrompt": "Cozy bedroom at night...",
      "duration": 10
    }
  ]
}
```

## 🎬 Video Rendering (MVP)

The render endpoint currently returns a stub implementation:
- Creates a placeholder video file
- Updates project status to "completed"
- Ready for FFmpeg integration

**To enable full rendering:**
1. Install FFmpeg on your system
2. Set `FFMPEG_PATH` in `.env` (if not in system PATH)
3. Extend `video-render.service.ts` with actual composition logic

## 🔗 Related Services

| Service | Port | Description |
|---------|------|-------------|
| PocketBase | 8090 | Database & Admin UI |
| StoryWeaver Frontend | 3102 | React client app |
| Main API Server | 3001 | Core SuperApp backend |

## 🐛 Troubleshooting

### "GEMINI_API_KEY is required"
- Ensure you have set `GEMINI_API_KEY` in your `.env` file
- Get a key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### "PocketBase connection failed"
- Make sure PocketBase is running on the configured URL
- Check admin credentials in `.env`

### CORS errors
- Add your frontend URL to `ALLOWED_ORIGINS` in `.env`
- Ensure `CLIENT_URL` matches your frontend dev server

## 📄 License

Part of the SuperApp monorepo. Internal use only.

