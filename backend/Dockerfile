FROM python:3.12-slim

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Copy dependency files
COPY pyproject.toml uv.lock /app/

# Install dependencies
RUN uv sync --frozen

# Copy backend source code
COPY . .

EXPOSE 8000

CMD ["/bin/sh", "/app/prestart.sh"]
