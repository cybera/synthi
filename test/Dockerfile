FROM python:3

WORKDIR /usr/src/app

RUN pip install --no-cache-dir requests pandas pytest pytest-rerunfailures

COPY ./integration/pkg /usr/src/pkg
RUN pip install -e /usr/src/pkg/python-adi

CMD ["pytest", "--reruns 3", "--reruns-delay 1", "main.py"]