import React from 'react';
import { Query } from 'react-apollo';
import { datasetConnectionsQuery } from '../queries';

function makeLinks(queryResult) {
  let connections = queryResult
  console.log(connections)
  // This will ALWAYS end on a data set
  // it's also important to note that connections is sorted and 
  // is in order of current_data_set -> all transformations -> original data 
  // where there could be multiple links in between there in "all transformations" 
  // I should also note, that the order of all things will always be 
  // dataset -> transformation -> dataset -> transformation -> dataset etc 
  let startData = connections[0].connection.end.node 
  let startTransform = connections[0].connection.start.node
  let bigListOConnections = []
  let smallListOConnections = [startData]
 

  for (let i = 1; i < connections.length; i++) {
    for (let j = i; j < connections.length; j++){
        

    }
    

  }
  return bigListOConnections
    
}


const DatasetConnections = (props) => {
  const  id   = props.dataset.id
  console.log( id )
  return (
    <Query query={datasetConnectionsQuery} variables={{ id }}>
      {({ loading, error, data }) => {
        if (loading) return null
        if (error) return null
        console.log(data.dataset)
        console.log("hello")
        return null
      }}
       
    </Query>
  )
}


export default DatasetConnections //
