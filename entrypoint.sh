#!/bin/bash
set -e

# 1. Start Xvfb virtual framebuffer
echo "[Startup] Starting Xvfb virtual display..."
Xvfb :99 -screen 0 1280x1024x24 -ac &
export DISPLAY=:99
sleep 2

# 2. Launch Chromium with the LMArena injector extension pre-loaded
echo "[Startup] Starting Chromium with LMArena extension..."
chromium \
  --no-sandbox \
  --disable-dev-shm-usage \
  --disable-gpu \
  --disable-software-rasterizer \
  --disable-blink-features=AutomationControlled \
  --user-data-dir=/tmp/chromium-profile \
  --load-extension=/app/extension \
  "https://arena.ai/text/direct" &

sleep 5

# 3. Start lightweight status server on port 7860 (keeps Space active with minimal RAM/CPU)
echo "[Startup] Starting status server on port 7860..."
export PORT=7860
exec python3 status_server.py
