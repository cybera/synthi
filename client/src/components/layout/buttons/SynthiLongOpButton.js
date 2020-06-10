import React from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import CircularProgress from '@material-ui/core/CircularProgress'
import { green } from '@material-ui/core/colors'
import SynthiButton from './SynthiButton'
import { childrenProptype } from '../../../lib/synthiProptypes'

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
  },
  wrapper: {
    margin: 0,
    position: 'relative',
    width: '100%',
  },
  button: {
    width: '100%',
  },
  buttonSuccess: {
  },
  buttonProgress: {
    color: green[500],
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
})


const LongOpButton = ({ children, handler }) => {
  const classes = useStyles()
  const [loading, setLoading] = React.useState(false)
  const [success, setSuccess] = React.useState(false)
  const timer = React.useRef()

  const buttonClassname = clsx(classes.button, {
    [classes.buttonSuccess]: success,
  });

  React.useEffect(() => () => {
    clearTimeout(timer.current);
  }, []);

  const handleButtonClick = (event) => {
    if (!loading) {
      setSuccess(false);
      setLoading(true);
      timer.current = setTimeout(() => {
        setLoading(false);
      }, 2000);
      handler(event).then(() => {
        setSuccess(true)
        setLoading(false)
      })
    }
  }

  return (
    <div className={classes.root}>
      <div className={classes.wrapper}>
        <SynthiButton
          className={buttonClassname}
          disabled={loading}
          onClick={handleButtonClick}
        >
          { children }
        </SynthiButton>
        {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
      </div>
    </div>
  );
}

LongOpButton.propTypes = {
  children: childrenProptype.isRequired,
  handler: PropTypes.func.isRequired,
}

export default LongOpButton
