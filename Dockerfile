FROM node:13

WORKDIR /app
COPY package.json /app

RUN npm install
COPY . /app

COPY main.sh /main.sh 
EXPOSE 3000

CMD [ "./main.sh" ]
