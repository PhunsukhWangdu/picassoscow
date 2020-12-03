import React from 'react';
import PropTypes from 'prop-types';
import isObject from 'lodash/isObject';
import PivotTableUI from 'react-pivottable/PivotTableUI';
import 'react-pivottable/pivottable.css';
import TableRenderers from './TableRenderers';
import ExcelTableCore from './ExcelTableCore';
import Dropdown from './Dropdown';
import DraggableAttribute from './DraggableAttribute';
import { ReactSortable, Sortable } from 'react-sortablejs';
import Draggable from 'react-draggable';
import update from 'immutability-helper';
import Plot from 'react-plotly.js';
import createPlotlyRenderers from 'react-pivottable/PlotlyRenderers';

import axios from 'axios';
import { sort } from '../util';
import ExcelData, { ExcelDataConfig } from '../core/ExcelData';

// Sortable.mount(new MultiDrag(), new Swap()); // , MultiDrag, Swap

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

const sortIcons: IObject = {
  key_a_to_z: {
    rowSymbol: '↕',
    colSymbol: '↔',
    next: 'value_a_to_z', // 表示用户点击↕ ↔后应用的排序方式value_a_to_z
  },
  value_a_to_z: {
    rowSymbol: '↓',
    colSymbol: '→',
    next: 'value_z_to_a', // 表示用户点击↓ →后应用的排序方式value_z_to_a
  },
  value_z_to_a: {
    rowSymbol: '↑',
    colSymbol: '←',
    next: 'key_a_to_z'
  },
};


export default class ExcelTable extends React.Component<ExcelTableProps, ExcelTableState> {

  tableContentRef = React.createRef();

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
      attrValues: {},
      unusedOrder: [],
      zIndices: {}, // zIndex
    };
  }

  static getDerivedStateFromProps(props: ExcelTableProps, state: ExcelTableState) {
    // if(deepEqual(state._preData, props.data)) return state;
    // console.log(ExcelData.forEachRecord(props.data.list, { id: (record: any) => `test_id_${record.id}`}))
    return {
      data: ExcelData.forEachRecord(
        props.data,
        //{ id: (record: any) => `test_id_${record.id}` }, // 构造原始数据使用 
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

    // const excelData = new ExcelData;

    // ExcelData.forEachRecord(
    //   nextData,
    //   this.props.derivedAttributes,
    //   function (record: { [key: string]: string }) {
    //     if (!isObject(record)) return
    //     materializedInput.push(record);
    //     // Object.keys(record).forEach(
    //     //   key => {
    //     //     if (!Object.keys(attrValues).includes(key)) attrValues[key] = {};
    //     //     const value = record[key];
    //     //     attrValues[key][value] = (attrValues[key][value] || []).concat(record); // attrValues: { a: { 1: [a:1的那些数据]}}
    //     //   }
    //     // )
    //   }
    // );

    this.setState({
      ...this.state,
      data: nextData,
      attrValues: {},
      materializedInput,
    });
  }

  // 渲染属性拖拽区域
  makeDnDCell(items, onChange, classes) {
    //  console.log(items)
    return (
      <ReactSortable //做属性row col拖拽
        // multiDrag // enables mutidrag
        // OR
        // swap // enables swap
        // options={{
        //   group: 'shared',
        //   ghostClass: 'pvtPlaceholder',
        //   filter: '.pvtFilterBox',
        //   preventOnFilter: false,
        // }}
        {
        ...{
          group: 'shared',
          ghostClass: 'pvtPlaceholder',
          filter: '.pvtFilterBox',
          preventOnFilter: false,
        }
        }
        tag="td"
        className={classes}
        // onChange={onChange}
        list={items.map(v => ({ id: v, selected: true }))}
        setList={(newState) => {
          // console.log(classes, newState)
          // debugger
          onChange(newState.map(v => v.id))
          // this.setState({ list: newState })
        }}
      >
        {items.map((x, idx) => (
          <DraggableAttribute
            name={x}
            key={idx}
            attrValues={this.state.attrValues[x]}
            valueFilter={this.props.valueFilter[x] || {}}
            sorter={sort.getSort(this.props.sorters, x)}
            menuLimit={this.props.menuLimit}
            setValuesInFilter={this.setValuesInFilter.bind(this)}
            addValuesToFilter={this.addValuesToFilter.bind(this)}
            moveFilterBoxToTop={this.moveFilterBoxToTop.bind(this)}
            removeValuesFromFilter={this.removeValuesFromFilter.bind(this)}
            zIndex={this.state.zIndices[x] || this.state.maxZIndex}
          />
        ))}
      </ReactSortable>
    );
  }

  sendPropUpdate(command: IObject) {
    this.props.onChange(update(this.props, command));
  }

  propUpdater(key: string | number) {
    return (value: any) => this.sendPropUpdate({ [key]: { $set: value } });
  }

  // 当前展开的下拉列表
  isOpen(dropdown: string) {
    return this.state.openDropdown === dropdown;
  }

  updateTableData = (excelData: IObject) => {
    debugger
    this.setState({
      ...this.state,
      attrValues: excelData ? excelData.getAllKeyVals() : {},
      materializedInput: excelData ? excelData.getAllKeyVals() : {},
    });
  }

  setValuesInFilter(attribute, values) {
    this.sendPropUpdate({
      valueFilter: {
        [attribute]: {
          $set: values.reduce((r, v) => {
            r[v] = true;
            return r;
          }, {}),
        },
      },
    });
  }

  addValuesToFilter(attribute, values) {
    if (attribute in this.props.valueFilter) {
      this.sendPropUpdate({
        valueFilter: {
          [attribute]: values.reduce((r, v) => {
            r[v] = { $set: true };
            return r;
          }, {}),
        },
      });
    } else {
      this.setValuesInFilter(attribute, values);
    }
  }

  removeValuesFromFilter(attribute, values) {
    this.sendPropUpdate({
      valueFilter: { [attribute]: { $unset: values } },
    });
  }

  moveFilterBoxToTop(attribute) {
    this.setState(
      update(this.state, {
        maxZIndex: { $set: this.state.maxZIndex + 1 },
        zIndices: { [attribute]: { $set: this.state.maxZIndex + 1 } },
      })
    );
  }

  render() {
    const numValsAllowed = this.props.aggregators[this.props.aggregatorName]([])().numInputs || 0;
    this.props.aggregators[this.props.aggregatorName]([])().numInputs || 0; // 统计方法需要的入参选择

    const aggregatorCellOutlet = this.props.aggregators[
      this.props.aggregatorName
    ]([])().outlet;

    // 展示方式切换
    const rendererName =
      this.props.rendererName in this.props.renderers
        ? this.props.rendererName
        : Object.keys(this.props.renderers)[0];

    const rendererCell = (
      <td className="pvtRenderers">
        <Dropdown
          current={rendererName}
          values={Object.keys(this.props.renderers)}
          open={this.isOpen('renderer')}
          zIndex={this.isOpen('renderer') ? this.state.maxZIndex + 1 : 1}
          toggle={() =>
            this.setState({
              openDropdown: this.isOpen('renderer') ? false : 'renderer',
            })
          }
          setValue={this.propUpdater('rendererName')}
        />
      </td>
    );

    // 可拖拽属性列表合集
    const unusedAttrs = Object.keys(this.state.attrValues)
      .filter(
        e =>
          !this.props.rows.includes(e) &&
          !this.props.cols.includes(e) &&
          !this.props.hiddenAttributes.includes(e) &&
          !this.props.hiddenFromDragDrop.includes(e)
      )
      .sort(sort.sortAs(this.state.unusedOrder));

    const unusedLength = unusedAttrs.reduce((r, e) => r + e.length, 0);
    const horizUnused = unusedLength < this.props.unusedOrientationCutoff;

    const unusedAttrsCell = this.makeDnDCell(
      unusedAttrs,
      order => {
        console.log(order)
        let attrValues = {};
        order.forEach(
          (item, i) => {attrValues[item] = i}
        )
        // this.setState({ attrValues })
        // this.setState({ unusedOrder: order })
      },
      `pvtAxisContainer pvtUnused ${horizUnused ? 'pvtHorizList' : 'pvtVertList'
      }`
    );


    // 绘制左侧行属性 拖拽区域
    const rowAttrs = this.props.rows.filter(
      (row: string) =>
        !this.props.hiddenAttributes.includes(row) &&
        !this.props.hiddenFromDragDrop.includes(row)
    );

    // console.log(rowAttrs, 'rowAttrs')
    const rowAttrsCell = this.makeDnDCell(
      rowAttrs,
      this.propUpdater('rows'),
      'pvtAxisContainer pvtVertList pvtRows'
    );

    // 绘制上侧列属性 拖拽区域
    const colAttrs = this.props.cols.filter(
      (col: string) =>
        !this.props.hiddenAttributes.includes(col) &&
        !this.props.hiddenFromDragDrop.includes(col)
    );

    // console.log(colAttrs, 'colAttrs')
    const colAttrsCell = this.makeDnDCell(
      colAttrs,
      this.propUpdater('cols'),
      'pvtAxisContainer pvtVertList pvtCols'
    );

    // 绘制左上角方法选择列表
    const aggregatorCell = (
      <td className="pvtVals">
        <Dropdown
          current={this.props.aggregatorName}
          values={Object.keys(this.props.aggregators)}
          open={this.isOpen('aggregators')}
          zIndex={this.isOpen('aggregators') ? this.state.maxZIndex + 1 : 1}
          toggle={() =>
            this.setState({
              openDropdown: this.isOpen('aggregators') ? false : 'aggregators',
            })
          }
          setValue={this.propUpdater('aggregatorName')}
        />
        <a
          role="button"
          className="pvtRowOrder"
          onClick={() =>
            this.propUpdater('rowOrder')(sortIcons[this.props.rowOrder].next) // rowOrder: 'key_a_to_z' 点击后切换为下一个排序方式
          }
        >
          {sortIcons[this.props.rowOrder].rowSymbol}
        </a>
        <a
          role="button"
          className="pvtColOrder"
          onClick={() =>
            this.propUpdater('colOrder')(sortIcons[this.props.colOrder].next) // 点击后切换为下一个排序方式
          }
        >
          {sortIcons[this.props.colOrder].colSymbol}
        </a>
        {numValsAllowed > 0 && <br />}
        {new Array(numValsAllowed).fill("").map((n, i) => [ // 创建numValsAllowed（统计方法需要的入参个数）长度的数组
          <Dropdown
            key={i}
            current={this.props.vals[i]} //传给聚合器的属性
            values={Object.keys(this.state.attrValues).filter(
              e =>
                !this.props.hiddenAttributes.includes(e) &&
                !this.props.hiddenFromAggregators.includes(e)
            )}
            open={this.isOpen(`val${i}`)}
            zIndex={this.isOpen(`val${i}`) ? this.state.maxZIndex + 1 : 1}
            toggle={() =>
              this.setState({
                openDropdown: this.isOpen(`val${i}`) ? false : `val${i}`,
              })
            }
            setValue={value =>
              this.sendPropUpdate({
                vals: { $splice: [[i, 1, value]] },
              })
            }
          />,
          i + 1 !== numValsAllowed ? <br key={`br${i}`} /> : null,
        ])}
        {aggregatorCellOutlet && aggregatorCellOutlet(this.props.data)}
      </td>
    );

    return (
      <table className="pvtUi">
        <tbody onClick={() => this.setState({ openDropdown: false })}>
          <tr>
            {rendererCell}
            {unusedAttrsCell}
          </tr>
          <tr>
            {aggregatorCell}
            {colAttrsCell}
          </tr>
          <tr>
            {rowAttrsCell}
            <ExcelTableCore
              {...this.props}
              onTableDidMount={this.updateTableData}
              data={this.state.data}
            />
          </tr>
        </tbody>
      </table>
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