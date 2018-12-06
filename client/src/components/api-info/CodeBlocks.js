import React from 'react'

import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'

import CodeSnippet from '../CodeSnippet'
import CodeSnippetCopyButton from '../CodeSnippetCopyButton'

const host = window.location.origin

export const CurlBlock = (props) => {
  const { dataset, apikey } = props

  const downloadCode = `curl -s ${host}/dataset/${dataset.id} \\
-H "Authorization: Api-Key ${apikey}" \\
>"${dataset.name}.csv"`

  const columnNamesCode = `curl -s ${host}/graphql \\
-X POST \\
-H "Content-Type: application/json" \\
-H "Authorization: Api-Key ${apikey}" \\
--data @- << EOS >"${dataset.name}.columns.json"
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

  const metadataCode = `curl -s ${host}/graphql \\
-X POST \\
-H "Content-Type: application/json" \\
-H "Authorization: Api-Key ${apikey}" \\
--data @- << EOS >"${dataset.name}.metadata.json"
{
  "query": "{
    dataset(id: ${dataset.id}) {
      id
      name
      metadata {
        title
        contributor
        contact
        dateAdded
        dateCreated
        dateUpdated
        updates
        updateFrequencyAmount
        updateFrequencyUnit
        format
        description
        source
        identifier
        theme
      }
    }
  }"
}
EOS`

  return (
    <div>
      <Typography component="h2" variant="h6" gutterBottom>
        Download {dataset.name}
        <CodeSnippetCopyButton code={downloadCode} />
      </Typography>
      <CodeSnippet language="sh" code={downloadCode} />
      <Typography component="h2" variant="h6" gutterBottom>
        Get column information for {dataset.name}
        <CodeSnippetCopyButton code={columnNamesCode} />
      </Typography>
      <CodeSnippet language="sh" code={columnNamesCode} />
      <Typography component="h2" variant="h6" gutterBottom>
        Get metadata for {dataset.name}
        <CodeSnippetCopyButton code={metadataCode} />
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

df = pd.read_csv(io.StringIO(response.content.decode('utf-8')))`

  return (
    <div>
      <Typography component="h2" variant="h6" gutterBottom>
        Read <em>{dataset.name}</em> into a data frame
        <CodeSnippetCopyButton code={downloadCode} />
      </Typography>
      <CodeSnippet language="python" code={downloadCode} />
    </div>
  )
}

export const RBlock = (props) => {
  const { dataset, apikey } = props

  const dependencyCode = `install.packages("httr")
install.packages("readr")`

  const downloadCode = `library(httr)

apiKey <- '${apikey}'

req <- GET('${host}/dataset/${dataset.id}', 
    add_headers(Authorization = paste("Api-Key", apiKey))
)

df <- content(req, type='text/csv')`

  return (
    <div>
      <Typography component="h2" variant="h6" gutterBottom>
        Install required packages
        <CodeSnippetCopyButton code={dependencyCode} />
      </Typography>
      <CodeSnippet language="r" code={dependencyCode} />

      <Typography component="h2" variant="h6" gutterBottom>
        Read {dataset.name} into a data frame
        <CodeSnippetCopyButton code={downloadCode} />
      </Typography>
      <CodeSnippet language="r" code={downloadCode} />
    </div>
  )
}

export const ExcelBlock = (props) => {
  const { dataset } = props

  return (
    <div>
      <Typography component="h2" variant="h6" gutterBottom>
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

export const SASSBlock = (props) => {
  const { dataset } = props

  return (
    <div>
      <Typography component="h2" variant="h6" gutterBottom>
        Import {dataset.name} into SASS
      </Typography>
      <Typography variant="body1" gutterBottom align="left">
        Placeholder for SASS instructions
      </Typography>
    </div>
  )
}

export const SPSSBlock = (props) => {
  const { dataset } = props

  return (
    <div>
      <Typography component="h2" variant="h6" gutterBottom>
        Import {dataset.name} into SPSS
      </Typography>
      <Typography variant="body1" gutterBottom align="left">
        Placeholder for SPSS instructions
      </Typography>
    </div>
  )
}

export const MatlabBlock = (props) => {
  const { dataset } = props

  return (
    <div>
      <Typography component="h2" variant="h6" gutterBottom>
        Import {dataset.name} into Matlab
      </Typography>
      <Typography variant="body1" gutterBottom align="left">
        Placeholder for Matlab instructions
      </Typography>
    </div>
  )
}

export const TableauBlock = (props) => {
  const { dataset } = props

  return (
    <div>
      <Typography component="h2" variant="h6" gutterBottom>
        Import {dataset.name} into Tableau
      </Typography>
      <Typography variant="body1" gutterBottom align="left">
        Placeholder for Tableau instructions
      </Typography>
    </div>
  )
}
