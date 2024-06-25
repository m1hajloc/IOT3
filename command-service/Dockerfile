# Use the official Node.js image as the base image
FROM node:14

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the ports the app runs on
EXPOSE 3000
EXPOSE 1883

# Define the command to run the app
CMD [ "node", "index.js" ]
