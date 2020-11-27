interface ExcelDataConfig {
  aggregators?: object, // 数据统计方法合集
  cols?: Array<String>,
  rows?: Array<String>,
  vals?: Array<String>,
  aggregatorName?: String,
  sorters?: {},
  valueFilter?: {},
  rowOrder?: "key_a_to_z"|"value_a_to_z"|"value_z_to_a",
  colOrder?: "key_a_to_z"|"value_a_to_z"|"value_z_to_a",
  derivedAttributes?: {},
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
  forEachRecord(data: Array<object>): Array<object> {
    return []
  };

  defaultProps = {
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
  };

  constructor(props: ) {
    this.props = Object.assign({}, ExcelData.defaultProps, props);
  }
}

ExcelData.prototype.defaultProps = {
  aggregators: aggregators,
  cols: [],
  rows: [],
  vals: [],
  aggregatorName: 'Count',
  sorters: {},
  valueFilter: {},
  rowOrder: 'key_a_to_z',
  colOrder: 'key_a_to_z',
  derivedAttributes: {},
};

ExcelData.prototype.forEachRecord = (data: Array) => {
  newState.materializedInput.push(record);
  for (const attr of Object.keys(record)) {
    if (!(attr in newState.attrValues)) {
      newState.attrValues[attr] = {};
      if (recordsProcessed > 0) {
        newState.attrValues[attr].null = recordsProcessed;
      }
    }
  }
  for (const attr in newState.attrValues) {
    const value = attr in record ? record[attr] : 'null';
    if (!(value in newState.attrValues[attr])) {
      newState.attrValues[attr][value] = 0;
    }
    newState.attrValues[attr][value]++;
  }
  recordsProcessed++;
}