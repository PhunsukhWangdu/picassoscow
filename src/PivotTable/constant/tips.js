import Mock from 'mockjs';

export default Mock.mock({
  // 属性 list 的值是一个数组，其中含有 1 到 10 个元素
  'list|30': [{
      // 属性 id 是一个自增数，起始值为 1，每次增 1
      'id|+1': 1,
      '事件类型|1': [
        "盗卡",
        "盗账户",
      ],
      '国家|1': [
        "中国",
        "美国",
        "法国",
        // "英国"
      ],
      '时间段|1': [
        "8:00～12:00",
        "12:00～17:00",
        "17:00～21:00",
        "21:00～8:00"
      ],
      '卡号|1': [
        "00001",
        "00002",
      ],
      "property-z|1-100.1-10": 1,
      "property-c|1-5": 1,
      'property-d': /[a-z][A-Z][0-9]/,
      'property-e|1-5': /\d{5,10}\-/,
      "property-f|1-100.1-10": 1,
  }]
})