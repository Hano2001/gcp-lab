FROM node:22

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the app source code to the working directory
COPY . .

# Build the TypeScript app
RUN npm run build

# Expose the port that the app will listen on
EXPOSE 3000

# Start the app
CMD ["npm", "start"]