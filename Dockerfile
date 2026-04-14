FROM node:18-alpine

WORKDIR /usr/src/app

RUN npm install pm2 -g

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["pm2-runtime", "ecosystem.config.js"]