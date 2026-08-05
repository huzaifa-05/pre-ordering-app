# Use official Node.js lightweight LTS image
FROM 395063533284.dkr.ecr.us-west-2.amazonaws.com/node-base:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package files first to leverage Docker layer caching
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy the rest of the backend source code
COPY . .

# Expose the port your Express app runs on (change if different from 5000)
EXPOSE 5000

# Start the Node.js server
CMD ["node", "server.js"]