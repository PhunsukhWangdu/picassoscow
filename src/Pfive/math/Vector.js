import Pfive from '../Pfive';

export const createVector = function(x, y, z) {
  if (this instanceof Pfive) {
    return new Vector(this, arguments);
  } else {
    return new Vector(x, y, z);
  }
};

class Vector {
  constructor(...arguments) {
    // This is how it comes in with createVector()
    if (arguments[0] instanceof Pfive) {
      // save reference to p5 if passed in
      this._pInst = arguments[0];
      x = arguments[1][0] || 0;
      y = arguments[1][1] || 0;
      z = arguments[1][2] || 0;
      // This is what we'll get with new p5.Vector()
    } else {
      x = arguments[0] || 0;
      y = arguments[1] || 0;
      z = arguments[2] || 0;
    }
    /**
     * The x component of the vector
     * @property x {Number}
     */
    this.x = x;
    /**
     * The y component of the vector
     * @property y {Number}
     */
    this.y = y;
    /**
     * The z component of the vector
     * @property z {Number}
     */
    this.z = z;
  }
};