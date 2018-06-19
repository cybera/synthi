import React from 'react'

const NavigationContext = React.createContext({
  currentMode: 'datasets',
  currentDataset: null,
  user: null,
  switchMode: (mode) => {},
  selectDataset: (id) => {},
  setUser: (user) => {}
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