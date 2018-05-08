import React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";

class DatasetList extends React.Component {
  render() {
    return <Query
      query={gql`
        {
          dataset {
            id,
            name
          }
        }
      `}
    >
      {({ loading, error, data }) => {
        if (loading) return <p>Loading...</p>;
        if (error) return <p>Error!</p>;

        return <ul>
          {data.dataset.map(({ id, name }) => (
            <li key={id}>{`${name}`}</li>
          ))}
        </ul>
      }}
    </Query>
  }
}

export default DatasetList