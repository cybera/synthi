import React, {Component} from 'react';
import plotly from 'plotly.js/dist/plotly';
import PlotlyEditor from 'react-chart-editor';
import 'react-chart-editor/lib/react-chart-editor.css';
import gql from "graphql-tag";

import Button from 'material-ui/Button';
import { createPlotMutation, plotsRetrieveQuery } from '../queries'

import { graphql } from 'react-apollo'
const savePlot = graphql(createPlotMutation)
import { Mutation } from "react-apollo";

// TODO: Should do better data parsing on the way in
function toRealType(x) {
  if (isNaN(x)) {
    return x;
  } else {
    if (x % 1 === 0) {
      return parseInt(x);
    } else {
      return parseFloat(x);
    }
  }
  return n % 1 === 0;
}

const dataSources = {
  col1: ['Jan', 'Feb', 'Mar'], // eslint-disable-line no-magic-numbers
  col2: [1, 2, 3],
  col3: [4, 3, 2], // eslint-disable-line no-magic-numbers
  col4: [17, 13, 9], // eslint-disable-line no-magic-numbers
  col5: ['blue'],
  col6: ['yellow', 'green', 'yellow'],
};

const dataSourceOptions = Object.keys(dataSources).map(name => ({
  value: name,
  label: name,
}));

const config = {editable: true};

class ChartEditor extends Component {
  constructor(props, context) {
    super();

    const { dataset, apolloClient } = props

    this.state = {
      data: [],
      layout: {},
      frames: [],
      currentMockIndex: -1,
      mocks: [],
      // why?
      dataSourceOptions: dataSourceOptions,
      dataSources: dataSources
    };

    this.loadMock = this.loadMock.bind(this);
    this.apolloClient = apolloClient;
  }

  handleSave = () => {
    console.log(this.state.data)
    console.log(this.state.layout)
    savePlot({variables: {
      data: JSON.stringify(this.state.data),
      layout: JSON.stringify(this.state.layout)
    }})
  }

  componentWillMount() {
    this.apolloClient.query({
      query: gql`
      query($id: Int) {
        dataset(id:$id) { 
          id
          name 
          columns { 
            id 
            name 
            order 
          }
          rows
        } 
      }`, 
      variables:{id:this.props.dataset}
    }).then(r => {
      console.log(r)
      const currentDataset = r.data.dataset[0]

      let columns = {}

      currentDataset.columns
        .slice(0) // dup the array to avoid modification error during sort
        .sort((a,b) => a.order - b.order)
        .forEach(c => columns[c.name] = [])

      currentDataset.rows.forEach(s => {
        const record = JSON.parse(s)
        Object.keys(record).forEach(k => columns[k].push(toRealType(record[k])))
      })

      const columnOptions = Object.keys(columns).map(name => ({
        value: name,
        label: name,
      }));

      this.setState({
        layout: { 
          title: currentDataset.name
        },
        dataSources: columns,
        dataSourceOptions: columnOptions
      })
      console.log(currentDataset)
    })

    fetch(
      'https://api.github.com/repos/plotly/plotly.js/contents/test/image/mocks'
    )
      .then(response => response.json())
      .then(mocks => this.setState({mocks}));
  }

  loadMock(mockIndex) {
    const mock = this.state.mocks[mockIndex];
    fetch(mock.url, {
      headers: new Headers({Accept: 'application/vnd.github.v3.raw'}),
    })
      .then(response => response.json())
      .then(figure => {
        this.setState({
          currentMockIndex: mockIndex,
          data: figure.data,
          layout: figure.layout,
          frames: figure.frames,
        });
      });
  }

  render() {
    return (
      <Mutation mutation={createPlotMutation} refetchQueries={[{ query: plotsRetrieveQuery }]}>
        { createPlot => (
        <div className="app">
          <PlotlyEditor
            data={this.state.data}
            layout={this.state.layout}
            config={config}
            frames={this.state.frames}
            dataSources={this.state.dataSources}
            dataSourceOptions={this.state.dataSourceOptions}
            plotly={plotly}
            onUpdate={(data, layout, frames) =>
              this.setState({data, layout, frames})
            }
            useResizeHandler
            debug
            advancedTraceTypeSelector
          />
          <Button type='submit' color="primary" onClick={
            e => createPlot({variables: { data: JSON.stringify(this.state.data), 
                                          layout: JSON.stringify(this.state.layout) }})
          }>
            Save Plot
          </Button>
        </div>
        )}
      </Mutation>
    );
  }
}

export default ChartEditor;