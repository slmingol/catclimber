# Chanjinxamagig - Copilot Agent Instructions

## Project Overview

**Chanjinxamagig** is a static word-ladder puzzle game (vanilla HTML/CSS/JS) served by Caddy in a container.

- **Type**: Static web app
- **Languages**: HTML, CSS, JavaScript
- **Server**: Caddy (container)
- **Container Runtime**: Podman Desktop (preferred)
- **CI/CD**: GitHub Actions for container publish and version bump

## Repository Layout

```
/
├── index.html
├── styles.css
├── script.js
├── Dockerfile
├── docker-compose.yml
├── Caddyfile
├── VERSION
└── .github/workflows/
    ├── docker-build.yml
    └── version-bump.yml
```

## Build, Run, Validate

### Local quick test (no container)
```bash
open index.html
# OR
python3 -m http.server 8000
# visit http://localhost:8000
```

### Podman (preferred)
```bash
podman build -t chanjinxamagig .
podman run -d --name chanjinxamagig -p 3992:80 chanjinxamagig
podman logs -f chanjinxamagig
podman rm -f chanjinxamagig
```

### Compose
```bash
podman compose up -d
podman compose logs -f
podman compose down
```

If `podman compose` is unavailable in your environment, use:
```bash
podman-compose up -d
podman-compose down
```

## CI/CD Notes

- `docker-build.yml`: builds and publishes image to GHCR on push
- `version-bump.yml`: updates version automatically

## Common Pitfalls

- This is a static app: there is no Node.js build step and no package.json
- `docker-compose.yml` references GHCR image by default; local changes need local `podman build` + `podman run`
- `Caddyfile` sets long cache headers; hard-refresh browser when testing CSS/JS edits

## Change Guidelines

- Keep puzzle data and validation logic in `script.js`
- Keep styling-only changes in `styles.css`
- Keep container behavior in `Dockerfile` and `Caddyfile`

## Trust these instructions first; only search when they are incomplete.
