# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Homely — a household management app (shared wishlist, purchased items, and expense
tracking for people living together). 

## Tech Stack
- Backend is ASP.NET Core minimal APIs + EF Core
(SQLite) 
- Frontend is a single-page React app built with Vite. 
- See `README.md` for the
feature scope (Wishes, Bought/have items, Expenses).

## Code standards
- C#: Use async/await for anything that hits the database
- Naming: PascalCase for public members, camelCase for private fields
- Controllers should be thin - logic belongs in services
- React: Functional components with hooks, no class components
- All new endpoints need a matching test
- Keep functions short - if a method does more than one thing, split it
- Never copy-paste logic - extract a shared method or component instead
- Use descriptive names: `GetRecipesByUserId` not `GetData`, `isLoading` not `flag`
- No magic numbers or strings - use named constants
- Avoid deep nesting - prefer early returns over nested if-else
- Delete dead code instead of commenting it out
- If the same logic appears in two places, that's a signal to refactor, not duplicate
## Never do this
- Never guess an Azure resource name, connection string, or API signature - check the actual file or ask
- Never claim a command works without running it first
- Never invent NuGet package versions - check the .csproj file
- If unsure whether something exists in the codebase, search for it before answering
## Commands

### Backend (`src/`, solution file `Homely.slnx`)
- Run the API: `dotnet run --project src/Homely.Api` (serves on the port from launch
  settings; static frontend files are served from `wwwroot` if present, with SPA
  fallback to `index.html`)
- Build: `dotnet build Homely.slnx`
- Restore: `dotnet restore Homely.slnx`
- Test: `dotnet test tests/Homely.Api.Tests/Homely.Api.Tests.csproj` — xUnit project
  testing `Homely.Api` feature handlers directly against an EF Core In-Memory
  `HomelyDbContext` (via the `TestDb.Create()` helper), no real database needed.

### Frontend (`frontend/`)
- Install deps: `npm install` (run inside `frontend/`)
- Dev server: `npm run dev` (Vite, port 5173, proxies `/households`, `/users`, `/items`
  to `http://localhost:8080` — add new proxy entries in `vite.config.js` when new API
  routes are added)
- Build: `npm run build` (outputs to `frontend/dist`)
- Preview production build: `npm run preview`
- No lint/test scripts are configured yet.

## Architecture

### Backend: vertical-slice / feature-folder structure
Three projects: `Homely.Core` (entities, no dependencies), `Homely.Infrastructure`
(EF Core `HomelyDbContext` + services), `Homely.Api` (minimal API host).

API code is organized by feature entity, not by technical layer:
```
src/Homely.Api/Features/<Entity>/<Verb><Entity>/
    <Verb><Entity>Endpoint.cs   # app.Map*(...) route registration, static class
    <Verb><Entity>Handler.cs    # static HandleAsync(request, db) with the actual logic
    <Verb><Entity>Request.cs    # request DTO
```
e.g. `Features/Items/CreateItem/{CreateItemEndpoint,CreateItemHandler,CreateItemRequest}.cs`.
Handlers take the `HomelyDbContext` directly (no repository/service abstraction) and are
called from the endpoint's route delegate. Follow this same three-file pattern for any
new command/query.

Endpoints must be explicitly wired up in `Program.cs` via `app.Map<Verb><Entity>()` —
adding the three files under `Features/` is not enough for a route to become live.
**Currently only Households, Users, and Items are wired into `Program.cs`.** The
`Expenses` and `Wishes` feature folders exist with the same file layout but are empty
placeholder files (0 bytes) — they are scaffolded, not implemented, and their entities
(`Expense`, `ExpenseShare`, `Wish`) have no corresponding `DbSet<>` in `HomelyDbContext`
yet either. When implementing these, add the `DbSet<>`s to
`Homely.Infrastructure/Data/HomelyDbContext.cs` as well as the endpoint wiring.

Entities live in `Homely.Core/Entities/` and are plain classes (no fluent
configuration/migrations — the DB schema comes from `db.Database.EnsureCreated()` in
`Program.cs`, not EF migrations). SQLite connection string is in `appsettings.json`
(`Data Source=homely.db`); a `Microsoft.EntityFrameworkCore.SqlServer` package is also
referenced in `Homely.Infrastructure` though SQLite is what's actually configured.

`Homely.Infrastructure/Services/AiPriceParsingServices.cs` is a stub for a planned
receipt/price-recognition feature (referenced in `README.md`'s "Bought/have" section)
and is not yet implemented.

### Frontend
Everything currently lives in one file, `frontend/src/main.jsx` — a single `App`
component managing households/users/items state via a shared `apiFetch` helper that
hits the backend's minimal-API routes directly (`/households`, `/users`, `/items`).
There's no router or component split yet; new UI (e.g. the navbar) is being added
directly into this file/its `styles.css` counterpart.

### Deployment
`.github/workflows/deploy.yaml` builds the frontend, copies `frontend/dist` into
`src/Homely.Api/wwwroot` (see `src/Homely.Api/Dockerfile`), publishes the API, and
pushes/deploys the resulting image to Azure Container Apps on every push to `main`.
The frontend and backend are shipped as a single container image, not deployed
separately.
