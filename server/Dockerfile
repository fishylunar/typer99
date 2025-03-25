FROM node:20-alpine AS base

COPY package*.json ./

RUN npm install

EXPOSE 3004

CMD ["sh", "-c", "npm start"]
