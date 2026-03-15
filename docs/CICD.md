# CI/CD Pipeline

This document describes the Continuous Integration and Continuous Deployment (CI/CD) pipeline for CAT·CLIMBER.

## Pipeline Overview

![CI/CD Pipeline](diagrams/cicd-pipeline.excalidraw.png)

_You can also open the [editable diagram](diagrams/cicd-pipeline.excalidraw) in [Excalidraw](https://excalidraw.com) or VS Code with the Excalidraw extension._

## Workflow Architecture

The CI/CD pipeline consists of two parallel workflows triggered by pushes to the `main` branch:

1. **Version Bump Workflow** - Automatically increments the semantic version
2. **Docker Build Workflow** - Builds and publishes the container image

Both workflows run in parallel to optimize build time, with safeguards to prevent conflicts.

## Workflows

### 1. Version Bump Workflow

**File:** `.github/workflows/version-bump.yml`

**Trigger:** Push to `main` branch (unless commit message contains `[skip version]`)

**Steps:**

1. **Checkout code**
   - Fetches the repository with full history
   - Uses GitHub token for authentication

2. **Configure Git**
   - Sets up bot identity for commits
   - User: `github-actions[bot]`
   - Email: `github-actions[bot]@users.noreply.github.com`

3. **Read current version**
   - Reads version from `VERSION` file
   - Format: `X.Y.Z` (semantic versioning)

4. **Bump version**
   - Determines bump type (patch, minor, major)
   - Default: `patch` (increments Z in X.Y.Z)
   - Manual trigger: Can specify bump type via workflow dispatch

5. **Increment version**
   - Patch: `1.2.3` → `1.2.4`
   - Minor: `1.2.3` → `1.3.0`
   - Major: `1.2.3` → `2.0.0`

6. **Commit and push**
   - Updates `VERSION` file
   - Commits with message: `Bump version to X.Y.Z [skip version]`
   - Pushes to `main` branch
   - **`[skip version]` tag prevents infinite loop**

**Manual Trigger:**

You can manually trigger a version bump with a specific type:

```bash
# Via GitHub UI: Actions → Auto Version Bump → Run workflow
# Select bump type: patch, minor, or major
```

**Skip Version Bump:**

To skip version bump on a specific commit:

```bash
git commit -m "Your commit message [skip version]"
```

### 2. Docker Build Workflow

**File:** `.github/workflows/docker-build.yml`

**Trigger:** 
- Push to `main` branch
- Push of tags matching `v*`
- Manual workflow dispatch

**Steps:**

1. **Checkout repository**
   - Fetches the code to build

2. **Read version**
   - Reads version from `VERSION` file
   - Used for image tagging and build args

3. **Set up Docker Buildx**
   - Configures BuildKit for multi-platform builds
   - Enables build caching

4. **Log in to GHCR**
   - Authenticates to GitHub Container Registry
   - Uses automatic `GITHUB_TOKEN` (no manual setup required)
   - Registry: `ghcr.io`

5. **Extract metadata**
   - Generates image tags based on:
     - Branch name (`main`)
     - Version number (`v1.2.3`)
     - Git SHA (`sha-abc123`)
     - Latest tag (for default branch)
   - Creates image labels with metadata

6. **Build and push**
   - Builds Docker image from `Dockerfile`
   - Passes `VERSION` as build arg
   - Tags with multiple identifiers
   - Pushes to GHCR
   - Uses GitHub Actions cache for faster builds

**Image Tags:**

Every successful build creates multiple tags:

| Tag Pattern | Example | Description |
|-------------|---------|-------------|
| `main` | `ghcr.io/slmingol/cat-climber:main` | Latest from main branch |
| `latest` | `ghcr.io/slmingol/cat-climber:latest` | Alias for main |
| `vX.Y.Z` | `ghcr.io/slmingol/cat-climber:v1.2.3` | Specific version |
| `vX.Y` | `ghcr.io/slmingol/cat-climber:v1.2` | Minor version |
| `vX` | `ghcr.io/slmingol/cat-climber:v1` | Major version |
| `sha-*` | `ghcr.io/slmingol/cat-climber:sha-abc123` | Specific commit |

**Manual Trigger:**

```bash
# Via GitHub UI: Actions → Build and Push Docker Image → Run workflow
```

### 3. Cleanup Workflow (Optional)

**File:** `.github/workflows/cleanup-runs.yml`

Periodically cleans up old workflow runs to save storage space.

## Pipeline Flow

### Typical Flow (on push to main)

```
Developer pushes to main
         │
         ├─────────────────────────────────┐
         │                                 │
         ▼                                 ▼
   Version Bump                      Docker Build
         │                                 │
         ├─ Read VERSION                   ├─ Read VERSION
         ├─ Increment patch                ├─ Build image
         ├─ Write VERSION                  ├─ Tag image
         └─ Commit [skip version]          └─ Push to GHCR
         │                                 │
         │                                 ▼
         │                          GHCR Registry
         │                                 │
         │                                 ├─ main
         │                                 ├─ latest
         │                                 ├─ v1.2.3
         │                                 └─ sha-abc123
         │                                 │
         └─────────────────────────────────┤
                                           ▼
                                    Ready to Deploy
```

### First Push After Version Bump

When the version bump workflow commits the new VERSION file:

1. The commit includes `[skip version]` tag
2. This commit triggers workflows again
3. Version bump workflow **skips** (due to tag)
4. Docker build workflow **runs** with new version
5. New image is published with updated version tags

This ensures the version in the image matches the VERSION file.

## Build Artifacts

### Container Image

**Location:** `ghcr.io/slmingol/cat-climber`

**Size:** ~100MB (Alpine-based)

**Contents:**
- Caddy web server
- Node.js runtime
- Puppeteer + Chromium
- Static web assets
- Puzzle scraper scripts
- Puzzle data files

**Labels:**
- `org.opencontainers.image.source` - GitHub repository URL
- `org.opencontainers.image.version` - Semantic version
- `org.opencontainers.image.created` - Build timestamp
- `org.opencontainers.image.revision` - Git commit SHA

### VERSION File

**Location:** `VERSION` (repository root)

**Format:** `X.Y.Z` (semantic versioning)

**Usage:**
- Read by build workflow
- Embedded in Docker image as `APP_VERSION` env var
- Displayed in application (if implemented)

## Deployment

### Pull from Registry

```bash
# Pull latest
podman pull ghcr.io/slmingol/cat-climber:latest

# Pull specific version
podman pull ghcr.io/slmingol/cat-climber:v1.2.3

# Pull specific commit
podman pull ghcr.io/slmingol/cat-climber:sha-abc123
```

### Run Container

```bash
# Run latest
podman run -d --name cat-climber -p 3992:80 ghcr.io/slmingol/cat-climber:latest

# Run specific version
podman run -d --name cat-climber -p 3992:80 ghcr.io/slmingol/cat-climber:v1.2.3
```

### Using Docker Compose

The `docker-compose.yml` file can reference the GHCR image:

```yaml
services:
  cat-climber:
    image: ghcr.io/slmingol/cat-climber:latest
    ports:
      - "3992:80"
    restart: unless-stopped
```

Then deploy:

```bash
podman compose pull  # Pull latest image
podman compose up -d # Start container
```

## Secrets and Permissions

### Required Secrets

**None!** The pipeline uses automatic GitHub tokens that require no manual setup.

### Required Permissions

The workflows automatically have these permissions via `GITHUB_TOKEN`:

- `contents: read` - Read repository code
- `contents: write` - Commit VERSION updates (version bump)
- `packages: write` - Push to GHCR

These are granted automatically by GitHub Actions for repository workflows.

## Build Optimization

### Caching Strategy

The build workflow uses GitHub Actions cache to speed up builds:

1. **BuildKit cache**
   - Caches Docker layers between builds
   - Type: `gha` (GitHub Actions cache)
   - Mode: `max` (cache all layers)

2. **npm cache**
   - Caches Node.js dependencies
   - Configured in Dockerfile with `npm ci`

3. **Puppeteer cache**
   - Skips Chromium download
   - Uses Alpine package manager for Chromium

### Build Time

| Build Type | Duration |
|------------|----------|
| Cold build (no cache) | ~3-5 minutes |
| Warm build (with cache) | ~1-2 minutes |
| Version bump only | ~10-15 seconds |

## Monitoring and Debugging

### View Workflow Runs

GitHub UI → Actions tab → Select workflow

### View Build Logs

```bash
# In GitHub UI: Click on workflow run → Click on job → View logs

# Or fetch logs via CLI (requires gh CLI)
gh run list
gh run view <run-id> --log
```

### Check Image in Registry

GitHub UI → Packages (right sidebar) → cat-climber

### Verify Image Locally

```bash
# Pull and inspect
podman pull ghcr.io/slmingol/cat-climber:latest
podman inspect ghcr.io/slmingol/cat-climber:latest

# Check version
podman run --rm ghcr.io/slmingol/cat-climber:latest cat /VERSION

# Check labels
podman inspect ghcr.io/slmingol/cat-climber:latest | \
  jq '.[0].Config.Labels'
```

## Troubleshooting

### Version Bump Not Running

**Symptom:** VERSION file not updating after push

**Check:**
- Commit message doesn't contain `[skip version]`
- Workflow file exists: `.github/workflows/version-bump.yml`
- View workflow logs in Actions tab

**Fix:**
```bash
# Manually trigger version bump
gh workflow run version-bump.yml -f version_type=patch
```

### Docker Build Failing

**Symptom:** Build workflow fails

**Common causes:**
1. Dockerfile syntax error
2. Missing dependency in package.json
3. Network issues downloading packages

**Debug:**
```bash
# Build locally to reproduce
podman build -t cat-climber-test .

# Check specific layer
podman build --target <layer-name> -t test .
```

### Image Not Pushing to GHCR

**Symptom:** Build succeeds but image not in registry

**Check:**
- GitHub token has `packages: write` permission
- Repository visibility settings allow package publishing
- Check workflow logs for authentication errors

**Fix:**
```bash
# Verify GHCR login locally
echo $GITHUB_TOKEN | podman login ghcr.io -u $GITHUB_USERNAME --password-stdin

# Manually push
podman tag cat-climber:latest ghcr.io/slmingol/cat-climber:latest
podman push ghcr.io/slmingol/cat-climber:latest
```

### Infinite Version Bump Loop

**Symptom:** Version keeps incrementing on every commit

**Cause:** Missing `[skip version]` tag in version bump commit

**Check:**
```bash
# View recent commits
git log --oneline -n 10

# Should see: "Bump version to X.Y.Z [skip version]"
```

**Fix:**
- Ensure version bump workflow includes `[skip version]` in commit message
- Check `.github/workflows/version-bump.yml` commit step

### Stale Cache Issues

**Symptom:** Build includes old dependencies or files

**Fix:**
```bash
# Clear GitHub Actions cache via UI or API
gh cache list
gh cache delete <cache-id>

# Or force cold build by editing Dockerfile (add comment)
```

## Best Practices

### Semantic Versioning

Follow [semver.org](https://semver.org) guidelines:

- **Major (X.0.0)**: Breaking changes, incompatible API
- **Minor (X.Y.0)**: New features, backward compatible
- **Patch (X.Y.Z)**: Bug fixes, backward compatible

### Commit Messages

Use conventional commits for clarity:

```bash
# Features
git commit -m "feat: add puzzle difficulty filter"

# Bug fixes
git commit -m "fix: correct word validation logic"

# Docs
git commit -m "docs: update README with new examples"

# Skip version bump
git commit -m "chore: update .gitignore [skip version]"
```

### Version Strategy

- **Automatic patch bumps**: For regular development commits
- **Manual minor bumps**: For new features
- **Manual major bumps**: For breaking changes

```bash
# Minor version bump
gh workflow run version-bump.yml -f version_type=minor

# Major version bump
gh workflow run version-bump.yml -f version_type=major
```

### Image Tagging Strategy

- **`latest` / `main`**: Use for development/testing
- **`vX.Y.Z`**: Use for production deployments
- **`sha-*`**: Use for debugging specific commits
- **`vX.Y`**: Use for "stable" minor version series

### Testing Before Merge

```bash
# Build and test locally before pushing
podman build -t cat-climber-test .
podman run -d --name test -p 8080:80 cat-climber-test

# Test application
curl http://localhost:8080
open http://localhost:8080

# Clean up
podman rm -f test
```

## Related Documentation

- [ARCHITECTURE.md](../ARCHITECTURE.md) - System architecture overview
- [DOCKER.md](DOCKER.md) - Docker/Podman deployment guide
- [README.md](../README.md) - Project overview

## Future Enhancements

Potential CI/CD improvements:

1. **Multi-stage testing**
   - Unit tests
   - Integration tests
   - E2E tests with Playwright

2. **Security scanning**
   - Trivy for vulnerability scanning
   - Dependabot for dependency updates
   - SLSA provenance attestation

3. **Multi-platform builds**
   - Build for linux/amd64
   - Build for linux/arm64
   - Support Apple Silicon

4. **Automated deployments**
   - Deploy to staging on push
   - Deploy to production on tag
   - Blue-green deployments

5. **Performance monitoring**
   - Lighthouse CI for web vitals
   - Bundle size tracking
   - Build time metrics

---

_Last updated: March 2026_
