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

import { withStyles } from 'material-ui/styles'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'

import { WebSocketLink } from 'apollo-link-ws';
import { split } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';

// TODO: this will need to be somewhat configurable
const wsLink = new WebSocketLink({
  uri: `ws://localhost:3000/graphql`,
  options: {
    reconnect: true
  }
});

const httpLink = ApolloLink.from([createUploadLink({ uri: "/graphql", credentials: 'include' })])

// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
const link = split(
  // split based on operation type
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  wsLink,
  httpLink,
);

const client = new ApolloClient({
  cache: new InMemoryCache(),
  // Apparently "new HttpLink()" isn't necessary anymore:
  // https://stackoverflow.com/questions/49507035/how-to-use-apollo-link-http-with-apollo-upload-client
  link: link
})

import { hot } from 'react-hot-loader'

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#26a69a',
    },
    secondary: {
      main: '#303f9f',
    },
  },
})

const styles = theme => ({
  root: {
    marginTop: 10
  }
});

function MainComponent(props) {
  const { mode, dataset, classes } = props

  if (mode == 'datasets') {
    return <DatasetBrowser selectedDataset={dataset}/>
  } else if (mode == 'chart-editor') {
    return <ChartEditor datasetID={dataset}/>
  } else if (mode == 'scenarios') {
    return <Scenarios/>
  } else {
    return <div>Empty</div>
  }
}

const StyledMainComponent = withStyles(styles)(props => <div className={props.classes.root}>
  <MainComponent {...props} />
</div>)

class App extends React.Component {
  constructor(props) {
    super(props)

    const user = localStorage.getItem('user')

    this.state = {
      user: user,
      currentDataset: null,
      currentMode: "datasets"
    }
  }

  switchMode = (mode) => this.setState({currentMode:mode})
  selectDataset = (id) => this.setState({currentDataset:id})
  setUser = (user) => { this.setState({user:user}) }

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
          <MuiThemeProvider theme={theme}>
            <AppBar/>
            <StyledMainComponent mode={this.state.currentMode} 
                                dataset={this.state.currentDataset}/>
          </MuiThemeProvider>
        </NavigationContext.Provider>
      </ApolloProvider>
    )
  }
}

export default hot(module)(App);
