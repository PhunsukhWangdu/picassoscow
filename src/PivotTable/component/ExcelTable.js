import React from 'react';
import PivotTableUI from 'react-pivottable/PivotTableUI';
import 'react-pivottable/pivottable.css';
import TableRenderers from 'react-pivottable/TableRenderers';
import Plot from 'react-plotly.js';
import createPlotlyRenderers from 'react-pivottable/PlotlyRenderers';

import axios from 'axios';
import { deepEqual } from '../util';



// create Plotly renderers via dependency injection
const PlotlyRenderers = createPlotlyRenderers(Plot);

// see documentation for supported input formats
const data = [['attr1', 'attr2'],
['1', '2'],
['3', '4'],];

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tableList: ''
    };
  }

  static getDerivedStateFromProps(props, state) {
    if(deepEqual(state.preData, props.data)) return state;
    return state;
  }

  componentDidMount() {
  }

  render() {
    console.log(this.props.data)
    return (
      <div></div>
    )
  }
}