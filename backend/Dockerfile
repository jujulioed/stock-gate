FROM node:latest

WORKDIR /backend

COPY . .

RUN rm -rf node_modules

RUN npm install

CMD ["npm", "start"]

EXPOSE 5005