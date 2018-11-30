import React from "react";

import ApolloClient from "apollo-client";
import { HttpLink, InMemoryCache, ApolloLink } from 'apollo-boost';
import { ApolloProvider } from "react-apollo";

import { createUploadLink } from 'apollo-upload-client'

import DatasetDetails from './components/DatasetDetails'
import ChartEditor from './containers/ChartEditor'
import Scenarios from './components/Scenarios'
import StyledLogin from './components/Login'
import Notifier from './components/Notifier'

import AppBar from './components/AppBar'

import NavigationContext from './context/NavigationContext'

import { withStyles } from '@material-ui/core/styles'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import MuiPickersUtilsProvider from 'material-ui-pickers/utils/MuiPickersUtilsProvider';
import DateFnsUtils from 'material-ui-pickers/utils/date-fns-utils';

import { WebSocketLink } from 'apollo-link-ws';
import { split } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';

let uri

if (!process.env.NODE_ENV || process.env.NODE_ENV !== 'production') {
  uri = 'ws://localhost:3000/graphql'
} else {
  uri = `wss://${window.location.hostname}/graphql`
}

const wsLink = new WebSocketLink({
  uri,
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
    marginTop: 64
  },
  appRoot: {
    flexGrow: 1
  }
});

function MainComponent(props) {
  const { mode, dataset } = props

  if (mode == 'datasets') {
    return <DatasetDetails id={dataset}/>
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

    this.state = {
      currentDataset: null,
      currentMode: 'datasets',
    }

    try {
      const user = JSON.parse(localStorage.getItem('user'))
      const org = user.orgs.find(org => org.name === user.username)

      this.state.user = user
      this.state.currentOrg = org.id
    } catch (error) {
      console.log(error)
    }
  }

  async componentDidMount() {
    const { user } = this.state

    if (!user) return

    this.setState({ loading: true })

    const res = await fetch('/whoami', { credentials: 'include' })
    const body = res.text()

    if (body === 'not logged in') {
      this.setState({
        user: null,
        currentOrg: null,
        currentDataset: null,
        loading: false
      })
      localStorage.removeItem('user')
    } else {
      this.setState({ loading: false })
    }
  }

  switchMode = mode => this.setState({ currentMode: mode })

  selectDataset = id => this.setState({ currentDataset: id })

  setUser = user => this.setState({ user })

  setOrg = org => this.setState({ currentOrg: org })

  render() {
    const { user, currentMode, currentDataset, currentOrg } = this.state
    let mainComponent

    if (user) {
      mainComponent = (
        <AppBar>
          <StyledMainComponent
            mode={currentMode}
            dataset={currentDataset}
          />
        </AppBar>
      )
    } else {
      mainComponent = <StyledLogin />
    }
    return (
      <ApolloProvider client={client}>
        <NavigationContext.Provider
          value={{
            currentMode: currentMode,
            currentDataset: currentDataset,
            currentOrg: currentOrg,
            user: user,
            switchMode: this.switchMode,
            selectDataset: this.selectDataset,
            setUser: this.setUser,
            setOrg: this.setOrg
          }}
        >
          <MuiThemeProvider theme={theme}>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <Notifier />
              {mainComponent}
            </MuiPickersUtilsProvider>
          </MuiThemeProvider>
        </NavigationContext.Provider>
      </ApolloProvider>
    )
  }
}

export default hot(module)(App);
