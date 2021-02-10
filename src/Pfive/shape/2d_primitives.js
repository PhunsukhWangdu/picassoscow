const circle = function() {
  p5._validateParameters('circle', arguments);
  const args = Array.prototype.slice.call(arguments, 0, 2);
  args.push(arguments[2]);
  args.push(arguments[2]);
  return this._renderEllipse.apply(this, args);
};