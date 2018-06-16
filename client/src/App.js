import React from "react";

import ApolloClient from "apollo-client";
import { HttpLink, InMemoryCache, ApolloLink } from 'apollo-boost';
import { ApolloProvider } from "react-apollo";

import { createUploadLink } from 'apollo-upload-client'

import DatasetBrowser from './components/DatasetBrowser'

import NavigationContext from './context/NavigationContext'

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: ApolloLink.from([createUploadLink({ uri: "http://127.0.0.1:3000/graphql" }), new HttpLink()])
})

import { hot } from 'react-hot-loader'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      selectedDataset: null,
      currentMode: "browser"
    }
  }

  switchMode = (mode) => this.setState({currentMode:mode})

  render() {
    return (
      <ApolloProvider client={client}>
        <NavigationContext.Provider value={{ 
          currentMode: this.state.currentMode,
          switchMode: this.switchMode
        }}>
          <h1>{this.state.currentMode}</h1>
          <DatasetBrowser/>
        </NavigationContext.Provider>
      </ApolloProvider>
    )
  }
}

export default hot(module)(App);