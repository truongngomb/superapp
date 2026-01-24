# Story Weaver API
 
 Microservice for AI-powered video script generation and project management.
 
 ## Tech Stack
 
 - **Runtime**: Node.js (ESM)
 - **Framework**: Express 5
 - **AI**: Google Gemini AI (@google/generative-ai)
 - **Database**: PocketBase (via @superapp/core-sdk)
 - **Validation**: Zod
 
 ## Project Structure
 
 ```
 apps/story-weaver-api/
 ├── src/
 │   ├── config/             # Environment & service config
 │   ├── controllers/        # Route handlers
 │   ├── middleware/         # Auth & validation
 │   ├── routes/             # API route definitions
 │   ├── services/           # Business logic (VideoProject, AIService)
 │   └── index.ts            # Entry point
 └── package.json
 ```
 
 ## Getting Started
 
 ### Environment Variables
 
 Create a `.env` file in `apps/story-weaver-api`:
 
 ```env
 PORT=3002
 NODE_ENV=development
 
 # URLs
 CLIENT_URL=http://localhost:3102
 SERVER_URL=http://localhost:3002
 
 # PocketBase
 POCKETBASE_URL=http://localhost:8090
 POCKETBASE_ADMIN_EMAIL=admin@example.com
 POCKETBASE_ADMIN_PASSWORD=your_secure_password
 
 # Google Gemini AI
 GEMINI_API_KEY=your_gemini_api_key
 ```
 
 ## Scripts
 
 | Command | Description |
 |---------|-------------|
 | `pnpm dev` | Start development server |
 | `pnpm build` | Build for production |
 | `pnpm start` | Run production build |
 
 ## API Endpoints
 
 Base URL: `http://localhost:3002/api/story-weaver`
 
 | Method | Endpoint | Description |
 |--------|----------|-------------|
 | `GET`  | `/projects` | List all video projects |
 | `POST` | `/projects` | Create a new project |
 | `POST` | `/projects/generate-script` | Generate script using AI |
 | `POST` | `/projects/:id/render` | Trigger video rendering |
