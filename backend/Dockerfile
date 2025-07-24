# ---- Base image ----
FROM node:18

# Set working directory (Recommended)
WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source files
COPY . .

# Expose backend port (Cloud Run uses 8080 by default)
EXPOSE 8080

# Start the backend server
CMD ["npm", "start"]
