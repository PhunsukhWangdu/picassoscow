import React from 'react';
import PropTypes from 'prop-types';
import ExcelData, { ExcelDataConfig } from '../core/ExcelData';
import { Icon, Checkbox, Popover } from 'antd';
import isFunction from 'lodash/isFunction';
import isArray from 'lodash/isArray';
import { sort, deepEqual } from '../util';

interface IObject {
  [key: string]: any
}

interface TableRendererProps extends ExcelDataConfig {
  tableColorScaleGenerator: Function,
  tableOptions: IObject,
  onTableDidMount: Function,
}
interface TableRendererState {
  excelData: ExcelData,
  [key: string]: any,
}

// helper function for setting row/col-span in TableRenderer
const spanSize = function (arr: string[], i: number, j: number) {
  // arr[[femal, 222], [femal, 333]] i遍历到arr第几个属性 j属于col(row)Attrs的第几个属性
  let x;
  if (i !== 0) {
    let end = j, asc = end >= 0;
    let noDraw = true;
    for (
      x = 0;
      asc ? x <= end : x >= end;
      asc ? x++ : x--
    ) {
      if (arr[i - 1][x] !== arr[i][x]) {
        noDraw = false;
      }
    }
    if (noDraw) {
      return -1;
    }
  }
  let len = 0;
  while (i + len < arr.length) {
    let end1 = j, asc1 = end1 >= 0;
    let stop = false;
    for (
      x = 0;
      asc1 ? x <= end1 : x >= end1;
      asc1 ? x++ : x--
    ) {
      if (arr[i][x] !== arr[i + len][x]) {
        stop = true;
      }
    }
    if (stop) {
      break;
    }
    len++;
  }
  return len;
};

function redColorScaleGenerator(values: number[]) {
  const min = Math.min.apply(Math, values);
  const max = Math.max.apply(Math, values);
  return (x: number) => {
    // eslint-disable-next-line no-magic-numbers
    const R = 255 - Math.round((255 * (x - min)) / (max - min));
    const G = 255 - Math.round((123 * (x - min)) / (max - min));
    //return { backgroundColor: `rgb(255,${nonRed},${nonRed})` };
    return { backgroundColor: `rgb(${R},${G},255)` };
  };
}

// function redColorScaleGenerator(values: number[]) {
//   const min = Math.min.apply(Math, values);
//   const max = Math.max.apply(Math, values);
//   return (x: number) => {
//     // eslint-disable-next-line no-magic-numbers
//     const nonRed = 255 - Math.round((255 * (x - min)) / (max - min));
//     return { backgroundColor: `rgb(255,${nonRed},${nonRed})` };
//   };
// }

function makeRenderer(opts: IObject = {}) {

  class TableRenderer extends React.Component<TableRendererProps, TableRendererState> {

    static defaultProps = {
      ...ExcelData.defaultProps,
      tableColorScaleGenerator: redColorScaleGenerator,
      tableOptions: {},
    };

    constructor(props: TableRendererProps) {
      super(props)
      this.state = {
        excelData: new ExcelData(this.props),
        _preProps: this.props,
      }
    }

    getExcelDataInfo = () => {
      return this.state.excelData;
    }

    static getDerivedStateFromProps(props: TableRendererProps, state: TableRendererState) {
      if (deepEqual(state._preProps, props)) return state;
      return {
        excelData: new ExcelData(props),
        _preProps: props,
      }
    }

    filterPropertyValue = (val: any, key: string, checkable: boolean) => {
      const { excelData } = this.state;
      // 用useCallback 方法里永远拿不到新的state 只有dom里可以 所以excelData也是老的无法更新
      excelData.setValueFilter(key, val, checkable);
      this.setState({})
    }

    renderPropertyList = (list: string[], key: any) => {
      if (!isArray(list)) return null;
      return <div className="pvtLabelContent">
        {
          list.map(
            (val, idx) => <Checkbox key={idx} onChange={e => this.filterPropertyValue(val, key, e.target.checked)} defaultChecked>{val}</Checkbox>
          )
        }
      </div>
    }

    // 点击表格内容事件
    getClickHandler = (value: any, rowValues: any[], colValues: any[]) => {

      const { excelData } = this.state;
      const { cols: colAttrs = [], rows: rowAttrs = [], tableOptions } = this.props;
      const { clickCallback } = tableOptions || {};

      if (!isFunction(clickCallback)) return;

      const filters: IObject = {};
      // colValues rowValues[[femal, 中国]， [male, 美国]]
      colAttrs.forEach(
        (attr, idx) => {
          if(colValues[idx]) {
            filters[attr] = colValues[idx];
          }
        }
      )
      rowAttrs.forEach(
        (attr, idx) => {
          if(rowValues[idx]) {
            filters[attr] = rowValues[idx];
          }
        }
      )

      return (e: any) =>
        this.props.tableOptions.clickCallback(
          e,
          value,
          filters,
          excelData
        );
    }


    render() {
      const { excelData } = this.state;

      const colAttrs = this.props.cols || [];
      const rowAttrs = this.props.rows || [];
      const colKeys = excelData.getColKeys();
      const rowKeys = excelData.getRowKeys();

      const grandTotalAggregator = excelData.getAggregator([], []);

      let valueCellColors = (...args: any) => { return {} };
      let rowTotalColors = (...args: any) => { return {} };
      let colTotalColors = (...args: any) => { return {} };


      if (opts.heatmapMode) {
        const colorScaleGenerator = this.props.tableColorScaleGenerator;
        // colKeys [[femal, 222], [femal, 333]]
        const rowTotalValues = colKeys.map(x =>
          excelData.getAggregator([], x).value() // 统计total行每个列col的统计值
        );
        rowTotalColors = colorScaleGenerator(rowTotalValues); // [1,2,22]

        const colTotalValues = rowKeys.map(x =>
          excelData.getAggregator(x, []).value() // 统计total列每个行row的统计值
        );
        colTotalColors = colorScaleGenerator(colTotalValues); // [1,2,22]

        if (opts.heatmapMode === 'full') { // 全铺热力图
          const allValues: number[] = [];
          rowKeys.forEach(r =>
            colKeys.forEach(c =>
              allValues.push(excelData.getAggregator(r, c).value())
            )
          );
          const colorScale = colorScaleGenerator(allValues); // 表格内 
          valueCellColors = (r, c, v) => colorScale(v);
        } else if (opts.heatmapMode === 'row') { // row热力图
          const rowColorScales: IObject = {};
          rowKeys.map(r => {
            const rowValues = colKeys.map(x =>
              excelData.getAggregator(r, x).value()
            );
            rowColorScales[r] = colorScaleGenerator(rowValues);
          });
          valueCellColors = (r, c, v) => rowColorScales[r](v);
        } else if (opts.heatmapMode === 'col') { // col热力图
          const colColorScales: IObject = {};
          colKeys.map(c => {
            const colValues = rowKeys.map(x =>
              excelData.getAggregator(x, c).value()
            );
            colColorScales[c] = colorScaleGenerator(colValues);
          });
          valueCellColors = (r, c, v) => colColorScales[c](v);
        }
      }

      return (
        <table className="pvtTable">
          <thead>
            {colAttrs.map((c, idx) => { // colAttrs[国家，人数]
              // c 列属性, idx index
              return (
                <tr key={`colAttr${idx}`}>
                  {idx === 0 && rowAttrs.length !== 0 && (
                    <th colSpan={rowAttrs.length} rowSpan={colAttrs.length} /> // 预留出来行的title位置
                  )}
                  <th className="pvtAxisLabel">
                    <Popover content={this.renderPropertyList(excelData.getAllKeyVals()[c], c)} placement="right">
                      <span>{c}<Icon type="menu-unfold" /></span>
                    </Popover>
                  </th>
                  {colKeys.map(function (colKey, i) { // colKeys 列对应的值的多维数组 如国家：[[中国, 2], [美国,3], [法国,6]]
                    const x = spanSize(colKeys, i, idx);
                    if (x === -1) {
                      return null;
                    }
                    // colKey[idx] 中国、美国、法国；2，3，6
                    return (
                      <th
                        className="pvtColLabel"
                        key={`colKey${i}`}
                        colSpan={x}
                        rowSpan={
                          idx === colAttrs.length - 1 && rowAttrs.length !== 0
                            ? 2
                            : 1
                        }
                      >
                        {colKey[idx]}
                      </th>
                    );
                  })}
                  {idx === 0 && (
                    <th
                      className="pvtTotalLabel"
                      rowSpan={
                        colAttrs.length + (rowAttrs.length === 0 ? 0 : 1)
                      }
                    >
                      Totals
                    </th>
                  )}
                </tr>
              );
            })}
            {rowAttrs.length !== 0 && (
              <tr>
                {rowAttrs.map((r, i) => {
                  return (
                    <th className="pvtAxisLabel" key={`rowAttr${i}`}>
                      <Popover content={this.renderPropertyList(excelData.getAllKeyVals()[r], r)} placement="right">
                        <span>{r}<Icon type="menu-unfold" /></span>
                      </Popover>
                    </th>
                  );
                })}
                <th className="pvtTotalLabel">
                  {colAttrs.length === 0 ? 'Totals' : null}
                </th>
              </tr>
            )}
          </thead>
          <tbody>
            {rowKeys.map((rowKey, i) => {
              const totalAggregator = excelData.getAggregator(rowKey, []);
              return (
                <tr key={`rowKeyRow${i}`}>
                  {rowKey.map((txt: string, j: number) => {
                    const x = spanSize(rowKeys, i, j);
                    if (x === -1) {
                      return null;
                    }
                    return (
                      <th
                        key={`rowKeyLabel${i}-${j}`}
                        className="pvtRowLabel"
                        rowSpan={x}
                        colSpan={
                          j === rowAttrs.length - 1 && colAttrs.length !== 0
                            ? 2
                            : 1
                        }
                      >
                        {txt}
                      </th>
                    );
                  })}
                  {colKeys.map((colKey, j) => {
                    const aggregator = excelData.getAggregator(rowKey, colKey);// colKey[中国，盗卡] rowKey[8:00～9：00]
                    return (
                      <td
                        className="pvtVal"
                        key={`pvtVal${i}-${j}`}
                        onClick={this.getClickHandler(aggregator.value(), rowKey, colKey)}  // aggregator.value返回count总数
                        style={valueCellColors(
                          rowKey,
                          colKey,
                          aggregator.value()
                        )}
                      >
                        {aggregator.format(aggregator.value())}
                      </td>
                    );
                  })}
                  <td
                    className="pvtTotal"
                    onClick={this.getClickHandler(totalAggregator.value(), rowKey, [null])}
                    style={colTotalColors(totalAggregator.value())}
                  >
                    {totalAggregator.format(totalAggregator.value())}
                  </td>
                </tr>
              );
            })}

            <tr>
              <th
                className="pvtTotalLabel"
                colSpan={rowAttrs.length + (colAttrs.length === 0 ? 0 : 1)}
              >
                Totals
              </th>

              {colKeys.map( (colKey, i) => {
                const totalAggregator = excelData.getAggregator([], colKey);
                return (
                  <td
                    className="pvtTotal"
                    key={`total${i}`}
                    onClick={this.getClickHandler(totalAggregator.value(), [null], colKey)}
                    style={rowTotalColors(totalAggregator.value())}
                  >
                    {totalAggregator.format(totalAggregator.value())}
                  </td>
                );
              })}

              <td
                onClick={this.getClickHandler(grandTotalAggregator.value(), [null], [null])}
                className="pvtGrandTotal"
              >
                {grandTotalAggregator.format(grandTotalAggregator.value())}
              </td>
            </tr>
          </tbody>
        </table>
      );

    }

  }

  return TableRenderer;
}

export default {
  'Table Heatmap': makeRenderer({ heatmapMode: 'full' }),
  Table: makeRenderer(),
};
