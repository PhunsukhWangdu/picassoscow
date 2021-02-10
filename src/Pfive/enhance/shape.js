import Pfive from '../Pfive.js';
import constants from '../constants';

//注入上下文变量 可替换

Pfive.prototype.rectMode = function(m) {
  // p5._validateParameters('rectMode', arguments);
  if (
    m === constants.CORNER ||
    m === constants.CORNERS ||
    m === constants.RADIUS ||
    m === constants.CENTER
  ) {
    this._renderer._rectMode = m;
  }
  return this;
};