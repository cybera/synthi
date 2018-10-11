# Credit: https://stackoverflow.com/questions/35371043/use-python-requests-to-download-csv

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