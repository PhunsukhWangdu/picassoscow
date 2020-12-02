import React from 'react';
import PivotTableUI from './component/ExcelTable';
import './pivottable.css';
import 'antd/dist/antd.css';
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
      rows: ['国家', '事件类型'],
      cols: ['时间段', '卡号'],
      hiddenAttributes: [],
      hiddenFromDragDrop: [],
      aggregatorName: 'Count',
      vals: ['property-a', 'property-b'],
      tableOptions: {
        clickCallback: function (e, value, filters, pivotData) {
          var names = [];
          pivotData.forEachMatchingRecord(filters, (record: object) => {
            names.push(record['国家']);
          });
          alert(names.join('\n'));
        },
      },
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