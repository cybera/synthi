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
  render() {
    return (
      <ApolloProvider client={client}>
        <div>
          <DatasetList/>
          <DatasetView id="1"/>
        </div>
      </ApolloProvider>
    )
  }
}

var mountNode = document.getElementById("app");
ReactDOM.render(<App/>, mountNode);