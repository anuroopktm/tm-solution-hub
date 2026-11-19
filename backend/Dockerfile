FROM python:3.12-slim

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

ENV PYTHONPATH=/app

# Copy dependency files
COPY pyproject.toml uv.lock /app/

# Install dependencies
RUN uv sync --frozen --no-install-project

# Copy backend source code
COPY . .

# Sync the full project
RUN uv sync --frozen

EXPOSE 8000

CMD ["/bin/sh", "/app/prestart.sh"]
