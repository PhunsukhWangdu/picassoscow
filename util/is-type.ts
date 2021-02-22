

const toString = {}.toString;
/**
 * {} => [object Object] 
 * function(){} => [object Function]
 * new Date => [object Date]
 * new RegExp => [object RegExp]
 * Symbol() => [object Symbol]
 * [] => [object Array] 
 * null => [object Null] 
 * undefined => [object Undefined] 
 * string => [object String] 
 * number => [object Number] 
 * */

const isType = (value: any, type: string) => toString.call(value) === `[object ${type}]`;

export default isType;