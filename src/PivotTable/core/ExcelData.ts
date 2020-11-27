import PropTypes from 'prop-types';
import isArray from 'lodash/isArray';

interface IObject {
  [key: string]: any
}

interface ExcelDataConfig {
  aggregators: IObject, // 数据统计方法合集
  cols: Array<string>,
  rows: Array<string>,
  vals: Array<string>,
  aggregatorName: string,
  sorters: {},
  valueFilter: {},
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

  private config: ExcelDataConfig;

  private tree: object;
  private rowTotals: object;
  private colTotals: object;

  private rowKeys: any[];
  private colKeys: any[];
  private allTotal: any[];

  private aggregator: Function;
  private sorted: boolean;

  constructor(props: ExcelDataConfig) {
    this.config = Object.assign({}, ExcelData.defaultProps, props || {}), {
      aggregators: { ...ExcelData.defaultProps.aggregators, ...(props.aggregators || {}) },
    };

    const { aggregators, aggregatorName } = this.config;

    this.aggregator = aggregators[aggregatorName](
      this.config.vals
    );
    this.tree = {};
    this.rowKeys = [];
    this.colKeys = [];
    this.rowTotals = {};
    this.colTotals = {};
    this.allTotal = this.aggregator(this, [], []);
    this.sorted = false;

  }
}