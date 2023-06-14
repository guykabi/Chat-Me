# Base image
FROM node:14

# Set working directory
WORKDIR /app

# Install PM2 globally
RUN npm install -g pm2

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Start the application with PM2
CMD ["pm2-runtime", "start", "index.js"]