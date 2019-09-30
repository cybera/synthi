import React from 'react'

import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles({
  card: {
    minWidth: 275,
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 20,
    marginRight: 20,
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 18,
  },
  pos: {
    marginBottom: 12,
  },
})

const TransformationDetail = ({ transformation }) => {
  const classes = useStyles()

  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography className={classes.title} color="textSecondary" gutterBottom>
          { transformation.name }
        </Typography>
        <Typography variant="body2" component="p">
          Some details about the
          { ' ' }
          { transformation.name }
          { ' ' }
          transformation.
          <br />
          <b>UUID:</b>
          { ' ' }
          { transformation.uuid }
          ).
        </Typography>
      </CardContent>
    </Card>
  )
}

export default TransformationDetail
