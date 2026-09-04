FROM python:3.11-slim

# Install system dependencies: Chromium, Xvfb, and fonts
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    chromium-driver \
    xvfb \
    fonts-liberation \
    fonts-noto-color-emoji \
    curl \
    procps \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy server code and injector extension
COPY proxy_server.py .
COPY lmarena_injector.user.js .
COPY extension/ ./extension/
COPY entrypoint.sh .

RUN chmod +x entrypoint.sh

# Hugging Face default port
EXPOSE 7860

CMD ["./entrypoint.sh"]
