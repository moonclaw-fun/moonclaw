# Use a lightweight Node.js image for the build stage
FROM node:20-alpine3.19 AS builder

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy only package.json and yarn.lock to install dependencies first (for better cache)
COPY package.json yarn.lock ./

# Install dependencies using Yarn (only production dependencies)
RUN yarn install --frozen-lockfile --production=false


# Copy the rest of the application code and build the NestJS application
COPY . .
RUN yarn build

# Use a smaller base image for the final stage
FROM node:20-alpine3.19 AS runner

# Set NODE_ENV to production for runtime optimizations
ENV NODE_ENV=production

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy only the required files
COPY --from=builder /usr/src/app/ ./

# Expose the port
EXPOSE 5050

# Command to run only echo 1
CMD ["yarn", "start"]
