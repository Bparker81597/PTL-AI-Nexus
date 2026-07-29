# PTL AI Cluster

PTL AI Cluster is the shared AI infrastructure foundation for the Parker Tech Labs creator ecosystem. It is designed to let multiple PTL products share one system for AI generation, project storage, character consistency, job processing, provider routing, and asset management.

Phase 1 is intentionally mock-first. It proves the application architecture and end-to-end creator workflows before connecting real GPU providers or storing production assets.

## Product Modules

- **PTL Character Studio**: character profiles, references, expressions, outfits, consistency prompts, and LoRA placeholders.
- **NovaCanvas**: prompt-based image generation workspace with character/style/settings controls and mock results.
- **DreamFrame**: image-to-video and text-to-video planning surface with clip settings, render status, and scene queue.
- **NovaTone**: voice, music, and sound-effect workspace with dialogue fields and mock waveform display.
- **Projects**: mixed-media project records that can link characters, images, clips, audio, storyboards, scenes, and render jobs.
- **Render Queue**: job status, progress, retry, cancel, and output actions.
- **Asset Library**: searchable grid/list asset manager for references, generated images, video, audio, storyboards, LoRAs, model files, and exports.
- **AI Engines**: provider adapter registry and router for interchangeable AI backends.

## Install And Run

```bash
npm install
npm run dev
```

Useful commands:

```bash
npm run lint
npm test
npm run build
npm run preview
```

## Architecture

```text
src/
├── app/                 # App routes and Zustand store
├── components/          # Shared shell, cards, form controls, badges
├── features/            # Creator-facing product modules
├── providers/           # AI, storage, and database provider adapters
├── repositories/        # Repository contracts and localStorage implementations
├── services/            # Render orchestration and app service composition
├── types/               # Shared TypeScript domain model
├── utils/               # IDs and small helpers
├── data/                # Required sample data
└── tests/               # Vitest coverage
```

Components use repository/service interfaces instead of coupling directly to Supabase or provider SDKs. The app uses local mock repositories by default so creators can test complete workflows locally.

## Provider Adapter Architecture

The shared `AIProvider` interface supports image, video, audio, and multimodal providers. `EngineRouter` selects a provider by generation type, required capability, user preference, and local/cloud preference.

Current adapters:

- Mock Provider: connected and functional.
- ComfyUI: typed local placeholder.
- RunPod: typed cloud GPU placeholder.
- Hugging Face: typed placeholder.
- Local AI Server: typed placeholder.

Only the Mock Provider generates assets today. The placeholders do not make fake production API calls.

## Mock Generation Flow

When a creator presses Generate, the app creates a render job, queues it, progresses it through preparing and running states, calls the Mock Provider, saves a generated asset, links it back to the project, and shows a notification. This validates the workflow before real GPUs are connected.

## Future Integrations

ComfyUI will connect through a local or backend-routed endpoint for image generation and character consistency workflows. RunPod will connect through a secure backend service for cloud GPU jobs, job polling, cancellation, and output handling. Cloudflare R2 will become the durable asset store for generated media and references. Supabase will provide authentication, database records, user workspaces, and eventually row-level security.

## Security Rules

Do not place secret credentials in frontend code. `VITE_` variables are visible to the browser and are only for public configuration such as Supabase anon keys or public API base URLs. RunPod keys, Cloudflare R2 secrets, Supabase service-role keys, and provider API keys must live in a secure backend service.

Copy `.env.example` when local environment values are needed.

## Sample Data

The app includes Eric and Maize, the `Eric & Maize - Monster Truck Adventure` project, mock image assets, mock clip/audio assets, multiple render jobs, and one failed job for retry testing.

## Development Phases

- **Phase 1**: Application shell, modules, mock provider, projects, assets, and render queue.
- **Phase 2**: Supabase authentication and database integration.
- **Phase 3**: Cloudflare R2 asset storage.
- **Phase 4**: ComfyUI local image-generation connector.
- **Phase 5**: RunPod cloud GPU connector.
- **Phase 6**: Character reference and LoRA management.
- **Phase 7**: DreamFrame multi-scene episode assembly.
- **Phase 8**: NovaTone voice, music, and sound integration.

## GitHub Pages

`.github/workflows/pages.yml` builds the Vite app and deploys `dist` to GitHub Pages on pushes to `main`.
