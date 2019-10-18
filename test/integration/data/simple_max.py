simple_data = dataset_input("simple_data")

def transform():
  return (simple_data
          .max()
          .reset_index())