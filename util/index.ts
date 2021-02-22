import deepMix from './deep-mix';
import isPlainObject from './is-plain-object';
import isType from './is-type';
import isArray from './is-array';
import isObject from './is-object';
import uniqueId from './unique-id';
import deepTraverse from './deep-traverse';

export default {
  deepMix,
  isPlainObject,
  isString: (val: any) => isType(val, 'String'),
  uniqueId,
  isArray,
  isObject,
  deepTraverse,
}