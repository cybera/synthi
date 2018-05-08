import React from "react";
import ReactDOM from "react-dom";

import ApolloClient from "apollo-boost";
import { ApolloProvider } from "react-apollo";

import { Query } from "react-apollo";
import gql from "graphql-tag";

const client = new ApolloClient({
  uri: "http://127.0.0.1:3000/graphql"
})

import DatasetView from "./components/DatasetView"
import DatasetList from "./components/DatasetList"

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = { selectedDataset: null }
  }

  handleDatasetSelection = (id, e) => {
    this.setState({
      selectedDataset: id
    })
  }

  render() {
    return (
      <ApolloProvider client={client}>
        <div>
          <DatasetList selectDataset={this.handleDatasetSelection}/>
          <DatasetView id={this.state.selectedDataset}/>
        </div>
      </ApolloProvider>
    )
  }
}

var mountNode = document.getElementById("app");
ReactDOM.render(<App/>, mountNode);