import isObjectLike from './is-object-like';
import isPlainObject from './is-plain-object';

const MAX_LEVEL = 5;

function _deepMix(tar:any, src:any, minLevel?: number, maxLevel?: number) {

  if(!isPlainObject(src)) tar = src;

  minLevel = minLevel || 0;
  maxLevel = maxLevel || MAX_LEVEL;

  Object.keys(src).forEach(
    key => {
      const value = src[key];
      if (value === undefined || value == null) return;
      if (isPlainObject(value)) {
        if (!isPlainObject(tar[key])) {
          tar[key] = {};
        }
        // @ts-ignore
        if (minLevel < maxLevel) {
        // @ts-ignore
          _deepMix(tar[key], value, minLevel + 1, maxLevel)
        } else {
          tar[key] = src[key];
        }
      }
    }
  )
}

const deepMix = function (tar: any, ...args: any[]) {
  for(let i = 0; i < args.length; i++) {
    _deepMix(tar, args[i]);
  }
  return tar;
}

export default deepMix;