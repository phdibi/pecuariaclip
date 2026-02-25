# PecuariaClip Pro — Video Rendering Container
# Runs as a Cloud Run Job with FFmpeg + Puppeteer for video processing.

FROM node:20-slim

# Install system dependencies: FFmpeg, Chromium, fonts
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      ffmpeg \
      ca-certificates \
      chromium \
      fonts-liberation \
      fonts-noto-color-emoji \
      libgbm1 \
      libasound2 \
      libatk1.0-0 \
      libc6 \
      libcairo2 \
      libcups2 \
      libdbus-1-3 \
      libexpat1 \
      libfontconfig1 \
      libgcc1 \
      libglib2.0-0 \
      libgtk-3-0 \
      libnspr4 \
      libnss3 \
      libpango-1.0-0 \
      libpangocairo-1.0-0 \
      libstdc++6 \
      libx11-6 \
      libx11-xcb1 \
      libxcb1 \
      libxcomposite1 \
      libxcursor1 \
      libxdamage1 \
      libxext6 \
      libxfixes3 \
      libxi6 \
      libxrandr2 \
      libxrender1 \
      libxss1 \
      libxtst6 \
    && rm -rf /var/lib/apt/lists/*

# Tell Puppeteer to use installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Create app directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json ./
RUN npm ci --production

# Copy source code
COPY src/ ./src/

# Environment variables (set by Cloud Run Job overrides)
# RENDER_JOB_ID - Firestore document ID for the render job
# USER_ID - Firebase Auth UID for storage path

CMD ["node", "src/index.js"]
