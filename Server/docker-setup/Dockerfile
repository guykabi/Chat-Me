FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the project files
COPY . .

# Expose the port
EXPOSE 8000

# Start the application
CMD ["npm", "start"]

