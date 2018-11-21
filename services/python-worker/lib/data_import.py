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
