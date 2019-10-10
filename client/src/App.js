import React from 'react';
import PropTypes from 'prop-types'
import { hot } from 'react-hot-loader'

import { withStyles, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import CircularProgress from '@material-ui/core/CircularProgress';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns'

import ApolloClient from 'apollo-client';
import { InMemoryCache, ApolloLink } from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import { createUploadLink } from 'apollo-upload-client'
import { WebSocketLink } from 'apollo-link-ws';
import { split } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';

import { DatasetDetails } from './components/dataset/layout'
import { Scenarios } from './components/scenarios'
import { TransformationMain, TransformationSidebar } from './components/transformations'
import { Login } from './components/auth'
import { Notifier } from './components/layout'
import { AppBar } from './components/layout/appbar'
import NavigationContext from './contexts/NavigationContext'
import { TransformationFilterProvider } from './contexts/TransformationFilterContext'
import { DatasetSidebar } from './components/dataset'


let uri

if (!process.env.NODE_ENV || process.env.NODE_ENV !== 'production') {
  uri = 'ws://localhost:3000/graphql'
} else {
  uri = `wss://${window.location.hostname}/graphql`
}

const wsLink = new WebSocketLink({
  uri,
  options: {
    reconnect: true,
  }
});

const httpLink = ApolloLink.from([createUploadLink({ uri: '/graphql', credentials: 'include' })])

// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
const link = split(
  // split based on operation type
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  wsLink,
  httpLink
);

const client = new ApolloClient({
  cache: new InMemoryCache({
    dataIdFromObject: object => object.uuid || null
  }),
  // Apparently "new HttpLink()" isn't necessary anymore:
  // https://stackoverflow.com/questions/49507035/how-to-use-apollo-link-http-with-apollo-upload-client
  link
})

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#26a69a',
    },
    secondary: {
      main: '#303f9f',
    },
  },
  typography: {
    useNextVariants: true
  }
})

const styles = () => ({
  root: {
    marginTop: 64
  },
  appRoot: {
    flexGrow: 1
  },
  progress: {
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 50,
  }
});

function MainComponent(props) {
  const { mode, dataset } = props

  if (mode === 'datasets' || mode === 'chart-editor') return <DatasetDetails uuid={dataset} />
  if (mode === 'scenarios') return <Scenarios />
  if (mode === 'transformations') return <TransformationMain />

  return <div>Empty</div>
}

const StyledMainComponent = withStyles(styles)(props => (
  <div className={props.classes.root}>
    <MainComponent {...props} />
  </div>
))

const SidebarComponent = (props) => {
  const { mode } = props

  if (mode === 'datasets') return <div><DatasetSidebar /></div>
  if (mode === 'transformations') return <TransformationSidebar />

  return <div />
}

SidebarComponent.propTypes = {
  mode: PropTypes.string.isRequired
}

const StyledCircularProgress = withStyles(styles)((props) => {
  const { classes } = props;

  return (
    <div>
      <CircularProgress className={classes.progress} />
    </div>
  )
})

class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      currentDataset: null,
      currentMode: 'datasets',
      currentOrg: '',
      user: null,
      loading: false
    }

    try {
      const user = JSON.parse(localStorage.getItem('user'))
      if (user && user.orgs) {
        const org = user.orgs.find(o => o.name === user.username)

        this.state.user = user
        this.state.currentOrg = org.uuid
      }
    } catch (error) {
      console.log(error)
    }
  }

  async componentDidMount() {
    const { user } = this.state

    if (!user) return

    this.setState({ loading: true })

    const res = await fetch('/whoami', { credentials: 'include' })
    const body = await res.text()

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

  selectDataset = (uuid, name) => this.setState({ currentDataset: uuid, currentName: name })

  setUser = user => this.setState({ user })

  setOrg = org => this.setState({ currentOrg: org })

  render() {
    const { loading, user, currentMode, currentDataset, currentName, currentOrg } = this.state
    let mainComponent

    if (loading) {
      mainComponent = (
        <StyledCircularProgress />
      )
    } else if (user) {
      const leftComponent = (<SidebarComponent mode={currentMode} />)
      const rightComponent = (<StyledMainComponent mode={currentMode} dataset={currentDataset} />)

      mainComponent = (
        <AppBar
          leftContent={leftComponent}
          rightContent={rightComponent}
          key={currentMode}
        />
      )
    } else {
      mainComponent = <Login />
    }

    return (
      <ApolloProvider client={client}>
        <NavigationContext.Provider
          value={{
            currentMode,
            currentDataset,
            currentOrg,
            user,
            currentName,
            switchMode: this.switchMode,
            selectDataset: this.selectDataset,
            setUser: this.setUser,
            setOrg: this.setOrg
          }}
        >
          <TransformationFilterProvider>
            <MuiThemeProvider theme={theme}>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <Notifier />
                {mainComponent}
              </MuiPickersUtilsProvider>
            </MuiThemeProvider>
          </TransformationFilterProvider>
        </NavigationContext.Provider>
      </ApolloProvider>
    )
  }
}

export default hot(module)(App);
