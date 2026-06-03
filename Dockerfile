# Build stage
FROM node:22-slim AS build

# Install build dependencies for canvas and other native modules
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    python3 \
    wget \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Download face-api models
RUN mkdir -p models && \
    wget -q -P ./models https://raw.githubusercontent.com/vladmandic/face-api/master/model/ssd_mobilenetv1_model-weights_manifest.json && \
    wget -q -P ./models https://raw.githubusercontent.com/vladmandic/face-api/master/model/ssd_mobilenetv1_model.bin && \
    wget -q -P ./models https://raw.githubusercontent.com/vladmandic/face-api/master/model/face_landmark_68_model-weights_manifest.json && \
    wget -q -P ./models https://raw.githubusercontent.com/vladmandic/face-api/master/model/face_landmark_68_model.bin && \
    wget -q -P ./models https://raw.githubusercontent.com/vladmandic/face-api/master/model/face_recognition_model-weights_manifest.json && \
    wget -q -P ./models https://raw.githubusercontent.com/vladmandic/face-api/master/model/face_recognition_model.bin

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:22-slim

# Install runtime dependencies for canvas and tensorflow
RUN apt-get update && apt-get install -y \
    libcairo2 \
    libjpeg62-turbo \
    libpango-1.0-0 \
    libgif7 \
    librsvg2-2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy necessary files from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/models ./models

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main"]