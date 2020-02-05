import React from 'react';
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';

export default function SplitButton({
  options,
  handleClick,
  size,
  color,
  renderContent,
  className,
  downloads,
  ...rest
}) {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const handleOptionClick = (option) => () => {
    if (handleClick) {
      handleClick(option)
    }
  }

  const handleMenuItemClick = (event, index) => {
    setOpen(false)
    setSelectedIndex(index)
    if (handleClick) {
      handleClick(options[index])
    }
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  return (
    <>
      <ButtonGroup variant="contained" color={color} ref={anchorRef} aria-label="split button" className={className} style={{ verticalAlign: 'middle' }}>
        <Button
          onClick={handleOptionClick(options[selectedIndex])}
          size={size}
          color={color}
          href={options[selectedIndex].uri}
          download={options[selectedIndex].download}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...rest}
          style={{ width: '100%' }}
        >
          {renderContent(options[selectedIndex].text)}
        </Button>
        <Button
          color={color}
          size="small"
          aria-controls={open ? 'split-button-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-label="select merge strategy"
          aria-haspopup="menu"
          onClick={handleToggle}
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
        {({ TransitionProps, placement }) => (
          <Grow
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu">
                  {options.map((option, index) => (
                    <MenuItem
                      // eslint-disable-next-line react/no-array-index-key
                      key={index}
                      selected={index === selectedIndex}
                      href={option.uri}
                      download={option.download}
                      component="a"
                      onClick={(event) => handleMenuItemClick(event, index)}
                    >
                      {option.text}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
}

SplitButton.propTypes = {
  options: PropTypes.arrayOf(PropTypes.shape({
    text: PropTypes.string,
    uri: PropTypes.string,
    download: PropTypes.bool,
  })).isRequired,
  handleClick: PropTypes.func,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  color: PropTypes.oneOf(['inherit', 'primary', 'secondary', 'default']),
  className: PropTypes.string,
  downloads: PropTypes.bool,
  renderContent: PropTypes.func.isRequired,
}

SplitButton.defaultProps = {
  size: 'medium',
  handleClick: undefined,
  color: 'default',
  className: undefined,
  downloads: false,
}
