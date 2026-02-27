# Anees Desktop — Claude Code Context

## What is this?
Electron desktop app for Anees, an AI companion for Abu Dhabi Government. Cross-platform: macOS + Windows.

## Tech Stack
- Electron 33 + React 19 + TypeScript 5 + Vite
- Zustand (client state) + React Query (server state)
- Tailwind CSS + Radix UI (design system)
- SQLite via better-sqlite3 (local storage)
- Azure Speech SDK (Arabic/English ASR)
- Microsoft Graph API (Teams, Outlook, Planner)
- MSAL for Microsoft Entra ID auth

## Key Patterns
- Offline-first: all data cached in SQLite, cloud sync is additive
- Arabic RTL support required on all screens
- Privacy-first: recording indicator always visible, Privacy Pause via hotkey
- Zero-retention: audio processed in real-time, never persisted to cloud
- Companion-agnostic: core pipeline decoupled from AI inference

## Architecture
- Main process: Electron, tray, hotkeys, native audio, auth
- Renderer process: React SPA with 5 tab navigation
- Workers: background audio processing, sync, batch operations
- DB: SQLite with conversations, tasks, companions, speakers tables

## Conventions
- Components: PascalCase in src/renderer/components/
- Hooks: use* prefix in src/renderer/hooks/
- Stores: *Store.ts in src/renderer/stores/
- Services: *Service.ts in src/renderer/services/
- All user-facing strings must have Arabic + English translations
- Tests colocated with source files (*.test.ts)
