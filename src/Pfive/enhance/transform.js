import Pfive from '../Pfive.js';

console.log(Pfive)

//注入上下文变量 可替换

Pfive.prototype.scale = function(x, y, z) {
  // p5._validateParameters('scale', arguments);
  // Only check for Vector argument type if Vector is available
  if (x instanceof p5.Vector) {
    const v = x;
    x = v.x;
    y = v.y;
    z = v.z;
  } else if (x instanceof Array) {
    const rg = x;
    x = rg[0];
    y = rg[1];
    z = rg[2] || 1;
  }
  if (isNaN(y)) {
    y = z = x;
  } else if (isNaN(z)) {
    z = 1;
  }

  this._renderer.scale.call(this._renderer, x, y, z);

  return this;
};
