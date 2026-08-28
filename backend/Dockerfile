FROM node:20-alpine

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm ci --only=production

# Copy the rest of the backend source code
COPY . .

# The backend runs on port 5000 by default (as per docker-compose.yml)
EXPOSE 5000

# Command to run the application
CMD ["npm", "start"]
