import React from 'react'
import PropTypes from 'prop-types'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'

import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'

import { compose } from '../../lib/common'
import Panel from './Panel'
import PanelLoadingState from '../PanelLoadingState'

export const datasetQuery = gql`
query DatasetAndAPIKey ($uuid: String) {
  dataset(uuid: $uuid) {
    uuid
    name
  }
  currentUser {
    uuid
    apikey
  }
}
`

const styles = theme => ({
  root: {
    ...theme.mixins.gutters(),
    paddingTop: 16,
    paddingBottom: 16,
    marginTop: theme.spacing.unit
  }
})

const ConnectedPanel = (props) => {
  const { classes, uuid } = props

  return (
    <Query query={datasetQuery} variables={{ uuid }}>
      {
        ({ loading, error, data }) => {
          if (loading) return <PanelLoadingState />
          if (error) return <p>Error Occurred</p>

          return (
            <div className={classes.root}>
              <Paper>
                <Panel dataset={data.dataset[0]} apikey={data.currentUser.apikey} />
              </Paper>
            </div>
          )
        }
      }
    </Query>
  )
}

ConnectedPanel.propTypes = {
  classes: PropTypes.objectOf(PropTypes.any).isRequired,
  uuid: PropTypes.string
}

ConnectedPanel.defaultProps = {
  uuid: null
}

export default compose(
  withStyles(styles)
)(ConnectedPanel)
