import os
import time

# There are a few asynchronous things going on between calls, so we end
# up having to wait at least a short period of time after uploading or
# creating a transformation for the resources to actually get on swift.
WAIT_SECONDS = 2

os.environ['ADI_API_KEY'] = 'test-token'
os.environ['ADI_API_HOST'] = 'http://server:3000'

from lib import dataset

print("Testing upload with iris dataset...")

dataset.upload('iris', 'data/iris.csv')
time.sleep(WAIT_SECONDS) # Need to wait just a bit
print(dataset.list())
iris = dataset.get('iris')
print(iris.head())

print("Testing computed dataset operations...")
dataset.transformation('iris_means', 'data/iris_means.py')
time.sleep(WAIT_SECONDS) # Need to wait just a bit
iris_means = dataset.get('iris_means')
iris_means.head()
print(iris_means.head())

print("Clearing test environment...")

for d in dataset.list():
    dataset.delete(d['id'])

