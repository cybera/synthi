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

import Grid from '@material-ui/core/Grid'

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

const FooterField = ({ label, value }) => {
  const classes = useStyles()

  return (
    <>
      <Typography className={classes.inputsHeading} color="textSecondary" gutterBottom>
        { label }
      </Typography>
      <Typography variant="body2" component="p">
        { value }
      </Typography>
    </>
  )
}
const DateSnippet = ({ label, timestamp }) => {
  const date = new Date(timestamp)
  const dateString = new Date(date).toDateString()

  return <FooterField label={label} value={dateString} />
}

const MainFooter = ({ dataset }) => {
  const { metadata } = dataset
  const { dateCreated, dateUpdated } = metadata  

  return (
    <Grid container direction="row" spacing={2}>
      <Grid item>
        <DateSnippet label="Created on" timestamp={dateCreated} />
      </Grid>
      <Grid item>
        <DateSnippet label="Last updated" timestamp={dateUpdated} />
      </Grid>
      <Grid item>
        <FooterField label="Size" value="" />
      </Grid>
      <Grid item>
        <FooterField label="Filetype" value="" />
      </Grid>
      <Grid item>
        <FooterField label="Origin" value="" />
      </Grid>
    </Grid>
  )
}

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
        <MainFooter dataset={dataset} />
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
      dateCreated: PropTypes.number,
      dateUpdated: PropTypes.number,
    }),
  }).isRequired
}

export default DatasetDetail
