from synthi.dev.transformation import dataset, transformation

@transformation(inputs=dict(
  df=dataset("simple_data")
))
def simple_max(df):
  return (df.max()
            .reset_index())
