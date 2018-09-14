import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles'

const styles = {
  root: {
    backgroundColor: '#eeeeee',
    color: '#003a70',
    
    '&:hover': {
      backgroundColor: '#00b289',
      color: '#ffffff'
    },
    '&:disabled': {
      backgroundColor: '#00b289',
      color: '#003a70'
    }
  }
};

export default withStyles(styles)(Button)