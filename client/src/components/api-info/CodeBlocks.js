import React from 'react'

import Typography from '@material-ui/core/Typography'

import CodeSnippet from '../CodeSnippet'

const host = window.location.origin

export const CurlBlock = (props) => {
  const { dataset, apikey } = props

  const downloadCode = `curl -H "Authorization: Api-Key ${apikey}" ${host}/dataset/${dataset.id}`

  const columnNamesCode = `curl ${host}/graphql \\
-X POST \\
-H "Content-Type: application/json" \\
-H "Authorization: Api-Key ${apikey}" \\
--data @- << EOS
{
  "query": "{
    dataset(id: ${dataset.id}) {
      id 
      columns {
        name
        order
      }
    }
  }"
}
EOS`

  const metadataCode = `curl ${host}/graphql \\
-X POST \\
-H "Content-Type: application/json" \\
-H "Authorization: Api-Key ${apikey}" \\
--data @- << EOS
{
  "query": "{
    dataset(id: ${dataset.id}) {
      id
      name
      metadata {
        title
        contributor
        contact
      }
    }
  }"
}
EOS`

  return (
    <div>
      <Typography component="h2" variant="title" gutterBottom>
        Download {dataset.name}
      </Typography>
      <CodeSnippet language="sh" code={downloadCode} />
      <Typography component="h2" variant="title" gutterBottom>
        Get column information for {dataset.name}
      </Typography>
      <CodeSnippet language="sh" code={columnNamesCode} />
      <Typography component="h2" variant="title" gutterBottom>
        Get metadata for {dataset.name}
      </Typography>
      <CodeSnippet language="sh" code={metadataCode} />
    </div>
  )
}

export const PythonBlock = (props) => {
  const { dataset, apikey } = props

  const downloadCode = `import requests
import pandas as pd
import io

headers = { 'Authorization': 'Api-Key ${apikey}' }
response = requests.get('${host}/dataset/${dataset.id}', headers=headers)

df = pd.read_csv(io.StringIO(response.content.decode('utf-8')))
`

  return (
    <div>
      <Typography component="h2" variant="title" gutterBottom>
        Read <em>{dataset.name}</em> into a data frame
      </Typography>
      <CodeSnippet language="python" code={downloadCode} />
    </div>
  )
}

export const RBlock = (props) => {
  const { dataset, apikey } = props

  const downloadCode = `# Make sure the following packages are installed:
install.packages("httr")
install.packages("readr")

# Run the following:

library(httr)

apiKey <- '${apikey}'

req <- GET('${host}/dataset/${dataset.id}', 
    add_headers(Authorization = paste("Api-Key", apiKey))
)

df <- content(req, type='text/csv')
`

  return (
    <div>
      <Typography component="h2" variant="title" gutterBottom>
        Read {dataset.name} into a data frame
      </Typography>
      <CodeSnippet language="r" code={downloadCode} />
    </div>
  )
}

export const ExcelBlock = (props) => {
  const { dataset, apikey } = props

  return (
    <div>
      <Typography component="h2" variant="title" gutterBottom>
        Import {dataset.name} into Excel
      </Typography>
      <Typography variant="body1" gutterBottom align="left">
        <ol>
          <li>
            <a href={`${window.location.origin}/dataset/${dataset.id}`}>Click here</a>
            &nbsp;to download the&nbsp;
            {dataset.name}
            &nbsp;dataset.
          </li>
          <li>
            In Excel, click&nbsp;
            <b>File</b>
            &nbsp;and then&nbsp;
            <b>Open</b>
            , and select the downloaded copy of&nbsp;
            {dataset.name}
            .csv on your computer.
          </li>
          <li>
            Click <b>Open</b>
          </li>
        </ol>
      </Typography>
    </div>
  )
}
