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
    assert(txt_document.strip() == "Just a regular ol' text document.")

def test_reusable_csv_transform():
    client.dataset.upload('simple-data-1', 'data/simple_data.csv')
    client.dataset.upload('simple-data-2', 'data/simple_data2.csv')
    client.transformation.define('ReusableMeans', 'data/simple_means.py', inputs=['simple_data'])
    client.transformation.define('ReusableMax', 'data/simple_max.py', inputs=['simple_data'])

    for i in [1,2]:
        client.dataset.define(
            f'simple-data-transformed-{i}',
            template = 'ReusableMeans',
            inputs = {
                'df': f'simple-data-{i}'
            }
        )

    df = client.dataset.get('simple-data-transformed-1')
    assert(df['0'].tolist() == [6.0])

    df = client.dataset.get('simple-data-transformed-2')
    assert(df['0'].tolist() == [9.0])

    # Test that we can change the reusable transformation
    # on an existing dataset.
    for i in [1,2]:
        client.dataset.define(
            f'simple-data-transformed-{i}',
            template = 'ReusableMax',
            inputs = {
                'df': f'simple-data-{i}'
            }
        )

    df = client.dataset.get('simple-data-transformed-1')
    assert(df['0'].tolist() == [8.0])

    df = client.dataset.get('simple-data-transformed-2')
    assert(df['0'].tolist() == [14.0])


def test_upload_to_shared_organization():
    client_test1_shared_org.dataset.upload('simple_data-shared', 'data/simple_data.csv')

    # 1st user can access in the shared org
    names = [d['name'] for d in client_test1_shared_org.dataset.list()]
    assert('simple_data-shared' in names)

    # 2nd user can access in the shared org
    names = [d['name'] for d in client_test2_shared_org.dataset.list()]
    assert('simple_data-shared' in names)

    access_error = None

    df1 = client_test1_shared_org.dataset.get('simple_data-shared')
    df2 = client_test2_shared_org.dataset.get('simple_data-shared')

def test_incorrect_dataset_access():
    client_test1.dataset.upload('simple_data-test', 'data/simple_data.csv')

    with pytest.raises(APIError):
        client_test2_bad_org.dataset.get('simple_data-test')

def test_define_and_use_transformation_in_shared_organization():
    # Dataset needed for input
    client_test1_shared_org.dataset.upload('simple_data-shared', 'data/simple_data.csv')

    # Can define a transformation in a shared organization
    result = client_test1_shared_org.transformation.define(
        'SharedSimpleMeans',
        'data/simple_means.py',
        inputs=['df']
    )
    assert(result['name'] == 'SharedSimpleMeans')

    # Can apply a reusable transformation in a shared organization
    client_test1_shared_org.dataset.define(
        'simple_data-means-shared-1',
        template = 'SharedSimpleMeans',
        inputs = {
            'df': 'simple_data-shared'
        }
    )

    # Can apply a reusable transformation created by another user in a shared organization
    client_test2_shared_org.dataset.define(
        'simple_data-means-shared-2',
        template = 'SharedSimpleMeans',
        inputs = {
            'df': 'simple_data-shared'
        }
    )

    # Can access a computed dataset defined by another in the same organization
    client_test2_shared_org.dataset.get("simple_data-means-shared-1")

def test_incorrect_reusable_transformation_definition():
    # User can't define reusable transformations on organizations they don't belong to
    with pytest.raises(APIError):
        result = client_test2_bad_org.transformation.define(
            'SharedSimpleMeans2',
            'data/simple_means.py',
            inputs=['df']
        )

def test_incorrect_property_access_on_dataset():
    result = client_test1.dataset.upload('more_simple_data', 'data/simple_data.csv')
    uuid = result['uuid']

    # User with access can see metadata
    client_test1.dataset.meta('more_simple_data')
    client_test1.dataset.meta(uuid)

    with pytest.raises(APIError):
        client_test2.dataset.meta(uuid)

def test_transformation_publishing():
    result = client_test1.transformation.define(
        'PublishedSimpleMeans',
        'data/simple_means.py',
        inputs=['df']
    )
    uuid = result['uuid']

    # we shouldn't be able to see this transformation as client_test2 until
    # it has been published
    names = [t['name'] for t in client_test2.transformation.list()]
    assert('PublishedSimpleMeans' not in names)

    publish_query = '''
    mutation PublishTransformation($uuid: String!, $published: Boolean) {
        publishTransformation(uuid: $uuid, published: $published) {
            uuid
            name
            published
        }
    }
    '''

    client_test1.query(publish_query, dict(uuid=uuid, published=True))

    # now client_test2 should be able to see it
    names = [t['name'] for t in client_test2.transformation.list()]
    assert('PublishedSimpleMeans' in names)

    # but client_test2 shouldn't be able to unpublish it
    with pytest.raises(APIError):
        client_test2.query(publish_query, dict(uuid=uuid, published=False))

def test_create_transformation():
    name = 'Test'
    code='import foo from bar'
    description='My test transformation'
    inputs=['df']

    result = client.transformation.define(
        name=name,
        code=code,
        description=description,
        inputs=inputs
    )

    assert result['name'] == name
    assert result['description'] == description
    assert result['inputs'] == inputs
    assert result['code'] == code

def test_update_transformation():
    result = client.transformation.define(
        'SimpleMeans',
        'data/simple_means.py',
        description='My simple means transformation',
        inputs=['df']
    )
    uuid = result['uuid']

    name1 = 'SimpledMeansUpdated'
    inputs1 = ['input1', 'input2']
    code1 = 'test test test'

    result = client.transformation.update(
        uuid,
        name=name1,
        inputs=inputs1,
        code=code1
    )

    assert result['name'] == name1
    assert result['inputs'] == inputs1
    assert result['code'] == code1

    name2 = 'foo'
    inputs2 = ['bar', 'baz']
    code2 = 'this is my code'

    result = client.transformation.update(
        uuid,
        name=name2,
    )

    assert result['name'] == name2
    assert result['inputs'] == inputs1
    assert result['code'] == code1

    result = client.transformation.update(
        uuid,
        inputs=inputs2,
    )

    assert result['name'] == name2
    assert result['inputs'] == inputs2
    assert result['code'] == code1

    result = client.transformation.update(
        uuid,
        code=code2,
    )

    assert result['name'] == name2
    assert result['inputs'] == inputs2
    assert result['code'] == code2

def test_transformation_tags():
    result = client.transformation.define(
        'SimpleMeans',
        'data/simple_means.py',
        inputs=['df']
    )
    assert result['tags'] == []

    result = client.transformation.define(
        'SimpleMeans2',
        'data/simple_means.py',
        inputs=['df'],
        tags=['Integer', 'Float', 'String']
    )
    uuid = result['uuid']
    assert _tag_names(result['tags']) == ['Float', 'Integer', 'String']

    result = client.transformation.update(uuid)
    assert _tag_names(result['tags']) == ['Float', 'Integer', 'String']

    result = client.transformation.update(
        uuid,
        tags=['String']
    )
    assert _tag_names(result['tags']) == ['String']

    result = client.transformation.update(
        uuid,
        tags=[]
    )
    assert result['tags'] == []

    with pytest.raises(APIError):
        client.transformation.update(
            uuid,
            tags=['Elephant']
        )

def _tag_names(tags):
    return sorted(list(map(lambda t: t['name'], tags)))
