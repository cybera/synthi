FROM continuumio/anaconda3

RUN apt-get update && \
    apt-get install gcc -y && \
    pip install --upgrade pip && \
    pip install pika \
                neo4j-driver \
                bcrypt \
                openstacksdk \
                toml
