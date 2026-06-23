# Use Node.js 20 Alpine as the base image for a smaller footprint
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files first to leverage Docker layer caching
COPY package*.json ./

# Install all dependencies (including Prisma)
RUN npm install

# Copy the Prisma directory
COPY prisma ./prisma/

# Generate the Prisma Client
RUN npx prisma generate

# Copy the rest of your application code
COPY . .

# Set the environment variable to production
ENV NODE_ENV=production

# Railway dynamically sets the PORT environment variable.
# Start the application
CMD ["npm", "start"]
