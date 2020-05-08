from adi.dev.transformation import dataset, transformation

@transformation(inputs=dict(
  df=dataset("simple_data")
))
def simple_means(df):
  return (df.mean()
            .reset_index())
