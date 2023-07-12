FROM node:19-alpine AS devBuilder
MAINTAINER Chase Ehlert <chaseehlert123@gmail.com>
WORKDIR /app
COPY ./package*.json ./
RUN npm install && npm cache clean --force
COPY . .
RUN npm run tsc

FROM node:19-alpine AS prodBuilder
WORKDIR /app
COPY ./package*.json ./
RUN npm install --omit=dev && npm cache clean --force

FROM node:19-alpine AS production
WORKDIR /app
COPY ./package*.json ./
COPY --from=devBuilder /app/dist/ ./dist
COPY --from=prodBuilder /app/node_modules ./node_modules
EXPOSE 3001
CMD ["npm", "start"]
