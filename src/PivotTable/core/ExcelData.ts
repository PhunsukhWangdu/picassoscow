import PropTypes from 'prop-types';
import isArray from 'lodash/isArray';

interface IObject {
  [key: string]: any
}

export interface ExcelDataConfig {
  data: IObject[],
  aggregators: IObject, // 数据统计方法合集
  cols: string[],
  rows: string[],
  vals: string[],
  aggregatorName: string,
  sorters: {},
  valueFilter: { [key: string]: string[] },
  rowOrder: "key_a_to_z" | "value_a_to_z" | "value_z_to_a",
  colOrder: "key_a_to_z" | "value_a_to_z" | "value_z_to_a",
  derivedAttributes: {},
}

const addSeparators = function (nStr, thousandsSep, decimalSep) {
  const x = String(nStr).split('.');
  let x1 = x[0];
  const x2 = x.length > 1 ? decimalSep + x[1] : '';
  const rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, `$1${thousandsSep}$2`);
  }
  return x1 + x2;
};

const numberFormat = function (opts_in?: object) {
  const defaults = {
    digitsAfterDecimal: 2,
    scaler: 1,
    thousandsSep: ',',
    decimalSep: '.',
    prefix: '',
    suffix: '',
  };
  const opts = Object.assign({}, defaults, opts_in);
  return function (x) {
    if (isNaN(x) || !isFinite(x)) {
      return '';
    }
    const result = addSeparators(
      (opts.scaler * x).toFixed(opts.digitsAfterDecimal),
      opts.thousandsSep,
      opts.decimalSep
    );
    return `${opts.prefix}${result}${opts.suffix}`;
  };
};

// aggregator templates default to US number formatting but this is overrideable
const usFmtInt = numberFormat({ digitsAfterDecimal: 0 })

const aggregatorTemplates = {
  count(formatter = usFmtInt) {
    return () =>
      function () {
        return {
          count: 0,
          push() {
            this.count++;
          },
          value() {
            return this.count;
          },
          format: formatter,
        };
      };
  },
};

// default aggregators & renderers use US naming and number formatting
const aggregators = (tpl => ({
  Count: tpl.count(usFmtInt),
}))(aggregatorTemplates);

export default class ExcelData {
  static forEachRecord(data: any, derivedAttributes = {} as IObject, f = (a: any) => a) {
    debugger
    // data原始数据, derivedAttributes需要对原始数据的key进行改造的方法，属性改造后再传入f, f对数据进行加工改造的方法

    if (!isArray(data)) return;
    // [[属性1，属性2], [value_属性1, value_属性2]] or [{ 属性1: value:属性1, 属性2: value_属性2 }] 后者为标准表格数据

    let addRecord: Function;

    // 构造遍历data数据每一项的回调函数
    if (Object.getOwnPropertyNames(derivedAttributes).length === 0) {
      addRecord = f;
    } else {
      addRecord = function (record: IObject) {
        //  derivedAttributes需要对原始数据的key进行改造的方法
        for (const k in derivedAttributes) {
          const derived = derivedAttributes[k](record);
          if (derived !== null) {
            record[k] = derived;
          }
        }
        // 属性改造后再传入f
        return f(record);
      };
    }

    let record: IObject; // 临时构造的表格内容每一项
    const result: IObject[] = [];

    if (isArray(data[0])) {
      // 传入数据为 [[属性1，属性2], [value_属性1, value_属性2]] 这种第一个传入的是key的列表的情况
      const keyMap = data[0] || {};
      data.slice(1).map( // 遍历初第一项之外的data
        child => {
          Object.values(keyMap).map( // data[0] = [属性1，属性2, 属性3]
            (k, idx) => {
              record[k] = child[idx]; //  child=[value_属性1, value_属性2] =>{属性1:value_属性1, 属性2:value_属性2}
            }
          )
          result.push(record);
        }
      )
    } else {
      // 传入数据为[ {属性1:value_属性1, 属性2:value_属性2}, {属性1:value_属性1, 属性2:value_属性2} ] 
      data.forEach(
        child => {
          result.push(addRecord(child));
        }
      )
    }

    return result;
  }

  static defaultProps = {
    data: [],
    aggregators: aggregators, // 数据统计方法合集
    cols: [],
    rows: [],
    vals: [],
    aggregatorName: 'Count',
    sorters: {},
    valueFilter: {},
    rowOrder: 'key_a_to_z',
    colOrder: 'key_a_to_z',
    derivedAttributes: {},
  }

  props: ExcelDataConfig;

  private tree: IObject;
  private rowTotals: IObject;
  private colTotals: IObject;

  private rowKeys: any[];
  private colKeys: any[];
  private allTotal: any[];

  private aggregator: Function;
  private sorted: boolean;

  constructor(props: ExcelDataConfig) {
    this.props = Object.assign({}, ExcelData.defaultProps, props || {}), {
      aggregators: { ...ExcelData.defaultProps.aggregators, ...(props.aggregators || {}) },
    };

    const { aggregators, aggregatorName } = this.props;

    this.aggregator = aggregators[aggregatorName](
      this.props.vals
    );
    this.tree = {};
    this.rowKeys = [];
    this.colKeys = [];
    this.rowTotals = {};
    this.colTotals = {};
    this.allTotal = this.aggregator(this, [], []);
    this.sorted = false;

    debugger
    ExcelData.forEachRecord(
      this.props.data,
      this.props.derivedAttributes,
      record => {
        if (this.filter(record)) {
          this.processRecord(record);
        }
      }
    );

  }

  protected filter(record: IObject) {
     // valueFilter=>{a: [1,2]} 过滤掉a为1或者2的原始数据
    const { valueFilter } = this.props;  
    Object.keys(this.props.valueFilter).forEach(
      key => {
        if (valueFilter[key].includes(record[key])) return false;
        return true;
      }
    )
    return true;
  }

  getColKeys() {
    return this.colKeys;
  }

  getRowKeys() {
    return this.rowKeys;
  }

  protected processRecord(record: IObject) {
    // this code is called in a tight loop
    const colKey: string[] = [];
    const rowKey: string[] = [];
    Array.from(this.props.cols).forEach(
      col => {
        if(record[col]) colKey.push(record[col])
      }
    )
    Array.from(this.props.rows).forEach(
      row => {
        if(record[row]) rowKey.push(record[row])
      }
    )

    const flatRowKey = rowKey.join(String.fromCharCode(0)); // 行有两个属性时[a,b]，值直接进行join {a:femal, b: 22} => femal222
    const flatColKey = colKey.join(String.fromCharCode(0));

    this.allTotal.push(record, flatColKey);

    if (rowKey.length !== 0) { // 行的属性值合并 femal222
      if (!this.rowTotals[flatRowKey]) { // rowTotals { femal222:{},  femal333:{} }
        this.rowKeys.push(rowKey); // rowKeys =>[[femal, 222], [femal, 333]]
        this.rowTotals[flatRowKey] = this.aggregator(this, rowKey, []);
      }
      this.rowTotals[flatRowKey].push(record); // 这里的push是aggregator的方法
    }

    if (colKey.length !== 0) {
      if (!this.colTotals[flatColKey]) {
        this.colKeys.push(colKey);
        this.colTotals[flatColKey] = this.aggregator(this, [], colKey);
      }
      this.colTotals[flatColKey].push(record);
    }

    if (colKey.length !== 0 && rowKey.length !== 0) { // this.tree
      if (!this.tree[flatRowKey]) {
        this.tree[flatRowKey] = {};
      }
      if (!this.tree[flatRowKey][flatColKey]) {
        this.tree[flatRowKey][flatColKey] = this.aggregator(
          this,
          rowKey,
          colKey
        );
      }
      this.tree[flatRowKey][flatColKey].push(record); // 以row为key col为多维的key 构造横纵坐标都有的数据
    }
  }
}