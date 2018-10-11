# Credit: https://stackoverflow.com/questions/35371043/use-python-requests-to-download-csv

# Example:
#
# Notice that there are no "dataset_input()" calls in this one. That's because it
# creates its dataset completely from a file streamed from AWS. This is a really
# simple example that shows how you could enter a "scraped" dataset into ADI. In
# this case, we're able to access the .csv format directly, so we don't really have
# to do any scraping.

import csv
import requests
import pandas as pd
from io import StringIO

def transform():
  CSV_URL = 'http://samplecsvs.s3.amazonaws.com/Sacramentorealestatetransactions.csv'

  download = requests.get(CSV_URL)

  decoded_content = download.content.decode('utf-8')
  df = pd.read_csv(StringIO(decoded_content))
  return df