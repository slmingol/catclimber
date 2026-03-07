FROM caddy:alpine

# Copy all static files to Caddy's default serving directory
COPY index.html /usr/share/caddy/
COPY styles.css /usr/share/caddy/
COPY script.js /usr/share/caddy/
COPY Caddyfile /etc/caddy/Caddyfile

# Expose port 80
EXPOSE 80

# Caddy will automatically use the Caddyfile
