import json
import io
import os
import requests

import pandas as pd

# This can take a regular graphql query (with no actual file upload) or one
# that also includes a single upload. To modify in order to take multiple
# files, we'd have to review the following spec and modify as necessary:
#
# https://github.com/jaydenseric/graphql-multipart-request-spec
def gql_query(query, variables=dict(), file=None, host=None, api_key=None):
  if api_key is None:
    api_key = os.environ.get('ADI_API_KEY')
  if host is None:
    host = os.environ.get('ADI_API_HOST')
  
  headers = {
    'Authorization': f"Api-Key {api_key}"
  }

  escaped_gql = (query
           .strip()
           .replace('\n', '\\n')
           .replace('"', '\\"'))

  gql_json = dict(
    query = query.strip(),
    variables = variables
  )
  
  json_data = json.dumps(gql_json)

  data = None
  files = None
  
  # Depending on whether or not there's a file that we have to send along with the
  # regular JSON data, we can either do a fairly simple post, where we just send
  # the JSON as the data body of the post request, or a more complex one where we
  # need to follow the GraphQL multipart form specification.
  if not file:
    data = json_data
    headers['Content-Type'] = 'application/json'
  else:
    fileName = os.path.basename(file)
    # See: https://github.com/cybera/adi/blob/master/manual/src/sections/ExportingAndImporting.md
    # for the curl command this is based off of.
    files = {
      'operations': (None, json_data, 'application/json'),
      'map': (None, '{ "0": ["variables.file"] }', 'application/json'),
      '0': (fileName, open(file, 'rb'), 'application/octet-stream')
    }

  r = requests.post(f"{host}/graphql", headers=headers, data=data, files=files)

  return json.loads(r.content)['data']

__default_org = None

def default_org(host=None, api_key=None):
  global __default_org
  
  if not __default_org:
    info = gql_query('''
    query {
      currentUser {
        organizations {
          name
          id
        }
      }
    }
    ''')
    __default_org = info['currentUser']['organizations'][0]['id']
  
  return __default_org

def get(id_or_name, raw=False, host=None, api_key=None):
  if api_key is None:
    api_key = os.environ.get('ADI_API_KEY')
  if host is None:
    host = os.environ.get('ADI_API_HOST')

  id = id_or_name

  if isinstance(id_or_name, str):
    id = meta(id_or_name, host=host, api_key=api_key)['id']
  
  headers = { 'Authorization': f"Api-Key {api_key}" }
  response = requests.get(f"{host}/dataset/{id}", headers=headers)

  if raw:
    return response.content.decode('utf-8')
  else:
    return pd.read_csv(io.StringIO(response.content.decode('utf-8')))

def meta(id_or_name, host=None, api_key=None):
  orgid = default_org()

  datasetId = None
  datasetName = None
  
  if isinstance(id_or_name, str):
    datasetName = id_or_name
  else:
    datasetId = id_or_name

  query = '''
  query ($orgid: Int, $datasetId: Int, $datasetName: String) {
    dataset(org: { id: $orgid }, id: $datasetId, name: $datasetName) {
      id
      name
      uuid
    }
  }
  '''

  variables = dict(
    orgid = orgid,
    datasetId = datasetId,
    datasetName = datasetName
  )

  results = gql_query(query, variables=variables, host=host, api_key=api_key)
  
  if len(results['dataset']) > 1:
    raise ValueError("Couldn't find unique dataset for name or id")

  return results['dataset'][0]

def list(host=None, api_key=None):
  orgid = default_org()

  query = '''
  query ($orgid: Int) {
    dataset(org: { id: $orgid }) {
      id
      name
      uuid
    }
  }
  '''
  
  variables = dict(
    orgid = orgid
  )
  
  results = gql_query(query, variables=variables, host=host, api_key=api_key)
  
  return results['dataset']

def create(name, host=None, api_key=None):
  orgid = default_org()

  query = '''
  mutation ($ownerId: Int!, $datasetName: String!) {
    createDataset(name: $datasetName, owner: $ownerId) {
      name
      id
      uuid
    }
  }
  '''
  
  variables = dict(
    ownerId = orgid,
    datasetName = name
  )
  
  result = gql_query(query, variables=variables, host=host, api_key=api_key)
  
  return result['createDataset']

def upload(id_or_name, file, host=None, api_key=None):
  info = meta(id_or_name, host=host, api_key=api_key)

  if not info:
    info = create(id_or_name, host=host, api_key=api_key)
  
  if isinstance(id_or_name, str):
    id = info['id']
  else:
    id = id_or_name
  
  query = '''
  mutation UploadDataset($id: Int!, $file: Upload!) {
    updateDataset(id: $id, file: $file) {
      id
      name
    }
  }
  '''
  
  variables = dict(
    id = id,
    file = 'null'
  )

  result = gql_query(query, variables=variables, file=file, host=host, api_key=api_key)
  
  return result['updateDataset']

def transformation(id_or_name, path=None, code=None, host=None, api_key=None):
  if not path and not code:
    raise ValueError("Need to either give a path to a transformation code file or the code itself")
  
  if path and code:
    raise ValueError("Give either a path to a transformation code file or code, not both")
    
  if isinstance(id_or_name, str):
    info = meta(id_or_name, host=host, api_key=api_key)
    if not info and isinstance(id_or_name, str):
      info = create(id_or_name, host=host, api_key=api_key)
    elif not isinstance(id_or_name, str):
      raise ValueError("Can't create a new dataset with a numerical id")
    id = info['id']
  else:
    id = id_or_name

  if path and os.path.exists(path):
    with open(path, 'r') as file:
      code = file.read()
  
  # TODO: We should probably just automatically set the computed flag if
  # the dataset has a transformation saved to it (or consider it computed)
  # if it simply has a transformation associated. However, to avoid making
  # too many hasty code changes, we'll do another GraphQL call here to make
  # it happen:
  
  computedQuery = '''
  mutation UpdateDataset($id: Int!, $computed: Boolean) {
    updateDataset(id: $id, computed: $computed) {
      id
      name
    }
  }
  '''
  gql_query(computedQuery, variables={'id':id, 'computed':True}, host=host, api_key=api_key)
  
  query = '''
  mutation SaveInputTransformation($id: Int!, $code: String) {
    saveInputTransformation(id: $id, code: $code) {
      id
    }
  }
  '''

  variables = dict(
    id = id,
    code = code
  )
  
  result = gql_query(query, variables=variables, host=host, api_key=api_key)
  
  return result['saveInputTransformation']

def generate(id_or_name, host=None, api_key=None):    
  if isinstance(id_or_name, str):
    info = meta(id_or_name, host=host, api_key=api_key)
    if not info and isinstance(id_or_name, str):
      info = create(id_or_name, host=host, api_key=api_key)
    elif not isinstance(id_or_name, str):
      raise ValueError("Can't create a new dataset with a numerical id")
    id = info['id']
  else:
    id = id_or_name

  query = '''
  mutation GenerateDataset($id: Int!) {
    generateDataset(id: $id) {
      id
      name
    }
  }
  '''
  result = gql_query(query, variables={'id':id}, host=host, api_key=api_key)
  
  return result['generateDataset']

def delete(id_or_name, host=None, api_key=None):    
  if isinstance(id_or_name, str):
    info = meta(id_or_name, host=host, api_key=api_key)
    if not info:
      raise ValueError("Can't find the dataset to delete")
    id = info['id']
  else:
    id = id_or_name

  query = '''
  mutation DeleteDataset($id: Int!) {
    deleteDataset(id: $id) {
      id
      name
    }
  }
  '''
  result = gql_query(query, variables={'id':id}, host=host, api_key=api_key)
  
  return result['deleteDataset']
