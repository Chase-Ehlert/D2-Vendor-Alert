FROM node:19-alpine AS builder
MAINTAINER Chase Ehlert <chaseehlert123@gmail.com>
WORKDIR /app
COPY ./package*.json ./
RUN npm install && npm cache clean --force
COPY . .
RUN npm run tsc

FROM node:19-alpine AS production
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/./package*.json ./
COPY --from=builder /app/dist/ ./dist
EXPOSE 3001
CMD ["npm", "start"]
