FROM continuumio/anaconda3:5.3.0

RUN apt-get update && \
    apt-get install gcc -y && \
    pip install --upgrade pip && \
    pip install pika \
                neo4j-driver \
                bcrypt \
                openstacksdk \
                toml \
                spacy && \
    python -m spacy download en_core_web_sm

WORKDIR /usr/src/app

ADD build/wait-for-it.sh /
ADD . ./

CMD [ "/wait-for-it.sh", "-t", "60", "queue:5672", "--", "./main.py"]
