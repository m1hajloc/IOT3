# Dockerfile
FROM node:14

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY filter_service.js ./

CMD ["node", "filter_service.js"]
