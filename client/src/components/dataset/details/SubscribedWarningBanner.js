import React from 'react'

import Grid from '@material-ui/core/Grid'

import WarningBanner from '../layout/WarningBanner'
import UploadParsingOptions from '../../upload-parsing'
import { WarnSvg } from '../../layout/svg'


export default class SubscribedWarningBanner extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      errors: {}
    }
  }

  componentDidMount() {
    const { subscribeToDatasetGenerated, uuid } = this.props
    this.unsubscribe = subscribeToDatasetGenerated(({status, message}) => {
      const { errors } = this.state
      if (status === 'error') {
        this.setState({ errors: Object.assign({}, errors, { [uuid]: message }) })
      } else {
        this.setState({ errors: Object.assign({}, errors, { [uuid]: '' }) })
      }
    })
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  render() {
    const { classes, uuid, error } = this.props

    return (
      <div>
        <Grid container columns spacing={24}>
          <Grid item xs={6}>
            <div className={classes.empty}>
              <div className={classes.svgContainer}>
                <WarnSvg color="#303f9f" className={classes.svg} />
              </div>
              <WarningBanner
                message={error.message}
                header="Something's wrong with your file..."
                className={classes.text}
              />
            </div>
          </Grid>
          <Grid item xs={6}>
            <div className={classes.adviceContainer}>
              <Typography variant="subtitle1" gutterBottom>
                You can try uploading your file again.
              </Typography>
              <DatasetUploadButton uuid={uuid} type="csv" />
            </div>
            <div className={classes.adviceContainer}>
              <Typography variant="subtitle1" gutterBottom>
                Or you can try providing some more information and rescanning:
              </Typography>
              <UploadParsingOptions uuid={uuid} error={error} />
            </div>
          </Grid>
        </Grid>
      </div>
    )
  }
}
