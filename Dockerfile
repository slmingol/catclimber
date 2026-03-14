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
    dcron \
    libstdc++

# Set Puppeteer to use installed chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Create app directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy scraper scripts
COPY daily-scraper.js /app/
COPY scraper.js /app/
COPY merge-puzzles.js /app/
COPY custom-puzzles.json /app/

# Copy all static files to Caddy's default serving directory
COPY index.html /usr/share/caddy/index.html.tmp
COPY styles.css /usr/share/caddy/
COPY script.js /usr/share/caddy/
COPY cat-climber-logo.png /usr/share/caddy/
COPY collected-puzzles.json /usr/share/caddy/
COPY Caddyfile /etc/caddy/Caddyfile

# Version argument - placed here to maximize cache usage for expensive operations above
ARG VERSION=dev
ENV APP_VERSION=${VERSION}

# Replace version placeholder in HTML
RUN sed "s/__VERSION__/${APP_VERSION}/g" /usr/share/caddy/index.html.tmp > /usr/share/caddy/index.html && \
    rm /usr/share/caddy/index.html.tmp

# Set up cron job to run 4 times daily (12:05 AM, 6:05 AM, 12:05 PM, 6:05 PM)
RUN echo "5 0,6,12,18 * * * cd /app && /usr/bin/node daily-scraper.js >> /var/log/daily-scraper.log 2>&1" > /etc/crontabs/root

# Create startup script
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'crond -b' >> /start.sh && \
    echo 'exec caddy run --config /etc/caddy/Caddyfile --adapter caddyfile' >> /start.sh && \
    chmod +x /start.sh

# Expose port 80
EXPOSE 80

# Start both cron and caddy
CMD ["/start.sh"]
