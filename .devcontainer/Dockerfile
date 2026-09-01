FROM mcr.microsoft.com/devcontainers/base:ubuntu

# Install git-lfs
RUN apt-get update \
    && apt-get install -y \
    git-lfs \
    ffmpeg \
    curl \
    zstd \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Install Ollama
RUN curl -fsSL https://ollama.com/install.sh | sh
