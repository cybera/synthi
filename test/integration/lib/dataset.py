import json
import io
import os
import requests
import mimetypes

from typing import Dict

import pandas as pd

def set_default_org(name=None, uuid=None, id=None):
  assert name or uuid or id, "Must supply one of name, uuid, or id"

  if uuid:
    org_key = 'uuid'
    org_val = uuid
  elif name:
    org_key = 'name'
    org_val = name
  elif id:
    org_key = 'id'
    org_val = id

  info = gql_query('''
    query {
      currentUser {
        organizations {
          name
          id
          uuid
        }
      }
    }
  ''')

  organizations = info['currentUser']['organizations']

  matching_orgs = [org for org in organizations if org[org_key] == org_val]

  if len(matching_orgs) != 1:
    raise Exception(f"should match exactly one organization (matches: {len(matching_orgs)})")
  
  __default_org = matching_orgs[0]


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
    mimetype, encoding = mimetypes.guess_type(file)
    # See: https://github.com/cybera/adi/blob/master/manual/src/sections/ExportingAndImporting.md
    # for the curl command this is based off of.
    files = {
      'operations': (None, json_data, 'application/json'),
      'map': (None, '{ "0": ["variables.file"] }', 'application/json'),
      '0': (fileName, open(file, 'rb'), mimetype)
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
          uuid
        }
      }
    }
    ''')
    __default_org = info['currentUser']['organizations'][0]
  
  return __default_org

def get(id_or_name, raw=False, as_text=True, host=None, api_key=None):
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
    if as_text:
      return response.content.decode('utf-8')
    else:
      return response.content
  else:
    return pd.read_csv(io.StringIO(response.content.decode('utf-8')))

def meta(id_or_name, host=None, api_key=None):
  org = default_org()

  datasetId = None
  datasetName = None
  
  if isinstance(id_or_name, str):
    datasetName = id_or_name
  else:
    datasetId = id_or_name

  query = '''
  query ($org: OrganizationID, $datasetId: Int, $datasetName: String) {
    dataset(org: $org, id: $datasetId, name: $datasetName) {
      id
      name
      uuid
    }
  }
  '''

  variables = dict(
    org = org,
    datasetId = datasetId,
    datasetName = datasetName
  )

  results = gql_query(query, variables=variables, host=host, api_key=api_key)
  
  if len(results['dataset']) > 1:
    raise ValueError("Couldn't find unique dataset for name or id")

  return results['dataset'][0]

def list(host=None, api_key=None):
  org = default_org()

  query = '''
  query ($org: OrganizationID) {
    dataset(org: $org) {
      id
      name
      uuid
    }
  }
  '''
  
  variables = dict(
    org = org
  )
  
  results = gql_query(query, variables=variables, host=host, api_key=api_key)
  
  return results['dataset']

def create(name, host=None, api_key=None, type=None):
  orgid = default_org()['id']

  query = '''
  mutation ($ownerId: Int!, $datasetName: String!, $type: DatasetType) {
    createDataset(name: $datasetName, owner: $ownerId, type: $type) {
      name
      id
      uuid
      type
    }
  }
  '''
  
  variables = dict(
    ownerId = orgid,
    datasetName = name,
    type = type
  )
    
  if type:
    variables['type'] = type
  
  result = gql_query(query, variables=variables, host=host, api_key=api_key)
  
  return result['createDataset']

def upload(id_or_name, file, type=None, host=None, api_key=None):
  info = meta(id_or_name, host=host, api_key=api_key)

  if not info:
    info = create(id_or_name, host=host, api_key=api_key, type=type)
  
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

def ensure_dataset(id_or_name, type='csv', host=None, api_key=None):
  if isinstance(id_or_name, str):
    info = meta(id_or_name, host=host, api_key=api_key)
    if not info and isinstance(id_or_name, str):
      info = create(id_or_name, type=type, host=host, api_key=api_key)
    elif not isinstance(id_or_name, str):
      raise ValueError("Can't create a new dataset with a numerical id")
    id = info['id']
  else:
    id = id_or_name

  return id

def read_code(path:str):
  if path and os.path.exists(path):
    with open(path, 'r') as file:
      code = file.read()
  return code

def transformation_basic(id_or_name, path=None, code=None, type='csv', host=None, api_key=None):
  if not path and not code:
    raise ValueError("Need to either give a path to a transformation code file or the code itself")
  
  if path and code:
    raise ValueError("Give either a path to a transformation code file or code, not both")
    
  id = ensure_dataset(id_or_name, type=type, host=host, api_key=api_key)
  code = read_code(path)
    
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

def transformation_ref(id_or_name, template:str, inputs:Dict[str,str], type='csv', host=None, api_key=None):
  query = '''
    mutation TemplateTransformation($output: Int!, $template: TemplateRef, $inputs: [TransformationInputMapping], $org: OrganizationID) {
      saveInputTransformation(
        id: $output,
        template: $template,
        inputs: $inputs,
        org: $org
      ) {
        id
        uuid
        name
      }
    }
  '''

  org = default_org()

  variables = dict(
    output   = ensure_dataset(id_or_name, type=type, host=host, api_key=api_key),
    template = dict(name=template),
    inputs   = [dict(alias=k, dataset=dict(name=v)) for k,v in inputs.items()],
    org      = org,
  )

  result = gql_query(query, variables=variables, host=host, api_key=api_key)

  return result['saveInputTransformation']

def transformation(id_or_name, path=None, code=None, template:str = None, inputs:Dict[str,str] = {}, type='csv', host=None, api_key=None):
  if (path or code) and not (template or inputs):
    return transformation_basic(id_or_name, path, code, type=type, host=host, api_key=api_key)
  elif (template and inputs):
    return transformation_ref(id_or_name, template, inputs, type=type, host=host, api_key=api_key)

  raise Exception("Must provide code, a path, or a transformation template name and inputs")

def reusable_transformation(name, path=None, code=None, inputs=[], host=None, api_key=None):
  if not path and not code:
    raise ValueError("Need to either give a path to a transformation code file or the code itself")
  
  if path and code:
    raise ValueError("Give either a path to a transformation code file or code, not both")

  org = default_org()

  if path and os.path.exists(path):
    with open(path, 'r') as file:
      code = file.read()

  query = '''
    mutation CreateTransformationTemplate($name: String!, $inputs: [String], $code: String!, $owner: OrganizationID!) {
      createTransformationTemplate(
        name: $name,
        inputs: $inputs,
        code: $code,
        owner: $owner
      ) {
        id
        uuid
        name
      }
    }
  '''
  
  variables = {'name':name, 'inputs': inputs, 'code': code, 'owner': org}
  result = gql_query(query, variables=variables, host=host, api_key=api_key)
  
  return result['createTransformationTemplate']
  
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
    deleteDataset(id: $id)
  }
  '''
  result = gql_query(query, variables={'id':id}, host=host, api_key=api_key)
  
  return result['deleteDataset']
