import React from 'react'

export default React.createContext({
  currentMode: 'browser',
  currentDataset: null,
  switchMode: (mode) => {},
  selectDataset: (id) => {}
});