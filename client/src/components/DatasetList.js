import React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";

class DatasetList extends React.Component {
  render() {
    const { selectDataset } = this.props

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
            <li key={id} onClick={(e) => selectDataset(id, e)}>{`${name}`}</li>
          ))}
        </ul>
      }}
    </Query>
  }
}

export default DatasetList