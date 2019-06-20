# Tika Basics

We hope to avoid having users writing transformation code needing to know how to interact with the Tika service directly. However, for our work with it, it's helpful to know the basics.

## Starting Tika via docker-compose

We can start Tika up via:

```bash
docker-compose up -d tika
```

or by just starting everything (`docker-compose up -d`). In any of the other Docker containers from the project, Tika will be accessible at `http://tika:9998`. On the host machine, it will be accessible at `http://localhost:9998`.

## Converting documents

Assuming you have Tika running in a Docker container so that it's accessible via port 9998 (the default) on 'localhost', here's the `curl` command you can run.

```bash
curl -T some-document.pdf http://localhost:9998/tika
```

This will print out the text in the document as direct output from `curl`.

A more advanced programming language would read the body of the request object returned. Here's how it would work in Python:

```python
import requests

response = requests.put('http://localhost:9998/tika', data=open('some-document.pdf', 'rb'))
raw_text = response.content.decode('utf-8')
print(raw_text)
```

## Other document formats

Tika supports many document formats. You can read more about those [here](https://tika.apache.org/1.21/formats.html).
