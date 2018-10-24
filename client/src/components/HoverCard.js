import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import ToggleVisibility from './ToggleVisibility'


function ifDataset(string) {
    if (string == "Dataset") {
      return true
    }
    return false   
  }

const styles = {
  card: {
    minWidth: 150,
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
};

function MediaCard(props) {
  const { classes } = props;
  const { nodeData } = props;
  const { navigation } = props;
  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography className={classes.title}  gutterBottom>
          {nodeData.kind}
        </Typography>
        <Typography color="textSecondary">
         {nodeData.name}
        </Typography>
        <Typography className={classes.pos}>
          Extra information about node here 
        </Typography>
      </CardContent>
      <CardActions>
      <ToggleVisibility visible={ifDataset(nodeData.kind)}>
        <Button size="small" onClick={() => navigation.selectDataset(nodeData.attributes.id)} >Go to Dataset</Button>
      </ToggleVisibility>
      </CardActions>
    </Card>
  );
}

MediaCard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MediaCard);