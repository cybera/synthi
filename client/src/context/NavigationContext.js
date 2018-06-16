import React from 'react'

export default React.createContext({
  currentMode: 'browser',
  selectedDataset: null,
  switchMode: (mode) => {}
});