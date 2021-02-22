export default < T = object>(val: any) : val is T => {
  const type = typeof val;
  return val !== null && type === 'function' || type === 'object';
}