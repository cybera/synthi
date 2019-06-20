# Tika Basics

We hope to avoid having users writing transformation code needing to know how to interact with the Tika service directly. However, for our work with it, it's helpful to know the basics.

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
