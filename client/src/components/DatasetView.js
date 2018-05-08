import React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";

class DatasetView extends React.Component {
  render() {
    if (!this.props.id) return <div></div>

    return <Query
      query={gql`
        {
          dataset(id: ${this.props.id}) {
            id,
            name
          }
        }
      `}
    >
      {({ loading, error, data }) => {
        if (loading) return <p>Loading...</p>;
        if (error) return <p>Error!</p>;

        const { id, name } = data.dataset[0]

        return <div>
          <p>Dataset: {name}</p>
          <p>ID: {id}</p>
        </div>
      }}
    </Query>
  }
}

export default DatasetView