import React from 'react';
import PropTypes from 'prop-types';
import ExcelData, { ExcelDataConfig } from '../core/ExcelData';
import { Icon, Checkbox, Popover } from 'antd';

interface TableRendererProps extends ExcelDataConfig {
  tableColorScaleGenerator: Function,
  tableOptions: object,
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

function makeRenderer(opts = {}) {
  class TableRenderer extends React.PureComponent<TableRendererProps> {
    static defaultProps = {
      ...ExcelData.defaultProps,
      tableColorScaleGenerator: redColorScaleGenerator,
      tableOptions: {},
    }

    filterPropertyValue = (val, key, cate) => {
      debugger
      this.excelData.setFilterRowVals(key, val);
      setTimeout(
        () => {
          this.setState({})
        }
      )
    }

    renderPropertyList = (list, key) => {
      //  onChange={onChange}
      return <div className="pvtLabelContent">
        {
          list.map(
            val => <Checkbox onChange={() => this.filterPropertyValue(val, key, 'row')}>{val}</Checkbox>
          )
        }
      </div>
    }

    render() {

      const excelData = new ExcelData(this.props);

      this.excelData = excelData;

      const colAttrs = excelData.props.cols;
      const rowAttrs = excelData.props.rows;
      const colKeys = excelData.getColKeys();
      const rowKeys = excelData.getRowKeys();

      const rowFilterVals = excelData.getRowFilterVals();

      const grandTotalAggregator = excelData.getAggregator([], []);

      let valueCellColors = () => { };
      let rowTotalColors = () => { };
      let colTotalColors = () => { };

      // if (opts.heatmapMode) {
      //   const colorScaleGenerator = this.props.tableColorScaleGenerator;
      //   const rowTotalValues = colKeys.map(x =>
      //     excelData.getAggregator([], x).value()
      //   );
      //   rowTotalColors = colorScaleGenerator(rowTotalValues);
      //   const colTotalValues = rowKeys.map(x =>
      //     excelData.getAggregator(x, []).value()
      //   );
      //   colTotalColors = colorScaleGenerator(colTotalValues);

      //   if (opts.heatmapMode === 'full') {
      //     const allValues = [];
      //     rowKeys.map(r =>
      //       colKeys.map(c =>
      //         allValues.push(excelData.getAggregator(r, c).value())
      //       )
      //     );
      //     const colorScale = colorScaleGenerator(allValues);
      //     valueCellColors = (r, c, v) => colorScale(v);
      //   } else if (opts.heatmapMode === 'row') {
      //     const rowColorScales = {};
      //     rowKeys.map(r => {
      //       const rowValues = colKeys.map(x =>
      //         excelData.getAggregator(r, x).value()
      //       );
      //       rowColorScales[r] = colorScaleGenerator(rowValues);
      //     });
      //     valueCellColors = (r, c, v) => rowColorScales[r](v);
      //   } else if (opts.heatmapMode === 'col') {
      //     const colColorScales = {};
      //     colKeys.map(c => {
      //       const colValues = rowKeys.map(x =>
      //         excelData.getAggregator(x, c).value()
      //       );
      //       colColorScales[c] = colorScaleGenerator(colValues);
      //     });
      //     valueCellColors = (r, c, v) => colColorScales[c](v);
      //   }
      // }

      const getClickHandler =
        this.props.tableOptions && this.props.tableOptions.clickCallback
          ? (value, rowValues, colValues) => {
            const filters = {};
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
              this.props.tableOptions.clickCallback(
                e,
                value,
                filters,
                excelData
              );
          }
          : null;

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
                    <Popover content={this.renderPropertyList(colKeys.map(v => v[idx]), c)} placement="right">
                      <span>{c}<Icon type="menu-unfold" /></span>
                    </Popover>
                  </th>
                  {colKeys.map(function (colKey, i) { // colKeys 列对应的值的多维数组 如国家：[[中国, 2], [美国,3], [法国,6]]
                    const x = spanSize(colKeys, i, idx);
                    console.log(colKey, x)
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
                {rowAttrs.map(function (r, i) {
                  return (
                    <th className="pvtAxisLabel" key={`rowAttr${i}`}>
                      {r}
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
            {rowKeys.map( (rowKey, i) => {
              const totalAggregator = excelData.getAggregator(rowKey, []);
              return (
                <tr key={`rowKeyRow${i}`}>
                  {rowKey.map( (txt, j) => {
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
                        <Popover content={this.renderPropertyList(rowKeys.map(v => v[i]), txt)} placement="right">
                          <span>{txt}<Icon type="menu-unfold" /></span>
                        </Popover>
                      </th>
                    );
                  })}
                  {colKeys.map(function (colKey, j) {
                    const aggregator = excelData.getAggregator(rowKey, colKey);
                    return (
                      <td
                        className="pvtVal"
                        key={`pvtVal${i}-${j}`}
                        onClick={
                          getClickHandler &&
                          getClickHandler(aggregator.value(), rowKey, colKey)
                        }
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
  }
  return TableRenderer;
}

export default {
  Table: makeRenderer(),
};
