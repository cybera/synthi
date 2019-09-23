FROM python:3

WORKDIR /usr/src/app

RUN pip install --no-cache-dir requests pandas pytest

COPY ./integration/pkg /usr/src/pkg
RUN pip install -e /usr/src/pkg/python-adi

CMD ["pytest", "main.py"]