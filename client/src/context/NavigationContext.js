import React from 'react'

const NavigationContext = React.createContext({
  currentMode: 'datasets',
  currentDataset: null,
  currentName: null,
  currentOrg: null,
  user: null,
  switchMode: (mode) => {},
  selectDataset: (id, name) => {},
  setUser: (user) => {},
  setOrg: (org) => {}
});

function withNavigation(Component) {
  return function NavigationContextComponent(props) {
    return (
      <NavigationContext.Consumer>
        { navigation => <Component {...props} navigation={navigation}/> }
      </NavigationContext.Consumer>
    )
  }
}

export { withNavigation }
export default NavigationContext
