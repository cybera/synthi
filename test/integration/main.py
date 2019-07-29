import os

os.environ['ADI_API_KEY'] = 'test-token'
os.environ['ADI_API_HOST'] = 'http://server:3000'

from lib import dataset
import time

print("Testing upload with iris dataset...")

dataset.upload('iris', 'data/iris.csv')

print("Waiting a few seconds...")
time.sleep(5)

print(dataset.list())

iris = dataset.get('iris')

print(iris.head())

print("Clearing test environment...")

for d in dataset.list():
    dataset.delete(d['id'])

