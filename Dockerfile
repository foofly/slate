# Stage 1: build Vue SPA
FROM --platform=$BUILDPLATFORM node:20-alpine AS build
WORKDIR /build
COPY package.json package-lock.json* ./
RUN npm ci
COPY vite.config.js tailwind.config.js postcss.config.js ./
COPY client ./client
RUN npm run build

# Stage 2: Python runtime
FROM python:3.11-slim-bullseye

ENV SLATE_HOST=0.0.0.0
ENV SLATE_PORT=5147
ENV SLATE_VAULT_PATH=/vault
ENV PUID=1000
ENV PGID=1000

RUN apt-get update && apt-get install -y --no-install-recommends gosu curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY server/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY server ./server
COPY --from=build /build/client/dist ./client/dist

COPY entrypoint.sh healthcheck.sh /
RUN chmod +x /entrypoint.sh /healthcheck.sh

VOLUME /vault
EXPOSE 5147

HEALTHCHECK --interval=60s --timeout=10s --start-period=10s CMD /healthcheck.sh

ENTRYPOINT ["/entrypoint.sh"]
