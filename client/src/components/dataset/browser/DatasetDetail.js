import React from 'react'
import PropTypes from 'prop-types'

import gql from 'graphql-tag'
import { useMutation } from 'react-apollo'

import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'

import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'

const useStyles = makeStyles(() => ({
  card: {
    minWidth: 275,
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 20,
    marginRight: 20,
    display: 'flex',
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
  },
  operations: {
    width: 200,
    marginLeft: 'auto',
  },
  title: {
    fontSize: 18,
  },
  inputsHeading: {
    fontSize: 14,
  },
}))

const PUBLISH_DATASET = gql`
  mutation DatasetSetPublished($uuid: String!, $published: Boolean) {
    publishDataset(uuid: $uuid, published: $published) {
      uuid
      name
      published
    }
  }
`

const DatasetDetail = ({ dataset }) => {
  const classes = useStyles()
  const [setPublished] = useMutation(PUBLISH_DATASET)
  const { uuid, published, } = dataset

  return (
    <Card className={classes.card}>
      <CardContent className={classes.details}>
        <Typography className={classes.title} color="textSecondary" gutterBottom>
          { dataset.name }
          { ' ' }
          { `(${dataset.ownerName})` }
        </Typography>
        <Typography variant="body2" component="p">
          <b>UUID:</b>
          { ' ' }
          { uuid }
          <br />
          <b>Type:</b>
          { ' ' }
          { dataset.type }
          <br />
        </Typography>
        <br />
        <Typography className={classes.inputsHeading} color="textSecondary" gutterBottom>
          Description:
        </Typography>
        <Typography variant="body2" component="p">
          { dataset.metadata.description }
        </Typography>
      </CardContent>
      <CardContent className={classes.operations}>
        { dataset.canPublish && (
        <FormControlLabel
          control={(
            <Switch
              checked={published}
              onChange={() => setPublished({ variables: { uuid, published: !published } })}
              value={published}
              color="primary"
            />
          )}
          label="Publish"
        />
        )}
      </CardContent>
    </Card>
  )
}

DatasetDetail.propTypes = {
  dataset: PropTypes.shape({
    name: PropTypes.string,
    uuid: PropTypes.string,
    inputs: PropTypes.arrayOf(PropTypes.string),
    published: PropTypes.bool,
    ownerName: PropTypes.string,
    canPublish: PropTypes.bool,
    type: PropTypes.string,
    metadata: PropTypes.shape({
      description: PropTypes.string,
    }),
  }).isRequired
}

export default DatasetDetail
