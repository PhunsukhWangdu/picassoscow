import React from 'react';
import ExcelTableUI from './component/ExcelTableUI';
import './pivottable.css';
import 'antd/dist/antd.css';
import TableRenderers from 'react-pivottable/TableRenderers';
import Plot from 'react-plotly.js';
import createPlotlyRenderers from 'react-pivottable/PlotlyRenderers';
import { Switch, Icon, Button } from 'antd';
import SearchTable from '@sula-template/search-table';

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
      tableList: '',
      rows: ['国家', '事件类型'], // 'id', 
      cols: ['卡号', '时间段'],
      hiddenAttributes: [], // 从展示区域省略的属性
      hiddenFromDragDrop: [], // 从拖拽区域省略的属性
      aggregatorName: 'Count',
      vals: ['国家', '卡号'], // 属性名称用作聚合器的参数（获取传递给聚合器生成函数的值）
      tableOptions: {
        clickCallback: function (e, value, filters, pivotData) {
          var names = [];
          pivotData.forEachMatchingRecord(filters, (record: object) => {
            names.push(record['国家']);
          });
          alert(names.join('\n'));
        },
      },
      rowOrder: 'key_a_to_z',
      colOrder: 'key_a_to_z',
      analysis: false,
    };
  }

  config = {
    rowKey: 'id',
    layout: 'vertical',
    remoteDataSource: {
      url: 'https://randomuser.me/api',
      method: 'get',
      extraParams: {
        gender: 'male',
        results: 200,
      },
      converter: ({ data }) => {
        const { results, info } = data
        return {
          list: results.map((item, index) => {
            return {
              ...item,
              level: index % 2 ? 'Medium' : 'High',
            }
          }),
          total: info.results.length,
        }
      },
    },
    columns: [{
      key: 'name',
      title: <span style={{ color: '#1890ff' }}>Name<Icon type="dot-chart" style={{ marginLeft: 8 ,color: '#1890ff' }} /></span>,
      sorter: true,
      render: ctx => {
        return (
          <b>
            {ctx.data.name.first} {ctx.data.name.last}
          </b>
        )
      },
    },
    {
      key: 'phone',
      title: 'Phone',
      title: <span style={{ color: '#1890ff' }}>Phone<Icon type="dot-chart" style={{ marginLeft: 8 ,color: '#1890ff' }} /></span>,
    },
    {
      key: 'gender',
      title: 'Gender',
      title: <span style={{ color: '#1890ff' }}>Gender<Icon type="dot-chart" style={{ marginLeft: 8 ,color: '#1890ff' }} /></span>,
      render: {
        type: 'tag',
        props: {
          type: 'primary',
          children: '${data.gender}',
        },
      },
    },
    {
      key: 'level',
      title: 'Level',
      title: <span style={{ color: '#1890ff' }}>Level<Icon type="dot-chart" style={{ marginLeft: 8 ,color: '#1890ff' }} /></span>,
      filters: [
        {
          text: 'High',
          value: 'High',
        },
        {
          text: 'Medium',
          value: 'Medium',
        },
      ],
      render: {
        type: 'tag',
        props: {
          '@type': ctx => {
            if (ctx.data.level === 'High') {
              return 'danger'
            } else if (ctx.data.level === 'Medium') {
              return 'warning'
            } else {
              return 'primary'
            }
          },
          '@children': ctx => ctx.cell,
        },
      },
    },
    ],
    quickSearch: [
      {
        name: 'monitorItemName',
        render: {
          type: 'input',
          props: {
            placeholder: 'monitorItemName',
          },
        },
      },
      {
        name: 'gmtCreate',
        render: {
          type: 'input',
          props: {
            placeholder: 'monitorItemName',
          },
        }
      },
      {
        name: 'notifier',
        render: {
          type: 'input',
          props: {
            placeholder: 'monitorItemName',
          },
        }
      },
    ],
  };

  onModeChange = checked => {
    this.setState({
      analysis: true,
    })
  }




  render() {
    return (
      <ExcelTableUI
        data={exampleData.list}
        onChange={s => {
          this.setState(s)
        }}
        // renderers={Object.assign({}, TableRenderers, PlotlyRenderers)}
        {...this.state}
    />
    )
    return (
      <div>
        <Switch
          checkedChildren="analysis mode"
          unCheckedChildren="analysis mode"
          // unCheckedChildren="view mode"
          onChange={this.onModeChange}
          style={{ marginBottom: 16 }}
          checked={this.state.analysis}
        />
        <SearchTable
          {...this.config}

          tableProps={{
            rowSelection: this.state.analysis,
            rowKey: record => {
              return record.login.uuid
            }
          }}

        />
        {
          this.state.analysis && <div>
            <Button type="primary" style={{ marginBottom: 16 }}>
              Import Selected Events
                <Icon type="right" />
            </Button>
            <ExcelTableUI
              data={exampleData.list}
              onChange={s => {
                this.setState(s)
              }}
              // renderers={Object.assign({}, TableRenderers, PlotlyRenderers)}
              {...this.state}
            />
          </div>
        }

      </div>

    );
  }
}