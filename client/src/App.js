import React from "react";

import ApolloClient from "apollo-client";
import { HttpLink, InMemoryCache, ApolloLink } from 'apollo-boost';
import { ApolloProvider } from "react-apollo";

import { createUploadLink } from 'apollo-upload-client'

import DatasetBrowser from './components/DatasetBrowser'
import ChartEditor from './containers/ChartEditor'
import Scenarios from './components/Scenarios'

import AppBar from './components/AppBar'

import NavigationContext from './context/NavigationContext'

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: ApolloLink.from([createUploadLink({ uri: "/graphql" }), new HttpLink()])
})

import { hot } from 'react-hot-loader'

function MainComponent(props) {
  const { mode, dataset } = props

  if (mode == 'datasets') {
    return <DatasetBrowser selectedDataset={dataset}/>
  } else if (mode == 'chart-editor') {
    return <ChartEditor datasetID={dataset}/>
  } else if (mode == 'scenarios') {
    return <Scenarios />
  } else {
    return <div>Empty</div>
  }
}
class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      user: null,
      currentDataset: null,
      currentMode: "datasets"
    }
  }

  switchMode = (mode) => this.setState({currentMode:mode})
  selectDataset = (id) => this.setState({currentDataset:id})
  setUser = (user) =>  { this.setState({user:user}) }

  render() {
    return (
      <ApolloProvider client={client}>
        <NavigationContext.Provider value={{ 
          currentMode: this.state.currentMode,
          currentDataset: this.state.currentDataset,
          user: this.state.user,
          switchMode: this.switchMode,
          selectDataset: this.selectDataset,
          setUser: this.setUser
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