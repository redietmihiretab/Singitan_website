FROM node:20-bookworm-slim

# Install python/make/g++ for better-sqlite3 compilation if needed
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Create data directory
RUN mkdir -p /app/src/data

# Expose port
EXPOSE 8080

# Start command
CMD ["npm", "start"]
