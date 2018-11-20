import React from 'react'

export const CurlBlock = (props) => {
  const { dataset, apikey } = props

  const downloadCode = `curl --header "Authorization: Api-Key ${apikey}" localhost:8080/dataset/${dataset.id}`

  const columnNamesCode = `curl http://localhost:8080/graphql \\
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

  const metadataCode = `curl http://localhost:8080/graphql \\
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
      <p>
        <b>Download {dataset.name}:</b>
      </p>
      <p>
        <pre>
          {downloadCode}
        </pre>
      </p>
      <p>
        <b>Get column information for {dataset.name}:</b>
      </p>
      <p>
        <pre>
          {columnNamesCode}
        </pre>
      </p>
      <p>
        <b>Get metadata for {dataset.name}:</b>
      </p>
      <p>
        <pre>
          {metadataCode}
        </pre>
      </p>
    </div>
  )
}

export const PythonBlock = (props) => {
  const { dataset, apikey } = props

  return (
    <div>
      Python export for:

      {dataset.name}
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

req <- GET('localhost:8080/dataset/${dataset.id}', 
    add_headers(Authorization = paste("Api-Key", apiKey))
)

df <- content(req, type='text/csv')
`

  return (
    <div>
      <p>
        <b>Read {dataset.name} into a data frame:</b>
      </p>
      <p>
        <pre>
          {downloadCode}
        </pre>
      </p>
    </div>
  )
}

export const ExcelBlock = (props) => {
  const { dataset, apikey } = props

  return (
    <div>
      Excel export for:

      {dataset.name}
    </div>
  )
}
