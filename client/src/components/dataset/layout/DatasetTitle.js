import React from 'react'
import PropTypes from 'prop-types'
import { Query } from 'react-apollo'

import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'

import { compose } from '../../../lib/common'
import { datasetViewQuery } from '../../../queries'

const styles = theme => ({
  headerText: {
    marginBottom: theme.spacing(2)
  }
})

const DatasetTitle = (props) => {
  const { uuid, classes } = props

  return (
    <Query
      query={datasetViewQuery}
      variables={{ uuid }}
      fetchPolicy="cache-and-network"
      partialRefetch
    >
      {
        ({ data }) => {
          const { dataset } = data

          return (
            <Typography variant="h4" component="h2" className={classes.headerText}>
              {dataset && dataset[0].name}
            </Typography>
          )
        }
      }
    </Query>
  )
}

DatasetTitle.propTypes = {
  classes: PropTypes.objectOf(PropTypes.any).isRequired,
  uuid: PropTypes.string
}

DatasetTitle.defaultProps = {
  uuid: null
}

export default compose(
  withStyles(styles)
)(DatasetTitle)