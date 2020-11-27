import React from 'react';
import PropTypes from 'prop-types';
import PivotTableUI from 'react-pivottable/PivotTableUI';
import 'react-pivottable/pivottable.css';
import TableRenderers from 'react-pivottable/TableRenderers';
import Plot from 'react-plotly.js';
import createPlotlyRenderers from 'react-pivottable/PlotlyRenderers';

import axios from 'axios';
import { deepEqual } from '../util';
import ExcelData from '../core/ExcelData';



// create Plotly renderers via dependency injection
const PlotlyRenderers = createPlotlyRenderers(Plot);


export default class ExcelTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tableList: ''
    };
  }

  static getDerivedStateFromProps(props, state) {
    // if(deepEqual(state._preData, props.data)) return state;
    console.log(ExcelData.forEachRecord(props.data.list))
    return {
      data: ExcelData.forEachRecord(props.data),
      _preData: props.data,
    }
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

ExcelTable.propTypes = {
  data: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.func])
    .isRequired,
  aggregatorName: PropTypes.string,
  cols: PropTypes.arrayOf(PropTypes.string),
  rows: PropTypes.arrayOf(PropTypes.string),
  vals: PropTypes.arrayOf(PropTypes.string),
  valueFilter: PropTypes.objectOf(PropTypes.objectOf(PropTypes.bool)),
  sorters: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.objectOf(PropTypes.func),
  ]),
  derivedAttributes: PropTypes.objectOf(PropTypes.func),
  rowOrder: PropTypes.oneOf(['key_a_to_z', 'value_a_to_z', 'value_z_to_a']),
  colOrder: PropTypes.oneOf(['key_a_to_z', 'value_a_to_z', 'value_z_to_a']),
};