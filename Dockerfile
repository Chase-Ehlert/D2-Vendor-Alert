FROM node:19-alpine AS builder
MAINTAINER Chase Ehlert <chaseehlert123@gmail.com>
WORKDIR /app
COPY ./package*.json ./
RUN npm install --omit=dev && npm cache clean --force
COPY . .
RUN npm run tsc

FROM node:19-alpine AS production
WORKDIR /app
COPY ./.env ./.env
COPY ./node_modules ./node_modules
COPY ./package*.json ./
COPY --from=builder /app/dist/ ./dist
EXPOSE 3001
CMD ["npm", "start"]
