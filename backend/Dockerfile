FROM python:3.12-slim

WORKDIR /code

# build-essential is needed for common build tools like gcc, make, g++
# ffmpeg is needed for audio processing
RUN apt update && apt install -y --no-install-recommends \
    build-essential \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy everything inside the app directory to the container's /code/app directory
COPY app/ ./app

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]