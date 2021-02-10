import React from 'react';
import * as constants from '../constants';
import PfiveElement from '../struct/Element';

export default class Renderer {
  constructor(elt, pInst, isMainCanvas) {
    this._pInst = this._pixelsState = pInst;
    // pInst p5this
    new PfiveElement(elt, pInst);
    // const { elt, pInst, isMainCanvas } = props;
    // _main.default.Element.call(this, elt, pInst);
    this.canvas = elt;
    if (isMainCanvas) {
      this._isMainCanvas = true;
      // for pixel method sharing with pimage
      this._pInst._setProperty('_curElement', this);
      this._pInst._setProperty('canvas', this.canvas);
      this._pInst._setProperty('width', this.width);
      this._pInst._setProperty('height', this.height);
    } else {
      // hide if offscreen buffer by default
      this.canvas.style.display = 'none';
      this._styles = []; // non-main elt styles stored in p5.Renderer
    }

    this._textSize = 12;
    this._textLeading = 15;
    this._textFont = 'sans-serif';
    this._textStyle = constants.NORMAL;
    this._textAscent = null;
    this._textDescent = null;
    this._textAlign = constants.LEFT;
    this._textBaseline = constants.BASELINE;

    this._rectMode = constants.CORNER;
    this._ellipseMode = constants.CENTER;
    this._curveTightness = 0;
    this._imageMode = constants.CORNER;

    this._tint = null;
    this._doStroke = true;
    this._doFill = true;
    this._strokeSet = false;
    this._fillSet = false;
  }

  _setProperty = (prop, value) => {
    this[prop] = value;
  };

  resize(w, h, context) {
    this.width = w;
    this.height = h;
    this.elt.width = w * context._pInst._pixelDensity;
    this.elt.height = h * context._pInst._pixelDensity;
    this.elt.style.width = `${w}px`;
    this.elt.style.height = `${h}px`;
    if (this._isMainCanvas) {
      this._pInst._setProperty('width', this.width);
      this._pInst._setProperty('height', this.height);
    }
  };
}