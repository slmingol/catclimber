FROM caddy:alpine

# Install Node.js, npm, chromium, and dependencies for puppeteer
RUN apk add --no-cache \
    nodejs \
    npm \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    libstdc++

# Set Puppeteer to use installed chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Create app directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production && \
    npm cache clean --force && \
    rm -rf /tmp/* /root/.npm

# Copy scraper scripts and data
COPY scripts/daily-scraper.js /app/
COPY scripts/scraper.js /app/
COPY scripts/scheduler.js /app/
COPY scripts/merge-puzzles.js /app/
COPY data/custom-puzzles.json /app/

# Copy all static files to Caddy's default serving directory
COPY public/index.html /usr/share/caddy/index.html.tmp
COPY public/archive.html /usr/share/caddy/
COPY public/styles.css /usr/share/caddy/
COPY public/archive-styles.css /usr/share/caddy/
COPY public/script.js /usr/share/caddy/
COPY public/archive-script.js /usr/share/caddy/
COPY public/cat-climber-logo.png /usr/share/caddy/
COPY data/collected-puzzles.json /usr/share/caddy/
COPY Caddyfile /etc/caddy/Caddyfile

# Version argument - placed here to maximize cache usage for expensive operations above
ARG VERSION=dev
ENV APP_VERSION=${VERSION}

# Replace version placeholder in HTML and clean up
RUN sed "s/__VERSION__/${APP_VERSION}/g" /usr/share/caddy/index.html.tmp > /usr/share/caddy/index.html && \
    rm /usr/share/caddy/index.html.tmp && \
    rm -rf /var/cache/apk/* /tmp/*

# Create startup script that runs scheduler in background
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'echo "Starting Cat Climber puzzle scheduler..."' >> /start.sh && \
    echo 'cd /app && node scheduler.js > /var/log/scheduler.log 2>&1 &' >> /start.sh && \
    echo 'echo "Starting Caddy web server..."' >> /start.sh && \
    echo 'exec caddy run --config /etc/caddy/Caddyfile --adapter caddyfile' >> /start.sh && \
    chmod +x /start.sh

# Expose port 80
EXPOSE 80

# Start scheduler in background and Caddy in foreground
CMD ["/start.sh"]
