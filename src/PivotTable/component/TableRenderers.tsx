import React from 'react';
import PropTypes from 'prop-types';
import ExcelData, { ExcelDataConfig } from '../core/ExcelData';
import { Icon, Checkbox, Popover } from 'antd';
import isFunction from 'lodash/isFunction';
import isArray from 'lodash/isArray';

interface IObject {
  [key: string]: any
}

interface TableRendererProps extends ExcelDataConfig {
  tableColorScaleGenerator: Function,
  tableOptions: IObject,
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

function redColorScaleGenerator(values) {
  const min = Math.min.apply(Math, values);
  const max = Math.max.apply(Math, values);
  return x => {
    // eslint-disable-next-line no-magic-numbers
    const nonRed = 255 - Math.round((255 * (x - min)) / (max - min));
    return { backgroundColor: `rgb(255,${nonRed},${nonRed})` };
  };
}

function makeRenderer(opts: IObject = {}) {
  const defaultProps = {
    ...ExcelData.defaultProps,
    tableColorScaleGenerator: redColorScaleGenerator,
    tableOptions: {},
  };

  const TableRenderer = (props: TableRendererProps) => {

    const [excelData, setExcelData] = React.useState(new ExcelData(props));
    const [colKeys, setColKeys] = React.useState(excelData.getColKeys());
    const [rowKeys, setRowKeys] = React.useState(excelData.getRowKeys());

    const colAttrs = props.cols;
    const rowAttrs = props.rows;

    console.log(rowAttrs, 'rows')
    // const colKeys = excelData.getColKeys();
    // const rowKeys = excelData.getRowKeys();

    
    const grandTotalAggregator = excelData.getAggregator([], []);

    let valueCellColors = (...args:any) => { return {} };
    let rowTotalColors = (...args:any) => { return {} };
    let colTotalColors = (...args:any) => { return {} };

    const filterPropertyValue = React.useCallback(
      (val, key: string, checkable) => {
        // 用useCallback 方法里永远拿不到新的state 只有dom里可以 所以excelData也是老的无法更新
        debugger
        // excelData[cate === 'row' ? 'setFilterRowVals' : 'setFilterColVals'](key, val);
        // setValueFilter(Math.random())
        // console.log(valueFilter)
        excelData.setValueFilter(key, val, checkable)
        setColKeys(excelData.getColKeys());
        setRowKeys(excelData.getRowKeys());
        console.log(excelData.getColKeys(), excelData.getRowKeys())

        // setRowFilterVals()
      },
      [],
    );

    const renderPropertyList = React.useCallback(
      (list, key) => {
        if(!isArray(list)) return null;
        return <div className="pvtLabelContent">
          {
            list.map(
              val => <Checkbox onChange={e => filterPropertyValue(val, key, e.target.checked)} defaultChecked>{val}</Checkbox>
            )
          }
        </div>
      },
      [],
    );

    if (opts.heatmapMode) {
      const colorScaleGenerator = this.props.tableColorScaleGenerator;
      const rowTotalValues = colKeys.map(x =>
        excelData.getAggregator([], x).value()
      );
      rowTotalColors = colorScaleGenerator(rowTotalValues);
      const colTotalValues = rowKeys.map(x =>
        excelData.getAggregator(x, []).value()
      );
      colTotalColors = colorScaleGenerator(colTotalValues);

      if (opts.heatmapMode === 'full') {
        const allValues = [];
        rowKeys.map(r =>
          colKeys.map(c =>
            allValues.push(excelData.getAggregator(r, c).value())
          )
        );
        const colorScale = colorScaleGenerator(allValues);
        valueCellColors = (r, c, v) => colorScale(v);
      } else if (opts.heatmapMode === 'row') {
        const rowColorScales = {};
        rowKeys.map(r => {
          const rowValues = colKeys.map(x =>
            excelData.getAggregator(r, x).value()
          );
          rowColorScales[r] = colorScaleGenerator(rowValues);
        });
        valueCellColors = (r, c, v) => rowColorScales[r](v);
      } else if (opts.heatmapMode === 'col') {
        const colColorScales = {};
        colKeys.map(c => {
          const colValues = rowKeys.map(x =>
            excelData.getAggregator(x, c).value()
          );
          colColorScales[c] = colorScaleGenerator(colValues);
        });
        valueCellColors = (r, c, v) => colColorScales[c](v);
      }
    }

    const getClickHandler = React.useCallback(
      (value, rowValues, colValues) => {
        const callback = props.tableOptions.clickCallback;
        if(!isFunction(callback)) return;

        const filters = {};
        colAttrs.forEach( // colAttrs有哪些列
          (colattr, idx) => {
            if(!colValues[idx]) return;
          }
        )
        for (const i of Object.keys(colAttrs || {})) {
          const attr = colAttrs[i];
          if (colValues[i] !== null) {
            filters[attr] = colValues[i];
          }
        }
        for (const i of Object.keys(rowAttrs || {})) {
          const attr = rowAttrs[i];
          if (rowValues[i] !== null) {
            filters[attr] = rowValues[i];
          }
        }
        return e =>
          callback(
            e,
            value,
            filters,
            excelData
          );
      },
      [ props.tableOptions && props.tableOptions.clickCallback ]
    )
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
                  <Popover content={renderPropertyList(excelData.getAllKeyVals()[c], c)} placement="right">
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
                    <Popover content={renderPropertyList(excelData.getAllKeyVals()[r], r)} placement="right">
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
                {rowKey.map((txt, j) => {
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
                {colKeys.map(function (colKey, j) {
                  const aggregator = excelData.getAggregator(rowKey, colKey);// colKey[中国，盗卡] rowKey[8:00～9：00]
                  return (
                    <td
                      className="pvtVal"
                      key={`pvtVal${i}-${j}`}
                      onClick={getClickHandler(aggregator.value(), rowKey, colKey)}  // aggregator.value返回count总数
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
                  onClick={
                    getClickHandler &&
                    getClickHandler(totalAggregator.value(), rowKey, [null])
                  }
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

            {colKeys.map(function (colKey, i) {
              const totalAggregator = excelData.getAggregator([], colKey);
              return (
                <td
                  className="pvtTotal"
                  key={`total${i}`}
                  onClick={
                    getClickHandler &&
                    getClickHandler(totalAggregator.value(), [null], colKey)
                  }
                  style={rowTotalColors(totalAggregator.value())}
                >
                  {totalAggregator.format(totalAggregator.value())}
                </td>
              );
            })}

            <td
              onClick={
                getClickHandler &&
                getClickHandler(grandTotalAggregator.value(), [null], [null])
              }
              className="pvtGrandTotal"
            >
              {grandTotalAggregator.format(grandTotalAggregator.value())}
            </td>
          </tr>
        </tbody>
      </table>
    );


  }
  return TableRenderer;
}

export default {
  Table: makeRenderer(),
  'Table Heatmap': makeRenderer({heatmapMode: 'full'}),
};
