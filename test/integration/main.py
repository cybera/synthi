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

    for i in [1,2]:
        dataset.transformation(
            f'simple-data-means-{i}',
            template = 'ReusableMeans',
            inputs = {
                'simple_data': f'simple-data-{i}'
            }
        )

    df = dataset.get(f'simple-data-means-1')
    assert(df['0'].tolist() == [6.0])

    df = dataset.get('simple-data-means-2')
    assert(df['0'].tolist() == [9.0])

def test_permissions():
    print("Testing upload with simple_data dataset...")

    dataset.upload('simple_data', 'data/simple_data.csv')
    print(dataset.list())
    simple_data = dataset.get('simple_data')
    print(simple_data.head())

    print("Testing computed dataset operations...")
    dataset.transformation('simple_means', 'data/simple_means.py')
    simple_means = dataset.get('simple_means')
    simple_means.head()
    print(simple_means.head())

    print("Testing regular csv upload, using a type...")
    dataset.upload('simple_data_with_type', 'data/simple_data.csv', type='csv')
    simple_data_with_type = dataset.get('simple_data')
    print(simple_data_with_type.head())

    print("Testing document upload, using a type...")
    dataset.upload('txt_document', 'data/test.txt', type='document')
    txt_document = dataset.get('txt_document', raw=True)
    print(txt_document)

    print("Testing creation of a reusable transformation...")
    dataset.upload('simple_data-testing-1', 'data/simple_data.csv')
    dataset.upload('simple_data-testing-2', 'data/simple_data.csv')
    dataset.reusable_transformation('SimpleMeans', 'data/simple_means.py', inputs=['simple_data'])
    dataset.transformation(
        'simple_data-testing-means-1',
        template = 'SimpleMeans',
        inputs = {
            'simple_data': 'simple_data-testing-1'
        }
    )
    df = dataset.get('simple_data-testing-means-1')
    print(df.head())

    dataset.transformation(
        'simple_data-testing-means-2',
        template = 'SimpleMeans',
        inputs = {
            'simple_data': 'simple_data-testing-2'
        }
    )
    df = dataset.get('simple_data-testing-means-2')
    print(df.head())

    # Testing permissions. We have user 'test2' with 'test-token2' that is
    # a member of shared-test-org along with the 'test' user. This allows
    # testing various permissions scenarios on what we expect them to be
    # able to do in shared organizations and not be able to do with ones
    # they don't belong to.
    print("Permissions tests...")

    test_org = dataset.default_org()
    dataset.set_default_org('shared-test-org')
    shared_org = dataset.default_org()
    print("User can upload to shared organization")
    dataset.upload('simple_data-shared', 'data/simple_data.csv')
    print(dataset.list())
    df = dataset.get('simple_data-shared')
    print(df.head())

    print("Switching to 2nd user...")
    os.environ['ADI_API_KEY'] = 'test-token2'
    print("Second member of organization can access dataset uploaded from the first")
    df = dataset.get('simple_data-shared')
    print(df.head())

    # TODO: The API should be better at checking the graphql reasons for not returning
    #       results. Errors could happen for other reasons.
    print("Second member can't access datasets from organizations they are not a member of")
    try:
        # Note that this is failing right now for different reasons than what we want.
        # There's actually no general support, outside of the actual transformations
        # for retrieving a dataset based on the org prefix. This could be done completely
        # in the python API, which is being turned into its own repo elsewhere.
        df = dataset.get('test:simple_data')
        print(df)
    except Exception as e:
        print("Got expected exception using org prefix")
        print(f"* {e}")

    # hack to try operating under an org we really don't have access to
    dataset.__default_org = test_org

    try:
        df = dataset.get('simple_data')
        print(df)
    except Exception as e:
        print("Got expected exception setting default to non-member org")
        print(f"* {e}")

    os.environ['ADI_API_KEY'] = 'test-token'
    dataset.set_default_org('shared-test-org')
    print("User can define a reusable transformation in a shared organization")
    result = dataset.reusable_transformation('SharedSimpleMeans', 'data/simple_means.py', inputs=['simple_data'])
    print(f"Result expected ('SharedSimpleMeans'): {result['name']}")
    print("User can apply a reusable transformation in a shared organization")
    dataset.transformation(
        'simple_data-means-shared-1',
        template = 'SimpleMeans',
        inputs = {
            'simple_data': 'simple_data-shared'
        }
    )

    os.environ['ADI_API_KEY'] = 'test-token2'
    print("User can apply a reusable transformation created by another in a shared organization")
    dataset.transformation(
        'simple_data-means-shared-2',
        template = 'SimpleMeans',
        inputs = {
            'simple_data': 'simple_data-shared'
        }
    )
    print("User can access a computed dataset defined by another in the same organization")
    df = dataset.get("simple_data-means-shared-1")
    print(df.head())

    print("User can't define reusable transformations on organizations they don't belong to")
    dataset.__default_org = test_org
    result = dataset.reusable_transformation('SharedSimpleMeans2', 'data/simple_means.py', inputs=['simple_data'])
    # TODO: Okay, this is getting silly. First order of business after getting the API code into a
    # better state will be to deal with errors appropriately. They're getting generated correctly
    # and consistently by the GraphQL endpoint, but the Python API isn't really dealing with them
    # directly. In this case, because we're not trying to do anything with the result, we don't
    # trip any exceptions. We just actually get None back from the call.
    print(f"Result expected (None): {result}")

    print("Can't read other data from a dataset user doesn't have access to")
    os.environ['ADI_API_KEY'] = 'test-token'
    dataset.set_default_org('test')
    simple_data_meta = dataset.meta('simple_data')
    if simple_data_meta:
        print("* User with access can see metadata")
    simple_data_meta2 = dataset.meta(simple_data_meta['uuid'])
    if simple_data_meta == simple_data_meta2:
        print("* User with access can access metadata via dataset uuid")

    os.environ['ADI_API_KEY'] = 'test-token2'
    dataset.set_default_org('test2')
    simple_data_meta3 = dataset.meta(simple_data_meta['uuid'])
    if not simple_data_meta3:
        print("* User without access can't access metadata via dataset uuid")

    print("Clearing test environment for shared-test-org...")

    dataset.set_default_org('shared-test-org')

    for d in dataset.list():
        dataset.delete(d['uuid'])

    print("Clearing test environment for test...")
    os.environ['ADI_API_KEY'] = 'test-token'
    dataset.set_default_org('test')

    for d in dataset.list():
        dataset.delete(d['uuid'])
