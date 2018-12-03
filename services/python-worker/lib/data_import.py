def convert_type(pd_type):
  if pd_type == 'object':
    return 'String'
  elif pd_type == 'int64':
    return 'Integer'
  elif pd_type == 'float64':
    return 'Float'
  elif pd_type == 'bool':
    return 'Boolean'
  else:
    # String is a good default if nothing more specific can be found
    return 'String'


def column_info(df):
  column_types = df.dtypes
  columns = [dict(name=name,
                  originalName=name,
                  tags=[convert_type(column_types[name])],
                  order=i+1) for i, name in enumerate(df.columns)]
  return columns

def csv_params(params):
  pandas_params = dict()

  delimiters = dict(
    comma = ',',
    tab = '\t',
    semicolon = ';',
    other = (params['customDelimiter'] if ('customDelimiter' in params) else None)
  )

  if 'header' in params:
    pandas_params['header'] = 'infer' if params['header'] else None

  if 'delimiter' in params:
    pandas_params['sep'] = delimiters[params['delimiter']]

  return pandas_params

def extract_keys(orig_dict, keys):
  keys = set(keys)
  return { k: orig_dict[k] for k in orig_dict.keys() & keys }

def ensure_column_names(df):
  if df.columns.dtype != 'object':
    df.columns = [f"Column_{int(i)+1}" for i in df.columns]