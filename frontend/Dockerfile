# syntax=docker/dockerfile:1

#BASE################################################
FROM node:16.14.2-alpine AS base
WORKDIR /frontend
COPY ["package.json", "package-lock.json", "./"]

#DEV#################################################
FROM base AS dev
ENV	NODE_ENV=development
RUN npm install npm@latest
RUN npm install react-scripts
RUN npm install
COPY . .
CMD ["npm", "start"]

#PROD################################################
FROM base AS prod
ENV	NODE_ENV=production
RUN npm install --frozen-lockfile --production
COPY . .
RUN npm install @nestjs/cli --global
RUN npm run build
CMD ["npm", "run", "start:prod"]