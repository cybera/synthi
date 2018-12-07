import React from 'react'
import PropTypes from 'prop-types'
import { Query } from 'react-apollo'

import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'

import { compose } from '../lib/common'
import { datasetViewQuery } from '../queries'

const styles = theme => ({
  headerText: {
    marginBottom: theme.spacing.unit * 2
  }
})

const DatasetTitle = (props) => {
  const { id, classes } = props

  return (
    <Query
      query={datasetViewQuery}
      variables={{ id }}
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
  id: PropTypes.number
}

DatasetTitle.defaultProps = {
  id: null
}

export default compose(
  withStyles(styles)
)(DatasetTitle)
