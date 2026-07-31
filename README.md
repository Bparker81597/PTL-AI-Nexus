# PTL AI Nexus

PTL AI Nexus is the Parker Tech Labs Mission Control workspace for modular creator AI production.

**A Creative Universe**

One platform. Infinite creativity. Everything connects.

It coordinates characters, projects, scenes, images, clips, audio, render jobs, assets, and AI engine configuration through one shared local-first system.

The current app is mock-provider-first, with an optional secure Live Mode for DreamFrame video generation when a backend generation gateway is configured. It proves the complete creative workflow before connecting Supabase, Cloudflare R2, or other production services.

## Flagship Content

The local seed content now centers **PTL Crew**, a PTL Universe Original from Parker Tech Labs.

- **Tagline:** Imagine It. Draw It. Live It.
- **Series statement:** Different strengths. One team. Endless possibilities.
- **Core cast:** Brooklyn, Maddie, Layla, and Maize.
- **Active production:** `PTL Crew - Series Foundation`.

Brittany Parker remains available as the approved public Parker Tech Labs founder reference in the restrained About/profile and Asset Library areas. Brittany is not part of the PTL Crew cast and is not used as the routine product assistant.

## Mission Control

The dashboard is now the **Mission Control** operating surface. It centers the active `PTL Crew - Series Foundation` project with:

- Active project hero
- Repository-driven project metrics
- Scene-based production timeline
- Creative module cards
- PTL Producer right rail
- Recent activity signals
- Accurate AI engine status

## Product Modules

- **Character Studio**: character profiles, references, expressions, outfits, prompts, and LoRA placeholders.
- **NovaCanvas**: project and scene-linked mock image generation.
- **DreamFrame**: source-image-to-video scene animation workflow with separate Mock Mode and Live Mode.
- **NovaTone**: voice, music, and sound-effect production workspace.
- **Projects**: project cards and project-detail command center.
- **Render Queue**: progress, cancel, retry, source/output, project and scene actions.
- **Asset Library**: visual media browser with project, scene, character, provider, and metadata connections.
- **AI Engines**: provider configuration status using a shared status source.

## Install And Run

```bash
npm install
npm run dev
```

Useful commands:

```bash
npm run lint
npm run test
npm run build
npm run preview
npm audit
```

## Architecture

```text
src/
├── app/                 # Routes and Zustand store
├── components/
│   └── ptl/             # Mission Control design-system components
├── data/                # Deterministic sample data
├── features/            # Creator-facing product modules
├── providers/           # AI, storage, database, and status placeholders
├── repositories/        # Repository contracts and localStorage implementations
├── services/            # Render orchestration and app service composition
├── tests/               # Vitest coverage
├── types/               # Shared TypeScript domain model
└── utils/               # IDs and project metrics
```

Components consume the app store and repository/service contracts. Local mock repositories remain the default persistence layer.

## PTL Design System

Design tokens and global atmosphere live in `src/styles.css` and `tailwind.config.ts`. Reusable Mission Control components live in `src/components/ptl`.

See [docs/PTL_DESIGN_SYSTEM.md](docs/PTL_DESIGN_SYSTEM.md).

## Generation Modes

Mock Mode remains the default. When a creator generates media in Mock Mode, the app creates a render job, queues it, progresses it through preparing/running/completed states, calls the Mock Provider, saves the generated asset, links it to the selected project and scene, updates local state, and persists through refresh.

DreamFrame also supports Live Mode through a secure generation gateway. Live Mode submits image-to-video jobs to `VITE_API_BASE_URL` and expects a backend endpoint to submit and poll the real provider job. The browser never receives provider API keys.

Expected gateway endpoints:

```text
POST   /api/generation/video
GET    /api/generation/video/:providerJobId
DELETE /api/generation/video/:providerJobId
```

A Cloudflare Worker reference implementation is included at:

```text
server/cloudflare-worker/generation-gateway.mjs
```

That Worker uses backend-only variables such as `RUNPOD_API_KEY` and `RUNPOD_ENDPOINT_ID`. It is not part of the GitHub Pages frontend bundle.

## Provider Limitations

Only the Mock Provider is connected by default. The Live Video Gateway displays connected only when `VITE_API_BASE_URL` is configured. ComfyUI, RunPod, Hugging Face, Local AI Server, Cloudflare R2, and Supabase remain not configured placeholders unless a secure backend is connected.

## Security Rules

Do not place secret credentials in frontend code. `VITE_` variables are browser-visible. RunPod keys, Cloudflare R2 secrets, Supabase service-role keys, and provider API keys must live in a secure backend service.

## Screenshots

Screenshots can be captured from the local dev server for:

- Mission Control desktop
- Mission Control mobile
- Character Studio
- NovaCanvas
- DreamFrame
- Project Timeline
- Asset Library
- AI Engines

## GitHub Pages

`.github/workflows/pages.yml` builds the Vite app and deploys `dist` to GitHub Pages on pushes to `main`.
