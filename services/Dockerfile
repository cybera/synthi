FROM continuumio/anaconda3:5.3.0 as base
RUN apt-get update && \
    apt-get install gcc -y && \
    pip install --upgrade pip && \
    pip install pika \
                openstacksdk \
                toml
WORKDIR /usr/src/app
CMD ["/usr/src/app/main.py"]

FROM base as python-worker
RUN pip install neo4j-driver \
                bcrypt \
                python-magic
ADD python-worker ./
ADD common ./common

FROM base as tika-worker
RUN apt-get update && apt-get install default-jre tesseract-ocr -y
RUN pip install python-magic
<<<<<<< HEAD
<<<<<<< HEAD
RUN wget http://archive.apache.org/dist/tika/tika-app-1.22.jar -O /tika-app.jar
=======
RUN wget https://www-eu.apache.org/dist/tika/tika-app-1.23.jar -O /tika-app.jar
>>>>>>> a4ba766... update path to get jar file
=======
RUN wget https://archive.apache.org/dist/tika/tika-app-1.23.jar -O /tika-app.jar
>>>>>>> b729bae... Worker: Use apache archive url to download tika
ADD tika-worker ./
ADD common ./common
