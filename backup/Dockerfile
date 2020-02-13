FROM python:3

WORKDIR /usr/src/app
COPY REQUIREMENTS.TXT ./
RUN pip install --no-cache-dir -r REQUIREMENTS.TXT

COPY . .
RUN chmod +x ./backup.py
CMD [ "python", "./backup.py", "backup" ]
