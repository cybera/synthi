FROM node:10

WORKDIR /usr/src/app

COPY ./src ./

RUN apt-get update && \
    apt-get install libglu1 libxcomposite-dev -y
RUN wget -nv -O- https://download.calibre-ebook.com/linux-installer.sh | sh /dev/stdin
RUN npm install gitbook-cli -g
RUN gitbook install

EXPOSE 4000
EXPOSE 35729

CMD [ "gitbook", "--port", "3001", "--lrport", "3002", "serve" ]
