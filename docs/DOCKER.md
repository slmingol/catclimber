# Docker Build Options

This project provides two Docker build options with different size/functionality tradeoffs:

## Full Version (Dockerfile)
**Size:** ~896 MB  
**Includes:** Web server + automated puzzle scraping

### What's included:
- Caddy web server for serving static files
- Node.js runtime
- Chromium browser (for Puppeteer)
- Automated cron job (runs 4x daily at 12:05 AM, 6:05 AM, 12:05 PM, 6:05 PM)
- Puzzle scraping scripts

### Build:
```bash
podman build -t cat-climber:latest .
podman run -d --name cat-climber -p 3992:80 cat-climber:latest
```

## Slim Version (Dockerfile.slim)
**Size:** ~69 MB (92% smaller!)  
**Includes:** Web server only

### What's included:
- Caddy web server for serving static files
- Pre-collected puzzles from build time

### What's NOT included:
- No Node.js
- No Chromium
- No automated scraping (puzzles must be updated manually)

### Build:
```bash
podman build -f Dockerfile.slim -t cat-climber:slim .
podman run -d --name cat-climber -p 3992:80 cat-climber:slim
```

### When to manually update puzzles:
```bash
# Run scraper locally
node scripts/daily-scraper.js

# Rebuild slim image with new puzzles
podman build -f Dockerfile.slim -t cat-climber:slim .
```

## Recommendations

**Use Full Version if:**
- You want automatic daily puzzle collection
- You don't mind the larger image size
- You're running long-term without manual intervention

**Use Slim Version if:**
- Disk space is limited
- You're willing to manually update puzzles periodically
- You're deploying to resource-constrained environments
- You're doing frequent development/testing iterations

## Size Comparison

| Version | Size | Savings |
|---------|------|---------|
| Full    | 896 MB | - |
| Slim    | 69 MB  | 92% |

## Cleanup Old Images

To free up disk space from old builds:
```bash
# Remove all old cat-climber versions except latest
podman images localhost/cat-climber --format "{{.Repository}}:{{.Tag}} {{.ID}}" | \
  grep -v "latest\|slim" | awk '{print $2}' | xargs -I {} podman rmi {}

# Or remove all unused images
podman image prune -a
```
