<p align="center">
  <img src="docs/slate_logo.svg" alt="Slate" height="80">
</p>

A self-hosted Docker web interface for [Obsidian](https://obsidian.md) vaults. Browse and edit your markdown notes in a browser with a full WYSIWYG editor, hierarchical folder navigation, and Obsidian-flavored markdown rendering.

![Slate — dark theme](docs/Screenshot_darkSlate.png)
![Slate — light theme](docs/Screenshot_lightSlate.png)

## Features

- **WYSIWYG editor** — Toggle between rich editing and raw markdown via [Toast UI Editor](https://github.com/nhn/tui.editor)
- **Hierarchical file tree** — Navigate nested vault folders; `.obsidian/` and hidden directories are automatically excluded
- **Obsidian markdown support** — Callouts (`> [!NOTE]`), wikilinks (`[[Note Name]]`), frontmatter display, `#tags`
- **Full-text search** — Instant search across all notes powered by Whoosh
- **Auto-save** — Debounced 1.5s auto-save while editing; Ctrl+S for immediate save
- **Keyboard shortcuts** — `/` to search, `Ctrl+Alt+N` for new note, `Ctrl+E` to toggle edit/preview
- **Read-only mode** — Mount your vault read-only for safe browsing
- **Docker-native** — Multi-stage build, PUID/PGID support, health check endpoint

## Installation

Slate is available on [Docker Hub](https://hub.docker.com/r/foofly/slate).
The image supports Linux AMD64 and ARM64, including Apple Silicon Docker hosts
and 64-bit Raspberry Pi systems. Install Docker Engine with Docker Compose v2,
or Docker Desktop, before starting. No source checkout or local build is needed.

### Docker Compose (recommended)

1. Create a directory for the deployment:

```bash
mkdir slate
cd slate
```

2. Save the following as `compose.yaml`. Replace `/path/to/your/obsidian/vault`
with the absolute path to your existing vault on the Docker host. Set `PUID`
and `PGID` to the vault owner's numeric IDs (`id -u` and `id -g` on Linux).

```yaml
services:
  slate:
    image: foofly/slate:latest
    container_name: slate
    restart: unless-stopped
    ports:
      - "5147:5147"
    volumes:
      - /path/to/your/obsidian/vault:/vault:rw
    environment:
      SLATE_VAULT_PATH: /vault
      SLATE_HOST: 0.0.0.0
      SLATE_PORT: 5147
      SLATE_READONLY: "false"
      PUID: 1000
      PGID: 1000
```

3. Pull and start Slate:

```bash
docker compose pull
docker compose up -d
```

4. Open [http://localhost:5147](http://localhost:5147), or
`http://YOUR_SERVER_IP:5147` for a remote Docker host.

To use another host port, change the left side of the mapping, for example
`"8080:5147"`, and open port 8080. The internal port stays 5147.
The vault remains on the host when the container is replaced or removed.

### Portainer Stack

1. Go to **Stacks → Add stack** and name the stack `slate`.
2. Select **Web editor** and paste the Compose example above.
3. Replace the vault path with its absolute path on the Docker host and set
   `PUID` and `PGID` for the vault owner.
4. Click **Deploy the stack**, then open `http://YOUR_SERVER_IP:5147`.

To update, use Portainer's pull-image option when redeploying the stack.

### Docker CLI

Replace the vault path and IDs before running:

```bash
docker pull foofly/slate:latest
docker run -d \
  --name slate \
  --restart unless-stopped \
  -p 5147:5147 \
  -v /path/to/your/obsidian/vault:/vault:rw \
  -e PUID=1000 -e PGID=1000 \
  foofly/slate:latest
```

### Updating and managing Slate

For Compose installations:

```bash
# Download and use the latest image
docker compose pull
docker compose up -d

# Show status and logs
docker compose ps
docker compose logs -f slate

# Stop and remove the container (the host vault is retained)
docker compose down
```

For Docker CLI installations, pull the image, run `docker stop slate` and
`docker rm slate`, then repeat the `docker run` command above with the same
vault path and settings.

`latest` follows tested updates to `main`. To pin an installation, replace
`foofly/slate:latest` with a published `sha-<full-commit>` tag or an image digest
from Docker Hub. Version tags are available when a corresponding release has
been published. Back up your vault before updating.

### Using the repository's Compose file

If you prefer to keep the deployment files in a source checkout:

```bash
git clone https://github.com/foofly/slate.git
cd slate
printf 'SLATE_VAULT_PATH=/absolute/path/to/your/vault\n' > .env
docker compose pull
docker compose up -d
```

Edit `docker-compose.yml` to change the host port, PUID, PGID, or read-only
setting. The supplied file only substitutes the host vault path from `.env`.

### Building from source

From a source checkout, build a local image:

```bash
docker build -t slate:local .
```

Use `slate:local` instead of `foofly/slate:latest` in the Docker CLI example.
The default Compose file uses the published Docker Hub image.

## Configuration

All configuration is via environment variables:

| Variable | Default | Description |
|---|---|---|
| `SLATE_VAULT_PATH` | `/vault` | Path to the vault directory inside the container |
| `SLATE_HOST` | `0.0.0.0` | Bind host |
| `SLATE_PORT` | `5147` | Bind port |
| `SLATE_READONLY` | `false` | Set to `true` to disable all write operations |
| `PUID` | `1000` | User ID for vault file ownership (when running as root) |
| `PGID` | `1000` | Group ID for vault file ownership |

### Read-only mode

```yaml
volumes:
  - /path/to/vault:/vault:ro
environment:
  SLATE_READONLY: "true"
```

## Development

**Requirements:** Node.js 24, Python 3.11

```bash
# Install frontend dependencies
npm ci

# Install backend dependencies
pip install --require-hashes -r server/requirements.txt

# Terminal 1 — backend (hot reload)
SLATE_VAULT_PATH=/path/to/your/vault uvicorn server.main:app --reload --port 8000

# Terminal 2 — frontend dev server (proxies /api to :8000)
npm run dev
# → http://localhost:5173
```

### Build frontend for production

```bash
npm run build
# Output: client/dist/
```

## Project Structure

```
slate/
├── Dockerfile
├── docker-compose.yml
├── package.json
├── vite.config.js
├── tailwind.config.js
├── client/                     # Vue 3 SPA
│   ├── index.js                # App entry point
│   ├── App.vue                 # Root layout
│   ├── store.js                # Pinia state (vault tree, active note)
│   ├── router.js               # Vue Router
│   ├── api.js                  # API client (Axios)
│   ├── helpers.js              # Path utilities, debounce
│   ├── components/
│   │   ├── FileTree.vue        # Sidebar folder tree
│   │   ├── TreeNode.vue        # Recursive tree node
│   │   ├── SearchModal.vue     # Full-text search overlay
│   │   ├── NewNoteModal.vue    # Create note dialog
│   │   └── toastui/            # Toast UI Editor wrappers + Obsidian plugin
│   └── views/
│       ├── NoteEditor.vue      # Main editor view
│       └── Welcome.vue         # Empty state
└── server/                     # FastAPI backend
    ├── main.py                 # Routes
    ├── vault.py                # Filesystem operations
    ├── search.py               # Whoosh full-text index
    ├── helpers.py              # Path sanitization (security)
    ├── models.py               # Pydantic schemas
    └── config.py               # Environment config
```

## API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tree` | Full vault folder/file tree |
| `GET` | `/api/notes/{path}` | Read a note |
| `PUT` | `/api/notes/{path}` | Save a note |
| `POST` | `/api/notes/{path}` | Create a note |
| `DELETE` | `/api/notes/{path}` | Delete a note |
| `PATCH` | `/api/notes/{path}` | Rename/move a note |
| `GET` | `/api/search?q=…` | Full-text search |
| `GET` | `/health` | Health check |

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `/` | Open search |
| `Ctrl+Alt+N` | New note |
| `Ctrl+S` | Save current note |
| `Ctrl+E` | Toggle edit / preview |
| `Escape` | Close modal |

## Obsidian Syntax Support

| Feature | Supported |
|---|---|
| Callouts `> [!NOTE]`, `> [!WARNING]`, etc. | ✅ |
| Wikilinks `[[Note Name]]` | ✅ |
| Frontmatter YAML | ✅ |
| Tags `#tag` | ✅ |
| Code blocks with syntax highlighting | ✅ |
| Standard markdown (headings, tables, lists…) | ✅ |
| Backlinks / graph view | ❌ |
| Embedded images (`![[image.png]]`) | ✅ |

## Security

- All note paths are resolved and validated to stay within the vault root — path traversal attempts (`../../etc/passwd`) return HTTP 400
- Hidden directories (`.obsidian/`, `.git/`, etc.) are inaccessible via the API and excluded from the file tree
- Only `.md` files are readable/writable; requests for other file types are rejected
- Vault files are written atomically (write to `.tmp`, then rename) to prevent corruption on interrupted saves

## Stack

- **Backend:** Python 3.11, FastAPI, Uvicorn, Whoosh, aiofiles
- **Frontend:** Vue 3, Vite, Tailwind CSS, Pinia, Vue Router
- **Editor:** [Toast UI Editor v3](https://github.com/nhn/tui.editor) (MIT)

## Credits & Attributions

### Author

- **[foofly](https://github.com/foofly)** — creator and maintainer of Slate.

### Inspiration

- **[flatnotes](https://github.com/Dullage/flatnotes)** by [Adam Dullage](https://github.com/Dullage) — the architecture pattern (Vue 3 + FastAPI + Toast UI Editor served as a single Docker container) was directly inspired by this project. Licensed under MIT. Copyright © 2021 Adam Dullage.

### Frontend

- **[Toast UI Editor](https://github.com/nhn/tui.editor)** by NHN Cloud Corp. — the WYSIWYG/markdown editor at the core of the editing experience. Licensed under MIT. Copyright © 2020 NHN Cloud Corp.
- **[Vue.js](https://vuejs.org)** by Evan You — the progressive JavaScript framework powering the SPA. Licensed under MIT.
- **[Vite](https://vitejs.dev)** by VoidZero Inc. and Vite contributors — frontend build tool and dev server. Licensed under MIT.
- **[Pinia](https://pinia.vuejs.org)** by Eduardo San Martin Morote — Vue state management. Licensed under MIT.
- **[Vue Router](https://router.vuejs.org)** by Evan You — client-side routing. Licensed under MIT.
- **[Tailwind CSS](https://tailwindcss.com)** by Tailwind Labs, Inc. — utility-first CSS framework. Licensed under MIT.
- **[Axios](https://axios-http.com)** by Matt Zabriskie & Collaborators — HTTP client. Licensed under MIT.
- **[Mousetrap](https://craig.is/killing/mice)** by Craig Campbell — keyboard shortcut library. Licensed under Apache 2.0.
- **[Prism.js](https://prismjs.com)** by Lea Verou — syntax highlighting for code blocks. Licensed under MIT. Copyright © 2012 Lea Verou.

### Backend

- **[FastAPI](https://fastapi.tiangolo.com)** by Sebastián Ramírez — the web framework powering the REST API. Licensed under MIT.
- **[Uvicorn](https://www.uvicorn.org)** by Encode OSS Ltd. — ASGI server. Licensed under BSD 3-Clause. Copyright © 2017–present Encode OSS Ltd.
- **[Whoosh](https://github.com/mchaput/whoosh)** by Matt Chaput — pure-Python full-text search library. Licensed under BSD 2-Clause. Copyright © 2011 Matt Chaput.
- **[aiofiles](https://github.com/Tinche/aiofiles)** — async file I/O for Python. Licensed under Apache 2.0.
- **[Pydantic](https://docs.pydantic.dev)** by Pydantic Services Inc. and individual contributors — data validation. Licensed under MIT.
- **[PyYAML](https://pyyaml.org)** — YAML parsing for frontmatter. Licensed under MIT.

### Fonts

- **[Inter](https://rsms.me/inter/)** by Rasmus Andersson — UI typeface. Licensed under SIL Open Font License 1.1.

---

> Slate is not affiliated with or endorsed by [Obsidian](https://obsidian.md). Obsidian is a trademark of Obsidian MD Inc.

## License

MIT

## Dependency maintenance

Use Node 24 and Python 3.11. Install frontend dependencies with `npm ci`,
then run `npm test` and `npm run build`.

Python input manifests are in `server/requirements*.in`; committed `.txt`
files contain resolved versions and hashes. Install tests with
`pip install --require-hashes -r server/requirements-test.txt`, then run
`python -m pytest`.

To refresh Python locks, install `pip-tools==7.6.2` under Python 3.11 and run:

```sh
pip-compile --upgrade --generate-hashes --output-file server/requirements.txt server/requirements.in
pip-compile --upgrade --generate-hashes --output-file server/requirements-test.txt server/requirements-test.in
```

CI checks tests, the production build, dependency advisories, and container startup.
Dependabot checks dependency updates weekly. Review major UI migrations separately.

### Remaining maintenance risks

Toast UI Editor is archived upstream and Whoosh remains on its legacy release;
replacements are deferred. Tailwind 4 requires modern browsers (Safari 16.4+,
Chrome 111+, Firefox 128+).

## Docker Hub publishing

Images: https://hub.docker.com/r/foofly/slate (AMD64 and ARM64).
`latest` follows main after CI passes; stable `vX.Y.Z` Git tags publish `X.Y.Z`.
Every publication also receives `sha-<full-commit>`. Pin a version or digest
instead of `latest` when reproducible deployment is required.

Maintainers must create a public Docker Hub repository named `foofly/slate`,
set GitHub repository variable `DOCKERHUB_USERNAME` to `foofly`, and add a
read/write Docker Hub access token as the repository secret `DOCKERHUB_TOKEN`.
Use the Checks workflow's manual Run workflow button on main for the first
publication after configuring credentials. Never commit tokens.

To update an installation, run `docker compose pull && docker compose up -d`.
To build locally instead, run `docker build -t slate:local .` and use
`slate:local` in the Docker CLI example above.
