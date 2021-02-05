FROM graphfoundation/ongdb:3.4.7

RUN apk update && apk add python3 gcc python3-dev musl-dev libffi-dev libffi openssl openssl-dev

WORKDIR /usr/src/app
COPY REQUIREMENTS.TXT ./
RUN pip3 install --no-cache-dir -r REQUIREMENTS.TXT

COPY . .
RUN chmod +x ./backup.py
ENTRYPOINT ["/sbin/tini", "-g", "--"]
CMD [ "./backup.py", "backup" ]
