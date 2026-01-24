# StoryWeaver - AI Video Generator

> AI-powered video script generation and editing platform

StoryWeaver is a modern web application that leverages Google Gemini AI to automatically generate video scripts and scenes from simple topic descriptions, then renders them into video format using FFmpeg.

## ✨ Features

### 🤖 AI-Powered Script Generation
- **Automatic Script Writing**: Input a topic, get a complete video script with multiple scenes
- **Visual Prompt Generation**: AI creates detailed visual descriptions for each scene
- **Smart Scene Breakdown**: Automatic duration estimation and scene ordering

### 📝 Manual Project Creation
- Create projects from scratch with custom settings
- Full control over video parameters (aspect ratio, style presets)
- Optional description and metadata

### 🎬 Video Editor
- **Scene Management**: View, edit, and organize video scenes
- **Timeline View**: Visual representation of scene order and duration
- **Preview Area**: Placeholder for video preview (ready for media player integration)
- **Smart Render Button**: 
  - Auto-disabled when project isn't ready
  - Loading states during rendering
  - Status-aware UI (draft/rendering/completed)

### 🎨 Modern UI/UX
- Tabbed interface (Manual vs AI Assistant)
- Real-time status updates
- Responsive design
- Loading states and error handling

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM v6
- **State Management**: TanStack Query (React Query) v5
- **UI Components**: Custom UI Kit (`@superapp/ui-kit`)
- **Styling**: SCSS + Tailwind CSS
- **Icons**: Lucide React
- **Type Safety**: Shared types from `@superapp/shared-types`

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- pnpm 8+
- Backend API Server running (see `apps/api-server`)

### Setup

```bash
# Install dependencies (from monorepo root)
pnpm install

# Build shared packages first
pnpm build --filter @superapp/shared-types
pnpm build --filter @superapp/ui-kit

# Start development server
pnpm dev --filter story-weaver
```

The app will start at `http://localhost:3002`

## 🔧 Environment Variables

Create a `.env` file in the app root:

```env
# API Server URL
VITE_API_URL=http://localhost:3001

# Optional: Custom port
VITE_PORT=3002
```

## 🚀 Usage

### Creating a Video Project

#### Option 1: AI Assistant
1. Click "New Project" on Dashboard
2. Switch to "AI Assistant" tab
3. Enter your video topic (e.g., "15-second tips for remote work posture")
4. Click "Generate Idea"
5. AI will create a draft project with auto-generated scenes

#### Option 2: Manual Creation
1. Click "New Project" on Dashboard  
2. Stay on "Manual" tab
3. Enter project name and description
4. Click "Create Project"
5. Manually add scenes in the Editor

### Editing Scenes
1. Open a project from the Dashboard
2. View scene list on the left panel
3. Click "Add Scene" to create new scenes
4. Delete scenes with the trash icon (hover to reveal)

### Rendering Video
1. Open a project in the Editor
2. Ensure project has scenes (status: "draft" or "completed")
3. Click "Generate Video" button
4. Wait for render to complete (status updates to "completed")

## 📁 Project Structure

```
apps/story-weaver/
├── public/              # Static assets
├── src/
│   ├── config/          # API endpoints, constants, env config
│   ├── hooks/           # Custom React hooks (useProjects, useScenes)
│   ├── pages/
│   │   ├── Dashboard/   # Project list & create modal
│   │   │   └── components/
│   │   │       └── CreateProjectModal.tsx
│   │   └── Editor/      # Scene editor & timeline
│   │       ├── components/
│   │       │   ├── SceneCard.tsx
│   │       │   └── SceneList.tsx
│   │       └── EditorPage.tsx
│   ├── services/        # API services (BaseService, projects, scenes)
│   ├── styles/          # Global styles
│   ├── App.tsx          # App root with routing
│   └── main.tsx         # Entry point
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🔗 API Integration

The app communicates with the backend API Server (`apps/api-server`) through these endpoints:

- `GET /video-projects` - List all projects
- `GET /video-projects/:id` - Get project details
- `POST /video-projects` - Create new project
- `POST /video-projects/generate-script` - AI script generation
- `POST /video-projects/:id/render` - Trigger video render
- `GET /video-scenes?projectId=:id` - Get scenes for a project
- `POST /video-scenes` - Create new scene

## 🧪 Development

### Type Checking
```bash
pnpm tsc -b apps/story-weaver
```

### Build
```bash
pnpm build --filter story-weaver
```

### Lint
```bash
pnpm --filter story-weaver run lint
```

## 🏗️ Architecture Notes

### State Management
- **TanStack Query** for server state (API data, caching, invalidation)
- **React Hook Form** for form state (create/edit modals)
- **Zod** for runtime validation and type safety

### Component Patterns
- **Service Layer**: API calls abstracted in `services/`
- **Custom Hooks**: React Query wrapped in domain-specific hooks
- **Smart/Dumb Components**: Pages are smart, components are presentational
- **Shared UI**: All reusable components from `@superapp/ui-kit`

### Type Safety
- Shared TypeScript types from `@superapp/shared-types`
- Full end-to-end type safety (Backend DTOs → Frontend Components)
- Zod schemas for runtime validation

## 🐛 Known Limitations (MVP)

- Preview player is a placeholder (no actual video playback yet)
- FFmpeg render currently generates dummy videos (stub implementation)
- No real-time render progress tracking
- No video asset management (images/audio for scenes)

## 🚧 Future Enhancements

- [ ] **Media Library**: Upload and manage images/audio for scenes
- [ ] **Video Preview**: Actual video player for preview area
- [ ] **Render Progress**: WebSocket/SSE for real-time render updates
- [ ] **Advanced Editing**: Timeline scrubbing, transitions, effects
- [ ] **Export Options**: Multiple formats, resolutions, watermarks
- [ ] **Templates**: Pre-built scene templates and styles
- [ ] **Collaboration**: Multi-user editing and comments

## 📄 License

Part of the SuperApp monorepo. See root LICENSE file.

## 🤝 Contributing

This is part of a monorepo. See root CONTRIBUTING.md for guidelines.

---

**Built with ❤️ using AI-powered development**
