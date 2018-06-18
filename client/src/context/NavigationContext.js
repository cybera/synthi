import React from 'react'

export default React.createContext({
  currentMode: 'datasets',
  currentDataset: null,
  user: null,
  switchMode: (mode) => {},
  selectDataset: (id) => {},
  setUser: (user) => {}
});