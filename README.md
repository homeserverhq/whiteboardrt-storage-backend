# WhiteboardRT Storage Backend

WhiteboardRT Storage Backend is the self-hosted HTTP storage service for [WhiteboardRT](https://github.com/homeserverhq/whiteboardrt) and [WhiteboardRT Agent](https://github.com/homeserverhq/whiteboardrt-agent).

It stores shared scenes, live-collaboration rooms, and embedded images in a [Keyv](https://github.com/jaredwray/keyv) key/value store, so you can run it against Redis, MongoDB, PostgreSQL, MySQL, SQLite, or an in-memory store.

## Provenance

This repository is a modified fork of [kiliandeca/excalidraw-storage-backend](https://gitlab.com/kiliandeca/excalidraw-storage-backend), originally created by Kilian Decaderincourt. The upstream project is hosted on **GitLab**, not GitHub. The git history also includes Docker and CI work from the [alswl/excalidraw-storage-backend](https://github.com/alswl/excalidraw-storage-backend) GitHub fork, and the original API design follows [excalidraw-json](https://github.com/excalidraw/excalidraw-json).

WhiteboardRT Storage Backend is maintained as an independent repository on GitHub. It is **not a GitHub fork**, so GitHub does not show a fork relationship with the upstream GitLab project. Upstream git history is preserved for provenance.

WhiteboardRT Storage Backend is **not affiliated with or endorsed by Excalidraw**.

## What it does

- **Scenes** — stores exported scene share links at `POST/GET /api/v2/scenes`.
- **Rooms** — stores live-collaboration state at `GET/PUT /api/v2/rooms/:id`.
- **Files** — stores images and other binary attachments at `GET/PUT /api/v2/files/:id`.

Payloads are treated as opaque bytes. The backend does not parse or transform scene data.

## Compatibility

- WhiteboardRT web app (HTTP storage backend)
- WhiteboardRT Agent (remote canvas persistence)
- Clients that implement the `excalidraw-json` storage API

The `/api/v2` paths, the `SCENES`, `ROOMS`, and `FILES` Keyv namespaces, and the 16-digit numeric scene IDs are intentionally retained for compatibility with existing deployments and data.

## Quick start

### Docker

```bash
docker build -t whiteboardrt-storage-backend:latest .
```

```bash
docker run -d --name whiteboardrt-storage-backend \
  -p 8080:8080 \
  -e STORAGE_URI=redis://your-redis:6379 \
  whiteboardrt-storage-backend:latest
```

Release tags are published to `ghcr.io/homeserverhq/whiteboardrt-storage-backend`.

Without `STORAGE_URI`, the service uses an in-memory store. Data is lost when the process restarts.

### Docker Compose

The included `docker-compose.yml` runs the backend with Redis:

```bash
docker compose up -d --build
```

## Configuration

The service reads process environment variables at runtime.

| Variable        | Description                                                                                                       | Default                              |
| --------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `PORT`          | Server listening port                                                                                             | `8080`                               |
| `GLOBAL_PREFIX` | API prefix for all routes                                                                                         | `/api/v2`                            |
| `STORAGE_URI`   | Keyv connection string, for example `redis://user:pass@localhost:6379`. Supported adapters include Redis, MongoDB, PostgreSQL, MySQL, and SQLite. | empty (in-memory, **non-persistent**) |
| `LOG_LEVEL`     | Log level (`debug`, `verbose`, `log`, `warn`, `error`)                                                            | `warn`                               |
| `BODY_LIMIT`    | Maximum payload size for scenes, rooms, and files                                                                 | `50mb`                               |

## API

All payloads are raw binary bodies. Responses for missing records are `404 Not Found`.

| Method | Path                  | Description                                      |
| ------ | --------------------- | ------------------------------------------------ |
| `POST` | `/api/v2/scenes`      | Store a scene and return `{ "id": "<16 digits>" }` |
| `GET`  | `/api/v2/scenes/:id`  | Fetch a scene                                    |
| `GET`  | `/api/v2/rooms/:id`   | Fetch a room                                     |
| `PUT`  | `/api/v2/rooms/:id`   | Store or replace a room                          |
| `GET`  | `/api/v2/files/:id`   | Fetch a file                                     |
| `PUT`  | `/api/v2/files/:id`   | Store or replace a file                          |

Scene IDs are numeric because compatible front ends expect numeric share-link IDs.

## Using with WhiteboardRT

Point the WhiteboardRT web container at the backend:

```bash
docker run -d -p 8080:80 \
  -e VITE_APP_STORAGE_BACKEND=http \
  -e VITE_APP_HTTP_STORAGE_BACKEND_URL=http://whiteboardrt-storage-backend:8080/api/v2 \
  -e VITE_APP_BACKEND_V2_GET_URL=http://whiteboardrt-storage-backend:8080/api/v2/scenes/ \
  -e VITE_APP_BACKEND_V2_POST_URL=http://whiteboardrt-storage-backend:8080/api/v2/scenes/ \
  -e VITE_APP_WS_SERVER_URL=http://whiteboardrt-server:80 \
  whiteboardrt:latest
```

For WhiteboardRT Agent remote persistence:

```bash
-e WHITEBOARD_RT_AGENT_PERSISTENCE=remote
-e WHITEBOARD_RT_AGENT_STORAGE_URL=http://whiteboardrt-storage-backend:8080/api/v2
```

## Security

The service has no built-in authentication and enables CORS. Run it only on a trusted network or behind a reverse proxy that enforces access control.

## Development

```bash
npm ci
npm run lint:check
npm run brand:check
npm test
npm run test:e2e
npm run build
```

## License and attribution

WhiteboardRT Storage Backend includes code from `excalidraw-storage-backend`, Copyright (c) 2022 Kilian Decaderincourt, licensed under the MIT License. See [LICENSE](./LICENSE) and [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).

The Excalidraw name and logo are trademarks of their respective owner. This fork does not claim any affiliation with or endorsement by Excalidraw.
