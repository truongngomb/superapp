# Integration Architecture

**Type:** Monorepo with Shared Backend Services
**Communication Pattern:** REST API (Client-Server) + Shared Libraries

## Data Flow Diagram

```mermaid
graph TD
    User[User Browser]
    
    subgraph Clients
        WC[Web Core App]
        SW[Story Weaver App]
    end
    
    subgraph Container[Docker Container]
        Nginx[Nginx Proxy]
        API[API Server (Express)]
        SWAPI[Story Weaver API (Express)]
    end
    
    subgraph External
        PB[(PocketBase)]
        OpenAI[OpenAI / Gemini]
    end
    
    User -->|HTTPS| Nginx
    Nginx -->|/api/*| API
    Nginx -->|/*| WC
    
    WC -->|REST| API
    SW -->|REST| API
    SW -->|REST| SWAPI
    
    API -->|SDK| PB
    SWAPI -->|SDK| PB
    SWAPI -->|API| OpenAI
```

*Note: In the current Dockerfile setup, `api-server` acts as the primary entry point. `story-weaver-api` logic might be mounted within `api-server` or run as a parallel service if configured.*

## Integration Points

### 1. Web Clients -> API Server
- **Protocol:** REST (JSON)
- **Auth:** Bearer Token (managed by `AuthProvider`)
- **Key Services:**
  - `authService` -> `/api/auth`
  - `userService` -> `/api/users`
  - `categoryService` -> `/api/categories`

### 2. Story Weaver -> Story Weaver API
- **Protocol:** REST (JSON)
- **Key Services:**
  - `characterService` -> `/api/characters` (or `/api/generation`)
  - `videoProjectService` -> `/api/video-projects`

### 3. Backends -> PocketBase
- **Protocol:** PocketBase JS SDK (HTTP)
- **Role:** Database, Realtime subscriptions, Auth provider backing.

### 4. Shared Libraries
- **@superapp/core-logic:**
  - Shared `BaseService` class used by all clients.
  - Shared `AuthProvider` used by `web-core` and `story-weaver`.
- **@superapp/shared-types:**
  - Zod schemas shared between Client validation and Server validation.
  - TypeScript interfaces.
- **@superapp/ui-kit:**
  - Shared Design System components.
