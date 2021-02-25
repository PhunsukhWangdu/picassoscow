import toString from './to-string';

export default (val: string): string => {
  const str = toString(val);
  return `${str.charAt(0).toUpperCase()}${str.substr(1)}`
}