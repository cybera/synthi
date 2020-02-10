FROM graphfoundation/ongdb:3.4.7

COPY backup.sh ./backup.sh
RUN chmod +x ./backup.sh
ADD ./plugins/* /plugins/
RUN /bin/bash ./backup.sh >> /dev/stdout &
RUN chown -R neo4j:neo4j /plugins/
