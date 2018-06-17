import React from "react";

import ApolloClient from "apollo-client";
import { HttpLink, InMemoryCache, ApolloLink } from 'apollo-boost';
import { ApolloProvider } from "react-apollo";

import { createUploadLink } from 'apollo-upload-client'

import DatasetBrowser from './components/DatasetBrowser'
import ChartEditor from './components/ChartEditor'
import AppBar from './components/AppBar'

import NavigationContext from './context/NavigationContext'

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: ApolloLink.from([createUploadLink({ uri: "/graphql" }), new HttpLink()])
})

import { hot } from 'react-hot-loader'

function MainComponent(props) {
  const { mode, dataset } = props

  if (mode == 'browser') {
    return <DatasetBrowser selectedDataset={dataset}/>
  } else if (mode == 'chart-editor') {
    return <ChartEditor dataset={dataset} apolloClient={client}/>
  } else {
    return <div>Empty</div>
  }
}
class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      currentDataset: null,
      currentMode: "browser"
    }
  }

  switchMode = (mode) => this.setState({currentMode:mode})
  selectDataset = (id) => this.setState({currentDataset:id})

  render() {
    return (
      <ApolloProvider client={client}>
        <NavigationContext.Provider value={{ 
          currentMode: this.state.currentMode,
          currentDataset: this.state.currentDataset,
          switchMode: this.switchMode,
          selectDataset: this.selectDataset
        }}>
          <AppBar/>
          <MainComponent mode={this.state.currentMode} 
                         dataset={this.state.currentDataset}/>
        </NavigationContext.Provider>
      </ApolloProvider>
    )
  }
}

export default hot(module)(App);