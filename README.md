# Fullstack TS LLM Router

A simple TypeScript project that routes LLM requests randomly across multiple providers to balance usage.

## Description
This repository contains a **server** built with Express and TypeScript that forwards incoming `/v1` OpenAI‑compatible requests to one of several configured LLM back‑ends using the `weighted‑random` package. The server also serves a React client from `client/dist`.

## Installation
```bash
# Install all workspace dependencies (root script)
npm run install-all
```

## Development
```bash
# Run server and client concurrently with hot‑reload
npm run dev
```

## Build & Start
```bash
npm run build   # builds client and server
npm start       # starts the server (node dist/index.js)
```

## How it works
- The server loads providers from the database (see `src/routes/providerRoutes`).
- When a request hits `/v1/*`, the proxy route selects a provider at random (weighted) and forwards the request, returning the provider's response.
- This helps keep overall usage low for each provider.

## Scripts (root `package.json`)
- `install-all` – install dependencies for root, server, and client.
- `build` – builds client then server.
- `start` – starts the server.
- `dev` – runs server and client in parallel.

## License
MIT License (or specify your own).
