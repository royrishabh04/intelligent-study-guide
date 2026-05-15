# Use an official lightweight Python image
FROM python:3.9-slim

# Install system dependencies for OpenCV and Tesseract
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend code
COPY . .

# Expose port 5001 and run the Flask app via Gunicorn for production
EXPOSE 5001
CMD ["gunicorn", "-b", "0.0.0.0:5001", "app:app"]