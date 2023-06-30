FROM node:19-alpine

MAINTAINER Chase Ehlert <chaseehlert123@gmail.com>

WORKDIR /app


COPY ./package*.json ./

RUN npm install --only=production && npm cache clean --force && npm install -g typescript && npm install -g ts-node

COPY . .

RUN tsc

EXPOSE 3001

CMD ["npm", "start"]
