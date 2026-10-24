# Use official Node image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy frontend source code
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Run Vite in host mode so it's accessible outside the container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]