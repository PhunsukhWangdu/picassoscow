import Mock from 'mockjs';

export default Mock.mock({
  // 属性 list 的值是一个数组，其中含有 1 到 10 个元素
  'list|1-50': [{
      // 属性 id 是一个自增数，起始值为 1，每次增 1
      'id|+1': 1,
      'property-a': /[a-z][A-Z][0-9]/,
      'property-b|1-5': /\d{5,10}\-/,
      "property-c|1-100.1-10": 1,
      'property-d': /[a-z][A-Z][0-9]/,
      'property-e|1-5': /\d{5,10}\-/,
      "property-f|1-100.1-10": 1,
  }]
})