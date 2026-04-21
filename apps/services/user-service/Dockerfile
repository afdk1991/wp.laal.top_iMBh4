# User Service Dockerfile
# Version: v1.0.0.0

FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY src ./src
COPY .env ./.env

# Expose port
EXPOSE 3001

# Start service
CMD ["npm", "start"]