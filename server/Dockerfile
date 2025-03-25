FROM node:20-alpine AS base

COPY package*.json ./

RUN npm ci

EXPOSE 3004

CMD ["sh", "-c", "npm start"]
