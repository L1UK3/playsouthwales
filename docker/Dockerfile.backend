# syntax=docker/dockerfile:1

ARG PYTHON_VERSION=3.12-slim
FROM python:${PYTHON_VERSION} AS development

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Copy uv from the official image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy configuration files first for layer caching
COPY pyproject.toml uv.lock ./

# Install dependencies using uv sync
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-install-project

# Add virtual environment to PATH
ENV PATH="/app/.venv/bin:$PATH"

# Copy app code (initially, though we mount it in compose)
COPY . .

EXPOSE 5000
CMD ["uvicorn", "app:create_app", "--factory", "--host", "0.0.0.0", "--port", "5000", "--reload"]
