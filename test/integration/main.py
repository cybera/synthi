import os
import time
import pytest

os.environ['ADI_API_HOST'] = 'http://server:3000'

from adi import Connection, APIError

# Basic test user connection
client = Connection(api_key='test-token')
client.organization.set_default('test')

# Test user connections for permissions
client_test1 = Connection(api_key='test-token')
client_test1.organization.set_default('test')
client_test2 = Connection(api_key='test-token2')
client_test2.organization.set_default('test2')
client_test2_bad_org = Connection(api_key='test-token2')
client_test2_bad_org.organization._OrganizationAPI__default_org = client_test1.organization._OrganizationAPI__default_org
client_test1_shared_org = Connection(api_key='test-token')
client_test1_shared_org.organization.set_default('shared-test-org')
client_test2_shared_org = Connection(api_key='test-token2')
client_test2_shared_org.organization.set_default('shared-test-org')

@pytest.fixture(scope="function", autouse=True)
def clean_environment():
    yield # Execute the test
    for d in client.dataset.list():
        client.dataset.delete(d['uuid'])
    for d in client_test1_shared_org.dataset.list():
        client_test1_shared_org.dataset.delete(d['uuid'])
    for t in client.transformation.list():
        client.transformation.delete(t['uuid'])
    for t in client_test1_shared_org.transformation.list():
        client_test1_shared_org.transformation.delete(t['uuid'])

def test_basic_upload_and_compute():
    client.dataset.upload('simple_data', 'data/simple_data.csv')
    simple_data = client.dataset.get('simple_data')
    assert(simple_data['x'].tolist() == [4, 8])

    client.dataset.define('simple_means', 'data/simple_means.py')
    simple_means = client.dataset.get('simple_means')
    assert(simple_means['0'].tolist() == [6.0])

def test_explicit_csv_upload():
    client.dataset.upload('csv_with_type', 'data/simple_data.csv', type='csv')
    csv_with_type = client.dataset.get('csv_with_type')
    assert(csv_with_type['x'].tolist() == [4, 8])

def test_txt_upload():
    client.dataset.upload('txt_document', 'data/test.txt', type='document')
    txt_document = client.dataset.get('txt_document', raw=True)
    assert(txt_document == "Just a regular ol' text document.\n")

def test_reusable_csv_transform():
    client.dataset.upload('simple-data-1', 'data/simple_data.csv')
    client.dataset.upload('simple-data-2', 'data/simple_data2.csv')
    client.transformation.define('ReusableMeans', 'data/simple_means.py', inputs=['simple_data'])

    for i in [1,2]:
        client.dataset.define(
            f'simple-data-means-{i}',
            template = 'ReusableMeans',
            inputs = {
                'simple_data': f'simple-data-{i}'
            }
        )

    df = client.dataset.get(f'simple-data-means-1')
    assert(df['0'].tolist() == [6.0])

    df = client.dataset.get('simple-data-means-2')
    assert(df['0'].tolist() == [9.0])

def test_upload_to_shared_organization():
    client_test1_shared_org.dataset.upload('simple_data-shared', 'data/simple_data.csv')

    # 1st user can access in the shared org
    names = [d['name'] for d in client_test1_shared_org.dataset.list()]
    assert('simple_data-shared' in names)

    # 2nd user can access in the shared org
    names = [d['name'] for d in client_test2_shared_org.dataset.list()]
    assert('simple_data-shared' in names)

    access_error = None
    try:
        df1 = client_test1_shared_org.dataset.get('simple_data-shared')
        df2 = client_test2_shared_org.dataset.get('simple_data-shared')
    except ValueError as e:
        if e.args[0].startswith('Dataset not found'):
            access_error = e
        else:
            raise e
    
    assert(not access_error)

def test_incorrect_dataset_access():
    client_test1.dataset.upload('simple_data-test', 'data/simple_data.csv')
    
    api_error = None
    try:
        client_test2_bad_org.dataset.get('simple_data-test')
    except APIError as e:
        api_error = e

    assert(api_error)

def test_define_and_use_transformation_in_shared_organization():
    # Dataset needed for input
    client_test1_shared_org.dataset.upload('simple_data-shared', 'data/simple_data.csv')

    # Can define a transformation in a shared organization
    result = client_test1_shared_org.transformation.define(
        'SharedSimpleMeans',
        'data/simple_means.py', 
        inputs=['simple_data']
    )
    assert(result['name'] == 'SharedSimpleMeans')

    # Can apply a reusable transformation in a shared organization
    api_error = None
    try:
        client_test1_shared_org.dataset.define(
            'simple_data-means-shared-1',
            template = 'SharedSimpleMeans',
            inputs = {
                'simple_data': 'simple_data-shared'
            }
        )
    except APIError as e:
        api_error = e

    assert(not api_error)

    # Can apply a reusable transformation created by another user in a shared organization
    api_error = None
    try:
        client_test2_shared_org.dataset.define(
            'simple_data-means-shared-2',
            template = 'SharedSimpleMeans',
            inputs = {
                'simple_data': 'simple_data-shared'
            }
        )
    except APIError as e:
        api_error = e

    assert(not api_error)

    # Can access a computed dataset defined by another in the same organization
    api_error = None
    try:
        client_test2_shared_org.dataset.get("simple_data-means-shared-1")
    except APIError as e:
        api_error = e

    assert(not api_error)

def test_incorrect_reusable_transformation_definition():
    # User can't define reusable transformations on organizations they don't belong to
    api_error = None
    try:
        result = client_test2_bad_org.transformation.define(
            'SharedSimpleMeans2',
            'data/simple_means.py',
            inputs=['simple_data']
        )
    except APIError as e:
        api_error = e

    assert(api_error)

def test_incorrect_property_access_on_dataset():
    result = client_test1.dataset.upload('more_simple_data', 'data/simple_data.csv')
    uuid = result['uuid']

    # User with access can see metadata
    api_error = None
    try:
        client_test1.dataset.meta('more_simple_data')
        client_test1.dataset.meta(uuid)
    except APIError as e:
        api_error = e

    assert(not api_error)

    # Can't read other data from a dataset user doesn't have access to
    api_error = None
    try:
        client_test2.dataset.meta(uuid)
    except APIError as e:
        api_error = e

    assert(api_error)
