import React from 'react';
import { Query } from 'react-apollo';
import Tree from 'react-d3-tree';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { linkData } from './DatasetConnections';
import { datasetConnectionsQuery } from '../queries';
import ToggleVisibility from './ToggleVisibility'
import MediaCard from './HoverCard'
import './connectionStyle.css'

// {/* This creates a button that navigates to a dataset. Commented out for now because it was ugly */}
//       {/* <IconButton aria-label="Navigate"  onClick={() => navigation.selectDataset(nodeData.attributes.id)}>
//             <NavigationIcon />
//           </IconButton> */}
        
// TODO: Modify this to check if the transformation name
// is the same as the dataset name
function ifDataset(string) {
  if (string === 'Dataset') {
    return true
  }
  return false
}

class NodeLabel extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { inside: false }
  }

  openCard = () => {
    this.setState({ inside: true })
    console.log(this.state.inside)
  }

  closeCard = () => {
    this.setState({ inside: false })
    console.log(this.state.inside)
  }

  render() {
    const { className, nodeData, navigation } = this.props
    const { classes } = this.props
    // TODO: I don't know how to make <MediaCard> appear as the top level element
    return (
      <div className={className} 
           id={"nodeContainer"}
           onMouseEnter={this.openCard} 
           onMouseLeave={this.closeCard} 
           width={400} >
        <Typography>
          <ToggleVisibility visible={ifDataset(nodeData.attributes.kind)}>
              <b>{nodeData.name}</b>
              <br></br>
          </ToggleVisibility> 
          {nodeData.attributes.kind}
        </Typography>
        <div id={"cardContainer"} width={400} className="front">
          {this.state.inside ? <MediaCard classes = { classes } nodeData={ nodeData} navigation={navigation}/> : null}
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
  const { data } = props;
  const { id } = props;
  const { navigation } = props;
  // console.log(data)
  return (
    <ExpansionPanel>
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
        <Typography> <b> View Connection Diagram </b> </Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        {/* TODO:  Make this scale with the box size rater than hard coding  */}
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
      </ExpansionPanelDetails>
    </ExpansionPanel>
  )
};


const DatasetTree = (props) => {
  const { id } = props.dataset
  const { classes } = props
  const { navigation } = props;

  return (
    <Query query={datasetConnectionsQuery} variables={{ id }}>
      {({ loading, error, data }) => {
        if (loading) return null
        if (error) return null
        console.log(data.dataset[0].connections)
        const links = linkData(JSON.parse(data.dataset[0].connections))
        // console.log(links)
        return (<TreeMaker data={links} id={id} navigation={navigation} />)
      }}

    </Query>
  )
};

export default DatasetTree
