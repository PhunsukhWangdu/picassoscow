import React from 'react';
import Renderer from './Renderer';

export default class Renderer2D extends Renderer {
  constructor(props) {
    super(props);
    this.drawingContext = this.canvas.getContext('2d');
    // this._pInst._setProperty('drawingContext', this.drawingContext);
  }

  resize = (() => {
    const context = this;
    const superResize = super.resize;
    return function (w, h) {
      superResize.call(context, w, h);
      // 为了this拿到顶层的上下文
      context.drawingContext.scale(this._pInst._pixelDensity, this._pInst._pixelDensity);
    }
  })();

  _applyDefaults() {
    this._cachedFillStyle = this._cachedStrokeStyle = undefined;
    this._cachedBlendMode = constants.BLEND;
    this._setFill(constants._DEFAULT_FILL);
    this._setStroke(constants._DEFAULT_STROKE);
    this.drawingContext.lineCap = constants.ROUND;
    this.drawingContext.font = 'normal 12px sans-serif';
  };
}