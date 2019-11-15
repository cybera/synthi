import React from 'react'
import PropTypes from 'prop-types'

import gql from 'graphql-tag'
import { useMutation } from 'react-apollo'

import { makeStyles } from '@material-ui/core/styles'
import {
  Card,
  CardContent,
  Grid,
  Typography,
  FormControlLabel,
  Switch,
  Chip,
} from '@material-ui/core'

import BusinessIcon from '@material-ui/icons/Business';

import ComputeDatasetDialog from './ComputeDatasetDialog'

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
    flex: '1 0 70%',
    '& p': {
      marginBottom: theme.spacing(1.5)
    }
  },
  operations: {
    borderLeftStyle: 'dotted',
    borderLeftWidth: 1,
    borderLeftColor: '#cfcfcf',
    width: 240,
  },
  title: {
    fontSize: 18,
  },
  inputsHeading: {
    fontSize: 14,
  },
  transformationName: {
    flex: '1 0 auto'
  },
  opButton: {
    width: '100%',
  },
  orgIcon: {
    marginRight: theme.spacing(1),
    fontSize: 22,
    verticalAlign: 'text-bottom',
  },
}))

const PUBLISH_TRANSFORMATION = gql`
  mutation TransformationSetPublished($uuid: String!, $published: Boolean) {
    publishTransformation(uuid: $uuid, published: $published) {
      uuid
      name
      published
    }
  }
`

const TransformationDetail = ({ transformation }) => {
  const classes = useStyles()
  const [setPublished] = useMutation(PUBLISH_TRANSFORMATION)
  const {
    uuid,
    published,
    description,
  } = transformation

  return (
    <Card className={classes.card}>
      <CardContent className={classes.details}>
        <Grid container direction="column" spacing={3}>
          <Grid container item direction="row">
            <Grid item className={classes.transformationName}>
              <Typography variant="h5" color="textPrimary" gutterBottom>
                { transformation.name }
              </Typography>
            </Grid>
            <Grid item>
              <Typography className={classes.title} color="textSecondary" gutterBottom>
                <BusinessIcon className={classes.orgIcon} />
                { transformation.ownerName }
              </Typography>
            </Grid>
          </Grid>
          <Grid item>
            <Typography className={classes.inputsHeading} color="textSecondary" gutterBottom>
              Description
            </Typography>
            { description && description.split('\n').map((paragraph, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <Typography variant="body2" component="p" key={index}>
                { paragraph }
              </Typography>
            ))}
          </Grid>
          <Grid item>
            <Typography className={classes.inputsHeading} color="textSecondary" gutterBottom>
              Expected inputs:
            </Typography>
            { transformation.inputs.map((input) => (
              <Chip variant="outlined" size="small" label={input} key={input} />
            ))}
          </Grid>
        </Grid>
      </CardContent>
      <CardContent className={classes.operations}>
        <Grid container direction="column" spacing={2}>
          <Grid item>
            { transformation.canPublish && (
            <FormControlLabel
              control={(
                <Switch
                  checked={Boolean(published)}
                  onChange={() => setPublished({ variables: { uuid, published: !published } })}
                  value={`published-${uuid}`}
                  color="primary"
                  size="small"
                />
              )}
              label="Publish"
            />
            )}
          </Grid>
          <Grid item>
            <ComputeDatasetDialog
              transformation={transformation}
              buttonClass={classes.opButton}
            />
          </Grid>
        </Grid>
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
    ownerName: PropTypes.string,
    canPublish: PropTypes.bool,
    description: PropTypes.string,
  }).isRequired
}

export default TransformationDetail
