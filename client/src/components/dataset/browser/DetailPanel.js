import React, { useContext } from 'react'
import gql from 'graphql-tag'
import { useQuery } from 'react-apollo'
import * as R from 'ramda'

import { makeStyles } from '@material-ui/styles'

import NavigationContext from '../../../contexts/NavigationContext'
import DatasetFilterContext from '../../../contexts/DatasetFilterContext'
import DatasetDetail from './DatasetDetail'

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(1),
  }
}))

const GET_DATASETS = gql`
  query ListDatasets($org: OrganizationRef!, $filter: DatasetFilter) {
    listDatasets(org: $org, filter: $filter) {
      name
      uuid
      published
      ownerName
      canPublish
      type
      bytes
      metadata {
        description
        dateUpdated
        dateCreated
        format
      }
      columns {
        name
        tags {
          name
        }
      }
    }
  }
`

const DatasetList = () => {
  const navigation = useContext(NavigationContext)
  const { filter } = useContext(DatasetFilterContext)
  const classes = useStyles()

  // Our context includes functions to set the filter options that we
  // can't send to the GraphQL API.
  const notFunction = R.compose(R.not, R.is(Function))
  const options = R.pickBy(notFunction)

  const { loading, error, data } = useQuery(GET_DATASETS, {
    variables: {
      org: { uuid: navigation.currentOrg },
      filter: options(filter)
    },
    fetchPolicy: 'network-only'
  })

  if (loading) return 'Loading...'
  if (error) return `Error! ${error.message}`

  return (
    <div className={classes.root}>
      {data.listDatasets.map((dataset) => (
        <DatasetDetail dataset={dataset} key={dataset.uuid} />
      ))}
    </div>
  )
}

export default DatasetList
