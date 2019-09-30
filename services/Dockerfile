FROM continuumio/anaconda3:5.3.0 as base
RUN apt-get update && \
    apt-get install gcc -y && \
    pip install --upgrade pip && \
    pip install pika \
                openstacksdk \
                toml
ADD build/wait-for-it.sh /
WORKDIR /usr/src/app
CMD [ "/wait-for-it.sh", "-t", "60", "queue:5672", "--", "./main.py"]

FROM base as python-worker
RUN pip install neo4j-driver \
                bcrypt \
                python-magic
ADD python-worker ./
ADD common ./common

FROM base as tika-worker
RUN apt-get install default-jre tesseract-ocr -y
RUN pip install python-magic
RUN wget https://www-eu.apache.org/dist/tika/tika-app-1.22.jar -O /tika-app.jar
ADD tika-worker ./
ADD common ./common
