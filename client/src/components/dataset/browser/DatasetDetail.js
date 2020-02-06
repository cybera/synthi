import React, { useState, useContext } from 'react'
import PropTypes from 'prop-types'

import gql from 'graphql-tag'
import { useMutation } from 'react-apollo'

import { makeStyles } from '@material-ui/core/styles'

import {
  Card,
  CardContent,
  Typography,
  FormControlLabel,
  Switch,
  Grid,
  Button
} from '@material-ui/core'
import BusinessIcon from '@material-ui/icons/Business';
import ColumnSummary from './ColumnSummary'

import Preview from '../details/Preview'
import { formatBytes } from '../../../lib/common'
import { datasetProptype } from '../../../lib/adiProptypes'
import { ADIButton } from '../../layout/buttons'
import NavigationContext from '../../../contexts/NavigationContext'
import { DownloadButton } from '../editor/buttons'

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
  datasetName: {
    flex: '1 0 auto'
  },
  operations: {
    borderLeftStyle: 'dotted',
    borderLeftWidth: 1,
    borderLeftColor: '#cfcfcf',
    width: 240,
  },
  opButton: {
    width: '100%',
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
  previewGridItem: {
    width: '100%'
  }
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
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
}

FooterField.defaultProps = {
  value: ''
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
  const {
    dateCreated,
    dateUpdated,
    format,
    bytes,
    type: datasetType
  } = dataset

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
    <Grid container item direction="row" spacing={2} xs={12} justify="space-between" style={{ flexBasis: 'inherit' }}>
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

const PreviewSection = ({ dataset }) => {
  const [showPreview, setShowPreview] = useState(false)
  const classes = useStyles()

  return (
    dataset.type === 'csv' && (
      <Grid item className={classes.previewGridItem}>
        <Button color="primary" onClick={() => setShowPreview(!showPreview)}>
          { `${showPreview ? 'Hide' : 'Show'} Preview` }
        </Button>
        { showPreview && <Preview dataset={dataset} /> }
      </Grid>
    )
  )
}

const DatasetDetail = ({ dataset }) => {
  const classes = useStyles()
  const [setPublished] = useMutation(PUBLISH_DATASET)
  const {
    uuid,
    published,
    columns,
    description
  } = dataset
  const navigation = useContext(NavigationContext)
  const handleDatasetNavigation = () => {
    navigation.selectDataset(uuid)
    navigation.switchMode('datasets')
  }

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
            { description && description.split('\n').map((paragraph, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <Typography variant="body2" component="p" key={index}>
                { paragraph }
              </Typography>
            ))}
          </Grid>
          { columns.length > 0 && (
            <Grid item style={{ width: '100%' }}>
              <ColumnSummary columns={columns} dataset={dataset} />
            </Grid>
          )}
          <MainFooter dataset={dataset} />
          <PreviewSection dataset={dataset} />
        </Grid>
      </CardContent>
      <CardContent className={classes.operations}>
        <Grid container direction="column" spacing={2}>
          <Grid item>
            { dataset.canPublish && (
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
            <ADIButton size="small" onClick={handleDatasetNavigation} className={classes.opButton}>
              Dataset Workbench
            </ADIButton>
          </Grid>
          <Grid item>
            <DownloadButton size="small" dataset={dataset} className={classes.opButton} />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

DatasetDetail.propTypes = {
  dataset: datasetProptype.isRequired
}

export default DatasetDetail
