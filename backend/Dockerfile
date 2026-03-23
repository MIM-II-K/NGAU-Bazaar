FROM python:3.11-slim

WORKDIR /app

# Install system deps (Added --no-install-recommends to keep the image small)
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY . .

# (Optional) Still create the folder for local testing
RUN mkdir -p static/product_images

# Render ignores EXPOSE, but it's good practice for local documentation
EXPOSE 8000

# Flexible command for both Local and Render environments
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]