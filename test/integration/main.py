import os
import time

os.environ['ADI_API_KEY'] = 'test-token'
os.environ['ADI_API_HOST'] = 'http://server:3000'

from lib import dataset

dataset.set_default_org('test')

print("Testing upload with iris dataset...")

dataset.upload('iris', 'data/iris.csv')
print(dataset.list())
iris = dataset.get('iris')
print(iris.head())

print("Testing computed dataset operations...")
dataset.transformation('iris_means', 'data/iris_means.py')
iris_means = dataset.get('iris_means')
iris_means.head()
print(iris_means.head())

print("Testing regular csv upload, using a type...")
dataset.upload('iris_with_type', 'data/iris.csv', type='csv')
iris_with_type = dataset.get('iris')
print(iris_with_type.head())

print("Testing document upload, using a type...")
dataset.upload('txt_document', 'data/test.txt', type='document')
txt_document = dataset.get('txt_document', raw=True)
print(txt_document)

print("Testing creation of a reusable transformation...")
dataset.upload('iris-testing-1', 'data/iris.csv')
dataset.upload('iris-testing-2', 'data/iris.csv')
dataset.reusable_transformation('IrisMeans', 'data/iris_means.py', inputs=['iris'])
dataset.transformation(
    'iris-testing-means-1',
    template = 'IrisMeans',
    inputs = {
        'iris': 'iris-testing-1'
    }
)
df = dataset.get('iris-testing-means-1')
print(df.head())

dataset.transformation(
    'iris-testing-means-2',
    template = 'IrisMeans',
    inputs = {
        'iris': 'iris-testing-2'
    }
)
df = dataset.get('iris-testing-means-2')
print(df.head())

print("Clearing test environment...")

for d in dataset.list():
    dataset.delete(d['uuid'])

