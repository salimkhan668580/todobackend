FROM node:18-alpine

# Allow compose to set NODE_ENV at build time (defaults to production)
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

# Install dependencies based on NODE_ENV
COPY package*.json ./
RUN if [ "$NODE_ENV" = "production" ]; then \
      npm ci --only=production || npm install --production; \
    else \
      npm ci || npm install; \
    fi

# Copy app source
COPY . .

EXPOSE 3000

CMD ["npm","start"]