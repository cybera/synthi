FROM logicalspark/docker-tikaserver

RUN mkdir /etc/tika
ADD config.xml /etc/tika

ENTRYPOINT java -jar /tika-server-${TIKA_VERSION}.jar -h 0.0.0.0 --config /etc/tika/config.xml
