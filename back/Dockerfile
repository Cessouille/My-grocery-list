FROM node:lts-alpine

RUN npm install -g nodemon

WORKDIR /app-backend

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]