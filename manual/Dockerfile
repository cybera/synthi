FROM node:10

WORKDIR /usr/src/app

RUN npm install gitbook-cli -g

COPY . ./

EXPOSE 3001
EXPOSE 3002

CMD [ "gitbook", "--port", "3001", "--lrport", "3002", "serve" ]
