import React from 'react';
import PropTypes from 'prop-types';
import isObject from 'lodash/isObject';
import PivotTableUI from 'react-pivottable/PivotTableUI';
import 'react-pivottable/pivottable.css';
import TableRenderers from './TableRenderers';
import ExcelTableCore from './ExcelTableCore';
import Sortable, { ReactSortable } from 'react-sortablejs';
import Draggable from 'react-draggable';
import update from 'immutability-helper';
import Plot from 'react-plotly.js';
import createPlotlyRenderers from 'react-pivottable/PlotlyRenderers';

import axios from 'axios';
import { deepEqual } from '../util';
import ExcelData from '../core/ExcelData';

interface IObject {
  [key: string]: any
}

// create Plotly renderers via dependency injection
// const PlotlyRenderers = createPlotlyRenderers(Plot);

interface ExcelTableProps {
  data: object[],
  derivedAttributes?: object,
  [key: string]: any,
}
interface ExcelTableState {
  data: object[],
  tableList: object[],
  materializedInput: object[],
  [key: string]: any,
}



export default class ExcelTable extends React.Component<ExcelTableProps, ExcelTableState> {

  // cfg: ExcelTableProps & { [key: string]: any };
  static defaultProps = {
    ...ExcelTableCore.defaultProps,
    rendererName: 'Table',
    renderers: TableRenderers,
    hiddenAttributes: [],
    hiddenFromAggregators: [],
    hiddenFromDragDrop: [],
    unusedOrientationCutoff: 85,
    menuLimit: 500,
  }

  constructor(props: ExcelTableProps) {
    super(props);
    this.state = {
      tableList: [],
      materializedInput: [],
      data: [],
    };
  }

  static getDerivedStateFromProps(props: ExcelTableProps, state: ExcelTableState) {
    // if(deepEqual(state._preData, props.data)) return state;
    // console.log(ExcelData.forEachRecord(props.data.list, { id: (record: any) => `test_id_${record.id}`}))
    return {
      data: ExcelData.forEachRecord(
        props.data,
        { id: (record: any) => `test_id_${record.id}` },
        // record => { console.log(record, '测试构造数据回传 当前上下文使用')}
      ),
      _preData: props.data,
    }
  }

  componentDidMount() {
    this.materializeInput(this.props.data);
  }

  materializeInput(nextData: object[]) {
    if (this.state.data === nextData) {
      return;
    }

    let attrValues: IObject = {}; // 数据所有key以及该对应值的原始数据map
    let materializedInput: IObject[] = []; // 储存符合标准的数据

    ExcelData.forEachRecord(
      nextData,
      this.props.derivedAttributes,
      function (record: { [key: string]: string }) {
        if (!isObject(record)) return
        materializedInput.push(record);
        Object.keys(record).forEach(
          key => {
            if (!Object.keys(attrValues).includes(key)) attrValues[key] = {};
            const value = record[key];
            attrValues[key][value] = (attrValues[key][value] || []).concat(record); // attrValues: { a: { 1: [a:1的那些数据]}}
          }
        )
      }
    );

    this.setState({
      ...this.state,
      data: nextData,
      attrValues,
      materializedInput,
    });
  }

  // 渲染
  makeDnDCell(items, onChange, classes) {
    return (
      <ReactSortable //做属性row col拖拽
        options={{
          group: 'shared',
          ghostClass: 'pvtPlaceholder',
          filter: '.pvtFilterBox',
          // preventOnFilter: false,
        }}
        tag="td"
        className={classes}
        // onChange={onChange}
        list={items.map(v => ({id:v}))}
        setList={(newState) => {
          // console.log('1',newState)
          onChange(newState.map(v => v.id))
          // this.setState({ list: newState })
        }}
      >
        {items.map(x => (
         <div key={x}>{x}</div>
        ))}
      </ReactSortable>
    );
  }

  sendPropUpdate(command: IObject) {
    this.props.onChange(update(this.props, command));
  }

  propUpdater(key: string | number) {
    return (value: any) => this.sendPropUpdate({[key]: {$set: value}});
  }

  render() {
    const numValsAllowed = this.props.aggregators[this.props.aggregatorName]([])().numInputs || 0;
    this.props.aggregators[this.props.aggregatorName]([])().numInputs || 0;

    console.log(this.props)
    // 绘制左侧行属性 拖拽区域
    const rowAttrs = this.props.rows.filter(
      (row: string) =>
        !this.props.hiddenAttributes.includes(row) &&
        !this.props.hiddenFromDragDrop.includes(row)
    );
    const rowAttrsCell = this.makeDnDCell(
      rowAttrs,
      this.propUpdater('rows'),
      'pvtAxisContainer pvtVertList pvtRows'
    );

    return (
      <div>
        {rowAttrsCell}
        <ExcelTableCore
          {...this.props}
          data={this.state.data}
        />
      </div>
    )
  }
}

// ExcelTable.propTypes = {
//   data: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.func])
//     .isRequired,
//   aggregatorName: PropTypes.string,
//   cols: PropTypes.arrayOf(PropTypes.string),
//   rows: PropTypes.arrayOf(PropTypes.string),
//   vals: PropTypes.arrayOf(PropTypes.string),
//   valueFilter: PropTypes.objectOf(PropTypes.objectOf(PropTypes.bool)),
//   sorters: PropTypes.oneOfType([
//     PropTypes.func,
//     PropTypes.objectOf(PropTypes.func),
//   ]),
//   derivedAttributes: PropTypes.objectOf(PropTypes.func),
//   rowOrder: PropTypes.oneOf(['key_a_to_z', 'value_a_to_z', 'value_z_to_a']),
//   colOrder: PropTypes.oneOf(['key_a_to_z', 'value_a_to_z', 'value_z_to_a']),
// };