                                        # Use a lightweight Node.js base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available) to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the application code to the container
COPY . .

# Expose the application's port (matches the port used in server.js)
EXPOSE 8080

# Define the command to run your application
CMD ["node", "server.js"]
