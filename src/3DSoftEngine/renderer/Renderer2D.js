import React from 'react';
import Renderer from './Renderer';

export default class Renderer2D extends Renderer {
  constructor(elt, pInst, isMainCanvas) {
    super(elt, pInst, isMainCanvas);
    this.drawingContext = this.canvas.getContext('2d');
    // this._pInst = this._pixelsState = pInst; pointer to p5 instance
    // this._pInst._setProperty('drawingContext', this.drawingContext);
  }

  _applyDefaults() {
    this._cachedFillStyle = this._cachedStrokeStyle = undefined;
    this._cachedBlendMode = constants.BLEND;
    this._setFill(constants._DEFAULT_FILL);
    this._setStroke(constants._DEFAULT_STROKE);
    this.drawingContext.lineCap = constants.ROUND;
    this.drawingContext.font = 'normal 12px sans-serif';
  };

  // resize = (() => {
  //   const context = this;
  //   const superResize = super.resize;
  //   return function (w, h) {
  //     superResize.call(context, w, h);
  //     // 为了this拿到顶层的上下文
  //     context.drawingContext.scale(this._pInst._pixelDensity, this._pInst._pixelDensity);
  //   }
  // })();

  resize(w, h) {
    super.resize(w, h);
    // 为了this拿到顶层的上下文
    this.drawingContext.scale(this._pInst._pixelDensity, this._pInst._pixelDensity);
  };

  resetMatrix(context) {
    this.drawingContext.setTransform(1, 0, 0, 1, 0, 0);
    this.drawingContext.scale(
      this._pInst._pixelDensity,
      this._pInst._pixelDensity
    );
    return this;
  };

  fill(...args) {
    const color = this._pInst.color(...args);
    this._setFill(color.toString());
    //accessible Outputs
    if (this._pInst._addAccsOutput()) {
      this._pInst._accsCanvasColors('fill', color.levels);
    }
  };

  _setFill(fillStyle) {
    if (fillStyle !== this._cachedFillStyle) {
      this.drawingContext.fillStyle = fillStyle;
      this._cachedFillStyle = fillStyle;
    }
  }
}