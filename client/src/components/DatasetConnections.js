import React from 'react';
import { Query } from 'react-apollo';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { datasetConnectionsQuery } from '../queries';
import ToggleVisibility from './ToggleVisibility'
import { withNavigation } from '../context/NavigationContext'
import IconButton from '@material-ui/core/IconButton'
import NavigationIcon from '@material-ui/icons/Navigation';
import { compose } from '../lib/common'
import { withDatasets } from '../containers/DatasetList'



const styles = theme => ({
  root: {
    width: '100%',
  },
  icon: {
    verticalAlign: 'bottom',
    height: 20,
    width: 20,
  },
  details: {
    alignItems: 'center',
  },
  column: {
    flexBasis: '33.33%',
  },
});
// parent: {
//     id: queryResult[i].connection.start.node,
//     name: queryResult[i].connection.start.name,
//     kind: queryResult[i].connection.start.kind
//   },
//   node: {
//     id: queryResult[i].connection.end.node,
//     name: queryResult[i].connection.end.name,
//     kind: queryResult[i].connection.end.kind
//   },
// }


// This solution (from stack overflow, let's be honest)
// assumes a sorted list. However, It always should be from
// neo4j and I haven't encountered this not working yet
function list_to_tree(list) {
  const map = {}; let node; const roots = []; let i;
  for (i = 0; i < list.length; i += 1) {
    map[list[i].id] = i; // initialize the map
    list[i].children = []; // initialize the children
  }
  for (i = 0; i < list.length; i += 1) {
    node = list[i];
    if (node.parent != null) {
      // if you have dangling branches check that map[node.parentId] exists
      list[map[node.parent]].children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
};


function makeLinksAlternate(queryResult) {
  const len = queryResult.length
  let connected = []
  if (len === 1) {
    return [{
      id: queryResult[0].connection.original,
      name: queryResult[0].connection.name,
      kind: queryResult[0].connection.kind,
      original: true
    }]
  };

  for (let i = 0; i < len; i++) {
    // Currently because everytthing is unidirectional
    // these do the same thing, but i'm leaving this
    // in case something changes. I also node that
    // start/end are reversed in _this_ notation because
    // we're running backwards currently. So, the smart thing will be to
    // try and modify the neo4j query once this is happy so the
    // naming conventions make sense


    if (queryResult[i].connection.type == 'INPUT') {
      connected.push({
        id: queryResult[i].connection.start.node,
        name: queryResult[i].connection.start.name,
        parent: queryResult[i].connection.end.node,
        kind: queryResult[i].connection.start.kind,
        children: null,
        origin:false
      })
    } else if (queryResult[i].connection.type == 'OUTPUT') {
      connected.push({
        id: queryResult[i].connection.start.node,
        name: queryResult[i].connection.start.name,
        parent: queryResult[i].connection.end.node,
        kind: queryResult[i].connection.start.kind,
        children: null,
        origin:false
      })
    } else {
      console.log('Unknown type')
      console.log(queryResult[i].connection)
    }
    // Be lazy and remove duplicates that I didn't deal with earlier
    // while also defining the root node of the tree

    const root = {
      id: queryResult[0].connection.end.node,
      name: queryResult[0].connection.end.name,
      kind: queryResult[0].connection.end.kind,
      origin:false,
      children: null
    }
    connected.unshift(root)
    connected = new Set(connected.map(item => JSON.stringify(item)));
    connected = [...connected].map(item => JSON.parse(item));
  }

  // The final data set is always the terminating node, 
  // however we also have to find if it's connected to anything
  // else and make it clear that it is the origin. This is important
  // for some of the messages that display in the expansion pannel 
  
  // TODO: Test this ( I'm 99% sure it will work all the time) 
  // TODO: Is it possible to do this without looping? 
  const originName = connected[connected.length-1].name
  for (var i = 0; i<connected.length;i++) {
    if (connected[i].name == originName) { connected[i].origin = true}
  }
  return list_to_tree(connected)
};


const RenderRelations = (props) => {
  const { node } = props;
  const { classes } = props;
  const { navigation} = props;

  return (
    <ExpansionPanel>
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
        <Typography gutterBottom className ={classes.heading}> <b>{ node.kind.toUpperCase() }:</b> { node.name } </Typography>
      </ExpansionPanelSummary> 
      <ExpansionPanelDetails>
        <ToggleVisibility visible={!node.origin}>
          <Typography>
            The  {node.kind.toLowerCase()} {node.name} is the result of the transformations and datasets below.
            {/* TODO: Find a better navigation Icon */}
            <ToggleVisibility visible={node.kind === "Dataset"}>
              <IconButton aria-label="Navigate"  onClick={() => navigation.selectDataset(node.id)}>
                <NavigationIcon />
              </IconButton>
            </ToggleVisibility>
          </Typography>
        </ToggleVisibility>
        <ToggleVisibility visible={node.origin}>
          <Typography>
            The {node.kind.toLowerCase()} {node.name} is the origin {node.kind.toLowerCase()} to the above branch of transformations, 
            it has no contributing transformations.
            <ToggleVisibility visible={node.kind === "Dataset"}>
              <IconButton aria-label="Navigate"  onClick={() => navigation.selectDataset(node.id)}>
                <NavigationIcon />
              </IconButton>
            </ToggleVisibility>
          </Typography>
        </ToggleVisibility>
      </ExpansionPanelDetails>
      { node.children.map(child => <RenderRelations node={child} key={child.id} classes={classes} navigation={navigation}/> )}
    </ExpansionPanel>
  )
};

const DatasetConnections = (props) => {
  const { id } = props.dataset
  const { classes} = props
  const { navigation} = props;
  
  return (
    <Query query={datasetConnectionsQuery} variables={{ id }}>
      {({ loading, error, data }) => {
        if (loading) return null
        if (error) return null
        const links = makeLinksAlternate(JSON.parse(data.dataset[0].connections))
        if ('original' in links[0]) {
          // Placeholder only if no

          return ( 
            <ExpansionPanel>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
              <Typography gutterBottom className ={classes.heading}> <b> DATASET:</b> { links[0].name } </Typography>
              </ExpansionPanelSummary> 
              <ExpansionPanelDetails>
              <Typography>
              This is an uploaded data source and does not have any dependant transformations. 
              </Typography>
            </ExpansionPanelDetails>
            </ExpansionPanel>)
        } 
        return <RenderRelations node={links[0]} classes={classes} navigation={navigation}/>
        
      }}

    </Query>
  )
};
DatasetConnections.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default compose(
  withDatasets,
  withNavigation,
  withStyles(styles)
)(DatasetConnections)
