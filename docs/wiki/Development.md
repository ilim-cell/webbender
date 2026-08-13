# Development

## Prerequisites

- Node.js 20+
- pnpm

## Setup

```bash
git clone https://github.com/ilim-cell/webbender.git
cd webbender
pnpm install
pnpm run build:bookmarklet
pnpm run dev
```

## Common commands

```bash
pnpm run build
pnpm run build:bookmarklet
pnpm run format
pnpm run format:check
pnpm run watch
pnpm run test
```

## Workflow

- source files live under src
- the installer page and generated assets are in site
- CI and release automation are defined in .github/workflows

## Related pages

- [Installation](Installation.md)
- [Usage](Usage.md)
- [Updates](Updates.md)
