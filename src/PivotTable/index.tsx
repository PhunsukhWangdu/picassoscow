import React from 'react';
import PivotTableUI from './component/ExcelTable';
import 'react-pivottable/pivottable.css';
import TableRenderers from 'react-pivottable/TableRenderers';
import Plot from 'react-plotly.js';
import createPlotlyRenderers from 'react-pivottable/PlotlyRenderers';

import axios from 'axios';
import exampleData from './constant/tips';



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


  render() {
    const config = {
      rows: ['property-a', 'property-c'],
      cols: ['property-b'],
      hiddenAttributes: [],
      hiddenFromDragDrop: [],
      aggregatorName: 'Count',
      vals: ['property-a', 'property-b'],
    }
    return (
      <PivotTableUI
        {...config}
        data={exampleData.list}
        onChange={s => this.setState(s)}
        // renderers={Object.assign({}, TableRenderers, PlotlyRenderers)}
        {...this.state}
      />
    );
  }
}