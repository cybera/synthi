import os
import time
import pytest

os.environ['ADI_API_KEY'] = 'test-token'
os.environ['ADI_API_HOST'] = 'http://server:3000'

from lib import dataset

dataset.set_default_org('test')

@pytest.fixture(scope="function", autouse=True)
def clean_environment():
    yield # Execute the test
    for d in dataset.list():
        dataset.delete(d['uuid'])

def test_basic_upload_and_compute():
    dataset.upload('simple_data', 'data/simple_data.csv')
    simple_data = dataset.get('simple_data')
    assert(simple_data['x'].tolist() == [4, 8])

    dataset.transformation('simple_means', 'data/simple_means.py')
    simple_means = dataset.get('simple_means')
    assert(simple_means['0'].tolist() == [6.0])

def test_explicit_csv_upload():
    dataset.upload('csv_with_type', 'data/simple_data.csv', type='csv')
    csv_with_type = dataset.get('csv_with_type')
    assert(csv_with_type['x'].tolist() == [4, 8])

def test_txt_upload():
    dataset.upload('txt_document', 'data/test.txt', type='document')
    txt_document = dataset.get('txt_document', raw=True)
    assert(txt_document == "Just a regular ol' text document.\n")

def test_reusable_csv_transform():
    dataset.upload('simple-data-1', 'data/simple_data.csv')
    dataset.upload('simple-data-2', 'data/simple_data2.csv')
    dataset.reusable_transformation('ReusableMeans', 'data/simple_means.py', inputs=['simple_data'])

    dataset.transformation(
        'simple-data-means-1',
        template = 'ReusableMeans',
        inputs = {
            'simple_data': 'simple-data-1'
        }
    )
    df = dataset.get('simple-data-means-1')
    assert(df['0'].tolist() == [6.0])

    dataset.transformation(
        'simple-data-means-2',
        template = 'ReusableMeans',
        inputs = {
            'simple_data': 'simple-data-2'
        }
    )
    df = dataset.get('simple-data-means-2')
    assert(df['0'].tolist() == [9.0])
