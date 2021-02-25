import deepMix from './deep-mix';
import isPlainObject from './is-plain-object';
import isType from './is-type';
import isArray from './is-array';
import isObject from './is-object';
import uniqueId from './unique-id';
import deepTraverse from './deep-traverse';
import each from './each';
import toString from './to-string';
import isNil from './is-nil';
import upperFirst from './upper-first';
import removeFromArray from './remove-from-array'

export default {
  deepMix,
  isPlainObject,
  isString: (val: any) => isType(val, 'String'),
  isFunction: (val: any) => isType(val, 'Function'),
  uniqueId,
  isArray,
  isObject,
  deepTraverse,
  each,
  toString,
  isNil,
  upperFirst,
  removeFromArray,
}