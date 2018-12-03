import React from 'react'
import PropTypes from 'prop-types'

import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import withStyles from '@material-ui/core/styles/withStyles';

import { withNavigation } from '../context/NavigationContext'
import { compose } from '../lib/common'

const styles = theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120,
  },
})

class OrgSelector extends React.Component {
  static propTypes = {
    navigation: PropTypes.shape({
      setUser: PropTypes.func,
      setOrg: PropTypes.func,
      selectDataset: PropTypes.func
    }).isRequired,
    classes: PropTypes.object.isRequired
  }

  handleChange = (event) => {
    const { navigation } = this.props
    navigation.setOrg(event.target.value)
    navigation.selectDataset(null, null)
  }

  populateOrgs = orgs => orgs.map(org => (
    <MenuItem key={org.id} value={org.id}>{org.name}</MenuItem>
  ))

  render() {
    const { navigation, classes } = this.props

    return (
      <FormControl className={classes.formControl}>
        <Select
          value={navigation.currentOrg}
          onChange={this.handleChange}
          name="organization"
          input={(
            <Input
              name="organization"
              id="org"
            />
          )}
        >
          {this.populateOrgs(navigation.user.orgs)}
        </Select>
      </FormControl>
    )
  }
}

export default compose(
  withStyles(styles),
  withNavigation
)(OrgSelector)
