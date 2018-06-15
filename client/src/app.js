import React from "react";
import ReactDOM from "react-dom";

import ApolloClient from "apollo-client";
import { HttpLink, InMemoryCache, ApolloLink } from 'apollo-boost';
import { ApolloProvider } from "react-apollo";

import { Query } from "react-apollo";
import gql from "graphql-tag";

import { createUploadLink } from 'apollo-upload-client'

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: ApolloLink.from([createUploadLink({ uri: "http://127.0.0.1:3000/graphql" }), new HttpLink()])
})

import DatasetView from "./components/DatasetView"
import DatasetList from "./components/DatasetList"
import NewDatasetDialog from "./components/NewDatasetDialog"

import Grid from 'material-ui/Grid'
import { withStyles } from 'material-ui/styles'

import { hot } from 'react-hot-loader'

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
})

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
    const { classes } = this.props

    return (
      <ApolloProvider client={client}>
        <div className={classes.root}>
          <Grid container spacing={24}>
            <Grid item xs={3}>
              <NewDatasetDialog/>
              <DatasetList selectDataset={this.handleDatasetSelection}/>
            </Grid>
            <Grid item xs={9}>
              <DatasetView id={this.state.selectedDataset}/>
            </Grid>
          </Grid>
        </div>
      </ApolloProvider>
    )
  }
}

const StyledApp = withStyles(styles)(App)

export default hot(module)(StyledApp);