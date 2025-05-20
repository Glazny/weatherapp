# Base image
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Create .env file with the environment variable
RUN echo "VITE_WEATHER_API_KEY=a0cbc16616ea48ea858134720252005" > .env

# Build the app
RUN npm run build

# Use a minimal image for the final container
FROM node:20-alpine AS runner

# Set working directory
WORKDIR /app

# Copy only the necessary files for preview
COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist

# Install only production dependencies
RUN npm install --omit=dev

# Install Vite CLI for preview
RUN npm install -g vite

# Expose Vite preview port
EXPOSE 4173

# Run the preview server
CMD ["vite", "preview", "--host"]
