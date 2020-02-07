FROM graphfoundation/ongdb:3.4.7

COPY backup-cron /etc/cron.d/backup-cron

RUN chmod 0644 /etc/cron.d/backup-cron

RUN crontab /etc/cron.d/backup-cron

RUN touch /var/log/cron.log
RUN /usr/sbin/crond
ADD ./plugins/* /plugins/
RUN chown -R neo4j:neo4j /plugins/
