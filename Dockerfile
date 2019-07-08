FROM node:8-stretch

ARG DEBIAN_FRONTEND=noninteractive

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENTRYPOINT ["npm", "start", "--silent"]