# --- 1. Use official Python image ---
FROM python:3.11-slim

# --- 2. Set environment variables ---
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV ENV=production

# --- 3. Set work directory ---
WORKDIR /app

# --- 4. Install system dependencies ---
RUN apt-get update && \
    apt-get install -y build-essential libpq-dev gcc && \
    rm -rf /var/lib/apt/lists/*

# --- 5. Copy dependencies ---
COPY requirements.txt .

# --- 6. Install Python dependencies ---
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# --- 7. Copy project files ---
COPY . .

# --- 8. Create static directories if not present ---
RUN mkdir -p static/product_images

# --- 9. Expose port ---
EXPOSE 8000

# --- 10. Start FastAPI with Uvicorn ---
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]