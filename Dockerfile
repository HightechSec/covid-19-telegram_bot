FROM node:13
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
run npm start
EXPOSE 8081
