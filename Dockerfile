# Base image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install system dependencies
RUN apk add --no-cache python3 make g++ tzdata

# Set timezone
ENV TZ=UTC
RUN cp /usr/share/zoneinfo/UTC /etc/localtime

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm install

# Bundle app source
COPY . .

# Environment variables
ENV NODE_ENV=production
ENV CREATED_BY=YohanPlaques
ENV CREATED_AT="2025-02-08 04:44:28"

# Expose port
EXPOSE 8080

# Start command
CMD ["npm", "start"]