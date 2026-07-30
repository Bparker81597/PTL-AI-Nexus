# PTL Design System v2

PTL Design System v2 defines the Mission Control visual language for PTL AI Nexus. It should be used for every new route, module, panel, workflow, and future Parker Tech Labs production tool.

Product identity:

- Parent company: Parker Tech Labs
- Product: PTL AI Nexus
- Subtitle: A Creative Universe
- Philosophy: One platform. Infinite creativity. Everything connects.
- Founder avatar: Brittany Parker, used only for Parker Tech Labs and PTL AI Nexus platform guidance.
- Flagship production: PTL Crew, used as the primary sample project and production content.

## Theme Tokens

Tokens live in `src/styles.css` and Tailwind theme extensions in `tailwind.config.ts`.

- Backgrounds: `--ptl-bg-root`, `--ptl-bg-deep`, `--ptl-bg-panel`, `--ptl-bg-panel-strong`
- Borders: `--ptl-border-subtle`, `--ptl-border-default`, `--ptl-border-active`, `--ptl-border-violet`
- Accents: `--ptl-cyan`, `--ptl-violet`, `--ptl-success`, `--ptl-warning`, `--ptl-danger`
- Text: `--ptl-text-primary`, `--ptl-text-secondary`, `--ptl-text-muted`
- Motion and glow: `--ptl-glow-cyan`, `--ptl-glow-violet`, `--ptl-gradient-primary`, `--ptl-gradient-panel`

Do not scatter arbitrary color values across features. Add semantic tokens first when the system needs a new color.

## Typography

- Display: `Space Grotesk`, then `Inter`, then system fallback.
- Body: `Inter`, then system fallback.
- Major headings use `font-display` with medium or semibold weight.
- Body, metadata, controls, and navigation use `font-sans`.

Avoid oversized or overly bold text inside compact panels.

## Component Usage

Reusable PTL components live in `src/components/ptl`.

- `PtlAppShell`: global three-region layout.
- `GlassPanel`: normal workspace panels.
- `FeaturePanel`: hero, active tool, and emphasized production sections.
- `PtlButton`: primary, secondary, ghost, and danger actions.
- `StatusBadge` and `StatusDot`: status with text and color.
- `ProjectHero`: active project hero.
- `SceneTimeline`: scene-based production timeline.
- `ModuleCard`: creative module entry point.
- `MediaPreview`: image, video placeholder, and audio preview.
- `EmptyState` and `LoadingState`: reusable non-populated states.

Use `className` extension for layout adjustments, but keep core panel/button/status styling inside the component system.

## Panel Hierarchy

- Use `FeaturePanel` for the active project hero and high-priority production surfaces.
- Use `GlassPanel` for sections, forms, detail panels, and lists.
- Avoid nesting more than two card-like layers.
- Prefer open spacing inside panels over many tiny cards.

## Button Variants

- Primary: main production action.
- Secondary: related creative action.
- Ghost: low-priority action.
- Danger: destructive action or confirmation.

Buttons include hover, focus-visible, disabled, and loading states. Keep motion subtle.

## Status Semantics

- Complete/connected/ready: success.
- Rendering/running/generating: cyan, optionally pulsing.
- Queued/planned: warning.
- Failed/error: danger.
- Not configured/disconnected/offline: muted.

Never rely on color alone. Always include readable status text.

## Module Identities

- Mission Control: cyan.
- Character Studio: violet.
- NovaCanvas: cyan/blue.
- DreamFrame: blue-violet.
- NovaTone: violet/magenta.
- Render Queue: blue.
- Asset Library: soft blue.
- AI Engines: cyan-violet.

These are accents, not separate page themes.

## Content Hierarchy

Use this hierarchy for future content additions:

- Parker Tech Labs is the company layer.
- PTL AI Nexus is the creative operating system layer.
- Brittany Parker represents the public founder and studio-avatar layer.
- PTL Crew is the current flagship production layer.
- Brooklyn, Maddie, Layla, and Maize are PTL Crew characters.

Brittany should not be added to PTL Crew scenes, cast lists, or character relationships. PTL Crew artwork should remain dominant on production screens, while Brittany appears selectively in welcome, About, guidance, and platform presentation areas.

## Responsive Layout

Desktop uses left navigation, central workspace, and right rail. Tablet stacks the right rail below the workspace. Mobile uses compact top content plus bottom navigation. The scene timeline may scroll horizontally, but the page must not.

Recommended review widths: `320`, `375`, `430`, `768`, `1024`, `1280`, `1440`.

## Motion

Use 150-240ms transitions for hover, focus, selection, and page entry. Avoid bouncing, rotating, constant background motion, or distracting gradient animation. Reduced-motion preferences are respected globally.

## Accessibility

Required:

- Semantic headings, buttons, links, forms, and labels.
- Visible focus indicators.
- Status text alongside status color.
- Descriptive media alt text.
- Touch-friendly controls around 44px.
- Empty and loading states instead of blank regions.

## Adding A Future PTL Module

1. Add route and nav entry in the shell.
2. Build the page with `PageHeader`, `GlassPanel`, `FeaturePanel`, and `PtlButton`.
3. Derive summaries from repositories or services, not duplicated local state.
4. Add a `ModuleCard` on Mission Control.
5. Use existing status semantics.
6. Add route and workflow tests.
