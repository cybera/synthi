import React from 'react'
import { Query } from 'react-apollo'
import Tree from 'react-d3-tree'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import { compose } from '../lib/common'
import { linkData } from './DatasetConnections'
import { datasetConnectionsQuery } from '../queries'
import { withNavigation } from '../context/NavigationContext'
import ToggleVisibility from './ToggleVisibility'
import MediaCard from './HoverCard'
import Paper from '@material-ui/core/Paper'
import './connectionStyle.css'
        
// TODO: Modify this to check if the transformation name
// is the same as the dataset name
function ifDataset(string) {
  return string === 'Dataset'
}

const styles = (theme) => ({
  root: {
    ...theme.mixins.gutters(),
    paddingTop: 16,
    paddingBottom: 16,
    marginTop: theme.spacing.unit
  }
})

class NodeLabel extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { inside: false }
  }

  openCard = () => {
    this.setState({ inside: true })
  }

  closeCard = () => {
    this.setState({ inside: false })
  }

  render() {
    const { className, nodeData, navigation } = this.props

    // TODO: I don't know how to make <MediaCard> appear as the top level element
    return (
      <div 
        className={className} 
        id="nodeContainer"
        onMouseEnter={this.openCard} 
        onMouseLeave={this.closeCard} 
        width={400}
      >
        <Typography>
          <ToggleVisibility visible={ifDataset(nodeData.attributes.kind)}>
            <b>{nodeData.name}</b>
            <br></br>
          </ToggleVisibility> 
          {nodeData.attributes.kind}
        </Typography>
        <div id="cardContainer" width={400} className="front">
          {this.state.inside ? <MediaCard nodeData={ nodeData} navigation={navigation}/> : null}
        </div>
      </div>
    )
  }
}

const lineStyle = {
  links: {
    stroke: '#c4c2c1',
    strokeWidth: 2,
  },
}

// TreeMaker, Heart breaker
const TreeMaker = (props) => {
  const { data, navigation } = props;

  return (
    <div id="treeContainer" style={{ width: '70em', height: '45em'}}>
      <Tree
        id="stayback"
        data={data}
        orientation="horizontal"
        styles={lineStyle}
        initialDepth={2}
        translate={{ x: 25, y: 320 }}
        allowForeignObjects
        nodeLabelComponent={{
          render: <NodeLabel className="FancyNodeLabels" navigation={navigation}/>,
          foreignObjectWrapper: {
            y: 24
          }
        }}
      />
    </div>
  )
};


const DatasetTree = (props) => {
  const { navigation, uuid, classes } = props;

  return (
    <Query query={datasetConnectionsQuery} variables={{ uuid }}>
      {({ loading, error, data }) => {
        if (loading) return null
        if (error) return null

        const links = linkData(JSON.parse(data.dataset[0].connections))

        return (
          <div className={classes.root}>
            <Paper>
              <TreeMaker data={links} uuid={uuid} navigation={navigation} />
            </Paper>
          </div>
        )
      }}
    </Query>
  )
};

export default compose(
  withNavigation,
  withStyles(styles)
)(DatasetTree)
