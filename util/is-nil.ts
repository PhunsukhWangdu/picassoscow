export default (val: any): val is null | undefined => {
  return val === undefined || val === null;
}