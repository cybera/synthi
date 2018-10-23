import React from 'react';
import { Query } from 'react-apollo';
import Tree from 'react-d3-tree';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import IconButton from '@material-ui/core/IconButton'
import NavigationIcon from '@material-ui/icons/Navigation';
import { datasetViewQuery } from '../queries';
import { withNavigation } from '../context/NavigationContext';
import { compose } from '../lib/common';
import { listToTree, linkData } from './DatasetConnections.js';
import { datasetConnectionsQuery } from '../queries';
import ToggleVisibility from './ToggleVisibility'
// import 'react-tree-graph/dist/style.css'
// import './style.css'


class NodeLabel extends React.PureComponent {
  render() {
    const {className, nodeData, navigation} = this.props
    console.log(this.props)
    return (
        <div className={className}>
          <Typography>
          <b>{nodeData.name}</b>
          <br></br>{nodeData.attributes.kind} 
          </Typography>
         {/* This creates a button that navigates to a dataset. Commented out for now because it was ugly */}
          {/* <IconButton aria-label="Navigate"  onClick={() => navigation.selectDataset(nodeData.attributes.id)}>
                <NavigationIcon />
              </IconButton> */}
         
        </div>
    )
  }
}


function MouseOver(nodeData,ext){
    console.log(nodeData)
    return null
}

// TreeMaker, Heart breaker
const TreeMaker = (props) => {
  const { data } = props;
  const { id } = props;
  const { navigation } = props;
  console.log(data)
  return (
    <ExpansionPanel>
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
        <Typography> <b> View Connection Diagram </b> </Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
          {/* TODO:  Make this scale with the box size rater than hard coding  */}
        <div id="custom-container" style={{ width: '70em', height: '45em' }}> 
          <Tree
            data={data}
            orientation="horizontal"
            initialDepth={2}
            translate={{x:25, y:320}}
            onMouseOver={MouseOver}
            allowForeignObjects
            nodeLabelComponent={{
              render: <NodeLabel className='myLabelComponentInSvg' navigation={navigation}/>,
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
        const links = linkData(JSON.parse(data.dataset[0].connections))
        console.log(links)
        return (<TreeMaker data={links} id={id} navigation={navigation}/>)
      }}

    </Query>
  )
};


export default DatasetTree
