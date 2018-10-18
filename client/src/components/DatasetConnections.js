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


function makeLinks(queryResult) {
  const connections = queryResult
  // TODO: rip off this https://stackoverflow.com/questions/45315108/javascript-union-pairs-union-find
  // OF NOTE: The chosen data set is _always_ the first data set
  // and they will return in order for linear transformation pathways
  // however, if you have branching transformations, the order after
  // your selected data set may not be in any distinct order .

  // build an array of all the ordered pairs

  const pairs = []
  // Build a set of pairs that we know are connected
  // but then we have to do some shenaningans in order
  // to see connections between those pairs
  for (var i = 0; i < connections.length; i++) {
    pairs.push([
      {
        id: connections[i].connection.end.node,
        type: connections[i].connection.end.kind,
        name: connections[i].connection.end.name
      },
      {
        id: connections[i].connection.start.node,
        type: connections[i].connection.start.kind,
        name: connections[i].connection.start.name
      }
    ])
  }

  // squish the list to only a list of nodes
  const temp_merged = [].concat.apply([], pairs);
  // Filter to just unique
  const set = new Set(temp_merged.map(item => JSON.stringify(item)));
  const merged = [...set].map(item => JSON.parse(item));
  // console.log(temp_merged)
  const nodeFriends = []
  let relations = []
  // TODO: This, but faster because currently you get hella
  // duplicates which is a sign that maybe you should not waste time
  // finding duplicates

  for (var i = 0; i < merged.length; i++) {
    nodeFriends = []
    for (let j = 0; j < pairs.length; j++) {
      if (merged[i].id == pairs[j][0].id) {
        nodeFriends.push(pairs[j][1])
      } else if (merged[i].id == pairs[j][1].id) {
        nodeFriends.push(pairs[j][0])
      }
    }

    const friendSet = new Set(nodeFriends.map(item => JSON.stringify(item)));
    let nodeFriends = [...friendSet].map(item => JSON.parse(item));
    relations.push({ node: merged[i], connectedTo: nodeFriends })
  }

  relations = new Set(relations.map(item => JSON.stringify(item)));
  relations = [...relations].map(item => JSON.parse(item));
  console.log(relations)
  return relations
}

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

function list_to_tree(list) {
  let map = {}; var node; var roots = []; var 
i;
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
}


function makeLinksAlternate(queryResult) {
  const len = queryResult.length
  let connected = []
  console.log(queryResult)
  for (let i = 0; i < len; i++) {
    if (queryResult[i].connection.type == 'INPUT') {
      connected.push({
        id: queryResult[i].connection.end.node,
        name: queryResult[i].connection.start.name,
        parent: queryResult[i].connection.start.node,
        children: null
      })
    } else if (queryResult[i].connection.type == 'OUTPUT') {
      connected.push({
        id: queryResult[i].connection.end.node,
        name: queryResult[i].connection.start.name,
        parent: queryResult[i].connection.start.node,
        children: null
      })
    } else {
      console.log('Unknown type')
      console.log(queryResult[i].connection)
    }
    // Be lazy and remove duplicates taht you didn't deal with earlier

    connected = new Set(connected.map(item => JSON.stringify(item)));
    connected = [...connected].map(item => JSON.parse(item));
    connected.unshift({
 id: queryResult[len - 1].connection.start.node,
      name: queryResult[len - 1].connection.start.name, 
      children:null
})
  } console.log(list_to_tree(connected))
}


const styles = theme => ({
  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
});

const DatasetConnections = (props) => {
  const { id } = props.dataset
  return (
    <Query query={datasetConnectionsQuery} variables={{ id }}>
      {({ loading, error, data }) => {
        if (loading) return null
        if (error) return null
        const links = makeLinksAlternate(JSON.parse(data.dataset[0].connections))
        console.log(links)
        // console.log(ExpansionSegment(links, 0))
        return null
      }}

    </Query>
  )
}


export default DatasetConnections //
