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
import BusinessIcon from '@material-ui/icons/Business';

import Grid from '@material-ui/core/Grid'
import ColumnSummary from './ColumnSummary'

import { formatBytes } from '../../../lib/common'
import { datasetProptype } from '../../../lib/adiProptypes'

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
    flex: '1 0 auto'
  },
  datasetName: {
    flex: '1 0 auto'
  },
  operations: {
    borderLeftStyle: 'dotted',
    borderLeftWidth: 1,
    borderLeftColor: '#cfcfcf'
  },
  title: {
    fontSize: 18,
  },
  orgIcon: {
    marginRight: theme.spacing(1),
    fontSize: 22,
    verticalAlign: 'text-bottom',
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

FooterField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOf(PropTypes.string, PropTypes.number).isRequired
}

const DateSnippet = ({ label, timestamp }) => {
  const date = new Date(timestamp)
  const dateString = new Date(date).toDateString()

  return <FooterField label={label} value={dateString} />
}

DateSnippet.propTypes = {
  label: PropTypes.string.isRequired,
  timestamp: PropTypes.number.isRequired
}

const MainFooter = ({ dataset }) => {
  const { metadata, bytes, type: datasetType } = dataset
  const {
    dateCreated,
    dateUpdated,
    format
  } = metadata

  let displayType
  switch (datasetType) {
    case 'csv':
      displayType = 'Structured'
      break
    case 'document':
      displayType = 'Unstructured'
      break
    default:
      displayType = ''
  }

  return (
    <Grid container item direction="row" spacing={2} xs={12} justify="space-between">
      <Grid item xs={10} sm={2}>
        <DateSnippet label="Created on" timestamp={dateCreated} />
      </Grid>
      <Grid item xs={10} sm={2}>
        <DateSnippet label="Last updated" timestamp={dateUpdated} />
      </Grid>
      <Grid item xs={10} sm={2}>
        <FooterField label="Size" value={formatBytes(bytes)} />
      </Grid>
      <Grid item xs={10} sm={2}>
        <FooterField label="Format" value={format} />
      </Grid>
      <Grid item xs={10} sm={2}>
        <FooterField label="Type" value={displayType} />
      </Grid>
    </Grid>
  )
}

MainFooter.propTypes = {
  dataset: datasetProptype.isRequired
}

const DatasetDetail = ({ dataset }) => {
  const classes = useStyles()
  const [setPublished] = useMutation(PUBLISH_DATASET)
  const { uuid, published, columns } = dataset

  return (
    <Card className={classes.card}>
      <CardContent className={classes.details}>
        <Grid container direction="column" spacing={3}>
          <Grid container item direction="row">
            <Grid item className={classes.datasetName}>
              <Typography variant="h5" color="textPrimary" gutterBottom>
                { dataset.name }
              </Typography>
            </Grid>
            <Grid item>
              <Typography className={classes.title} color="textSecondary" gutterBottom>
                <BusinessIcon className={classes.orgIcon} />
                { dataset.ownerName }
              </Typography>
            </Grid>
          </Grid>
          <Grid item>
            <Typography className={classes.inputsHeading} color="textSecondary" gutterBottom>
              Description
            </Typography>
            <Typography variant="body2" component="p">
              { dataset.metadata.description }
            </Typography>
          </Grid>
          { columns.length > 0 && (
            <Grid item>
              <Typography className={classes.inputsHeading} color="textSecondary" gutterBottom>
                Columns
              </Typography>
              <Typography variant="body2" component="p">
                <ColumnSummary columns={columns} />
              </Typography>
            </Grid>
          )}
          <MainFooter dataset={dataset} />
        </Grid>
      </CardContent>
      <CardContent className={classes.operations}>
        { dataset.canPublish && (
        <FormControlLabel
          control={(
            <Switch
              checked={Boolean(published)}
              onChange={() => setPublished({ variables: { uuid, published: !published } })}
              value={published}
              color="primary"
              size="small"
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
  dataset: datasetProptype.isRequired
}

export default DatasetDetail
