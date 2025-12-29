# Stage 1: Build the React Frontend and Server
FROM node:20 AS build
WORKDIR /app

# Install root & frontend deps
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Install server deps and build server
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ ./
RUN npx tsc

# Stage 2: Final Runtime Image
FROM node:20-slim
WORKDIR /app

# Copy built frontend (dist) and server (dist/server)
COPY --from=build /app/dist ./dist
COPY --from=build /app/server/dist ./server
COPY --from=build /app/server/package*.json ./server/

# Install ONLY production dependencies for the server
WORKDIR /app/server
RUN npm install --production

# Final Environment Setup
ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

# Start compiled JS server
CMD ["node", "index.js"]
