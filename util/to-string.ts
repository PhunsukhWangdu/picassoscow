import isNil from './is-nil';

export default (val:any): string => {
  if(isNil(val)) return '';

  return val.toString();
}