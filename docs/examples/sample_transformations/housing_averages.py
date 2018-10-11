# Example:
#
# Going further from our fully computed dataset example, this can attach to the
# output of "import_realestate.py" (we're assuming you called that "housing")
# and compute average housing prices per city.

housing = dataset_input("housing")

def transform():
  return (housing.filter(items=['city', 'price'])
                 .groupby(['city'])
                 .mean()
                 .reset_index())