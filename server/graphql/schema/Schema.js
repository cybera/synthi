const graphql = require('graphql')

class Dataset {
  /**
  * Dataset constructor
  * @param {String} name Text that describes the name of the dataset
  */
  constructor(name) {
    this.id = ++Dataset.counter;
    this.name = name;
  }
}
// counter of instances
Dataset.counter = 0;

const fakeDatabase = {};
// fill the fakeDatabase with some datasets
(function() {
  const datasets = ["weather", "crime", "demographics"];
  datasets.map(dataset => {
    const newDataset = new Dataset(dataset);
    fakeDatabase[newDataset.id] = newDataset
  });
})()

// define the Dataset type for graphql
const DatasetType = new graphql.GraphQLObjectType({
  name: 'dataset',
  description: 'a dataset item',
  fields: {
    id: {type: graphql.GraphQLInt},
    name: {type: graphql.GraphQLString}
  }
})

// define the queries of the graphql Schema
const query = new graphql.GraphQLObjectType({
  name: 'DatasetQuery',
  fields: {
    dataset: {
      type: new graphql.GraphQLList(DatasetType),
      args: {
        id: {
          type: graphql.GraphQLInt
        }
      },
      resolve: (_, {id}) => {
        if (id) return [fakeDatabase[id]];
        return Object.values(fakeDatabase);
      }
    }
  }
})

// define the mutations of the graphql Schema
const mutation = new graphql.GraphQLObjectType({
  name: 'DatasetMutation',
  fields: {
    createDataset: {
      type: new graphql.GraphQLList(DatasetType),
      args: {
        name: {
          type: new graphql.GraphQLNonNull(graphql.GraphQLString)
        }
      },
      resolve: (_, {name}) => {
        const newDataset = new Dataset(name);
        fakeDatabase[newDataset.id] = newDataset;
        return Object.values(fakeDatabase);
      }
    },
    deleteDataset: {
      type: new graphql.GraphQLList(DatasetType),
      args: {
        id: {
          type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
        }
      },
      resolve: (_, {id}) => {
        delete fakeDatabase[id];
        return Object.values(fakeDatabase);
      }
    }
  }
})

// creates and exports the GraphQL Schema
module.exports = new graphql.GraphQLSchema({
  query,
  mutation
})

