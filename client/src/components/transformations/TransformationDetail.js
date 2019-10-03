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

const useStyles = makeStyles((theme) => ({
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

const PUBLISH_TRANSFORMATION = gql`
  mutation TransformationSetPublished($uuid: String!, $published: Boolean) {
    setPublished(uuid: $uuid, published: $published) {
      uuid
      name
      published
    }
  }
`

const TransformationDetail = ({ transformation }) => {
  const classes = useStyles()
  const [setPublished] = useMutation(PUBLISH_TRANSFORMATION)
  const { uuid, name, published } = transformation

  return (
    <Card className={classes.card}>
      <CardContent className={classes.details}>
        <Typography className={classes.title} color="textSecondary" gutterBottom>
          { transformation.name }
          { ' ' }
          { `(${transformation.ownerName})` }
        </Typography>
        <Typography variant="body2" component="p">
          Some details about the
          { ' ' }
          { name }
          { ' ' }
          transformation.
          <br />
          <b>UUID:</b>
          { ' ' }
          { uuid }
          ).
        </Typography>
        <br />
        <Typography className={classes.inputsHeading} color="textSecondary" gutterBottom>
          Expected inputs:
        </Typography>
        { transformation.inputs.join(',')}
      </CardContent>
      <CardContent className={classes.operations}>
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
      </CardContent>
    </Card>
  )
}

TransformationDetail.propTypes = {
  transformation: PropTypes.shape({
    name: PropTypes.string,
    uuid: PropTypes.string,
    inputs: PropTypes.arrayOf(PropTypes.string),
    published: PropTypes.bool,
    ownerName: PropTypes.string
  }).isRequired
}

export default TransformationDetail
