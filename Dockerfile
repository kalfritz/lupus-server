# Use the node:18-alpine image
FROM node:18-alpine

# Install build dependencies (Python, make, g++) and yarn
RUN apk add --no-cache python3 make g++ libc-dev yarn && \
    rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Copy package.json and yarn.lock first to leverage caching
COPY package.json yarn.lock ./

# Install dependencies (devDependencies included)
RUN yarn install --frozen-lockfile

# Copy the rest of the application code (including the src folder)
COPY . .

# Build the application
RUN yarn build

RUN yarn sequelize db:migrate

# Expose port 3333
EXPOSE 3333

# Start the application
CMD ["yarn", "start"]