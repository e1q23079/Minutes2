FROM mcr.microsoft.com/devcontainers/base:ubuntu

# Install git-lfs
RUN apt-get update \
    && apt-get install -y \
    git-lfs \
    ffmpeg \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*
