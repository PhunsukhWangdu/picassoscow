import isObjectLike from './is-object-like';
import isType from './is-type';

// 检查 value 是否是普通对象。 也就是说该对象由 Object 构造函数创建或者 [[Prototype]] 为空
const isPlainObject = function (value: any): value is Object {
  // isObjectLike第一层拦截 isType精准判断是否为Object类型
  if (!isObjectLike(value) || !isType(value, 'Object')) {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  // 检查value原型是否为null（对象的原型只能是对象或者null null为顶层）
  if (proto === null) {
    return true;
  }
  // 检查该对象是否由Object构造函数创建
  // 对象声明方式如 { 'x': 0, 'y': 0 }， proto为
  var Ctor = Object.hasOwnProperty.call(proto, 'constructor') && proto.constructor;

  // instanceof => constructor.prototype 是否存在于参数 object 的原型链
  return typeof Ctor == 'function' && Ctor instanceof Ctor &&
  Function.prototype.toString.call(Ctor) == Function.prototype.toString.call(Object);

  // 另一种方式 看原型链是否只有一层 null第二层是object构造函数 所以如果value的上层proto的上层为null，表示value是object构造函数生成
  // while (Object.getPrototypeOf(proto) !== null) {
  //   proto = Object.getPrototypeOf(proto);
  // }
  // return Object.getPrototypeOf(value) === proto;
}

export default isPlainObject;