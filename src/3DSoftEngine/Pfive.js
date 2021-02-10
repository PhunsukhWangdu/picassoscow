import React from 'react';
import Renderer2D from './renderer/Renderer2D';
import RendererGL from './renderer/RendererGL';
import * as constants from './constants';

export default class Pfive extends React.PureComponent {
  constructor(props) {
    super(props);

    this.containerRef = React.createRef();
    // for handling hidpi
    this._pixelDensity = Math.ceil(window.devicePixelRatio) || 1;

    this._accessibleOutputs = {
      text: false,
      grid: false,
      textLabel: false,
      gridLabel: false
    };

    this._setupDone = false;
    this._curElement = null;
    this._elements = [];
    this._glAttributes = null;
    this._requestAnimId = 0;
    this._preloadCount = 0;
    this._isGlobal = false;
    this._loop = true;
    this._initializeInstanceVariables();
    this._defaultCanvasSize = {
      width: 100,
      height: 100
    };

    this._events = {
      // keep track of user-events for unregistering later
      mousemove: null,
      mousedown: null,
      mouseup: null,
      dragend: null,
      dragover: null,
      click: null,
      dblclick: null,
      mouseover: null,
      mouseout: null,
      keydown: null,
      keyup: null,
      keypress: null,
      touchstart: null,
      touchmove: null,
      touchend: null,
      resize: null,
      blur: null
    };

    this._millisStart = -1;

    this._registeredMethods = { init: [], pre: [], post: [], remove: [] };

    this.openMethod = {
      rectMode: this.rectMode,
    }

    // this.state = {
    //   src: this.getExampleJson()
    // };
  }

  componentDidMount() {
    // 创建好容器div
    this._setup();
    this._draw();
  }

  _setProperty = (prop, value) => {
    this[prop] = value;
  };

  _initializeInstanceVariables() {
    this._styles = [];

    this._bezierDetail = 20;
    this._curveDetail = 20;

    this._colorMode = constants.RGB;
    this._colorMaxes = {
      rgb: [255, 255, 255, 255],
      hsb: [360, 100, 100, 1],
      hsl: [360, 100, 100, 1]
    };

    this._downKeys = {}; //Holds the key codes of currently pressed keys
  }

  _setup = () => {
    const { w, h, renderer } = this.props;
    // Always create a default canvas.
    // Later on if the user calls createCanvas, this default one
    // will be replaced
    this.createCanvas(
      w || this._defaultCanvasSize.width,
      h || this._defaultCanvasSize.height,
      renderer
    );

    // Record the time when sketch starts
    this._millisStart = window.performance.now();

    if (typeof this.props.setup === 'function') {
      this.props.setup(this);
    }

    // unhide any hidden canvases that were created
    const canvases = document.getElementsByTagName('canvas');

    for (const k of canvases) {
      if (k.dataset.hidden === 'true') {
        k.style.visibility = '';
        delete k.dataset.hidden;
      }
    }

    this._lastFrameTime = window.performance.now();
    this._setupDone = true;
  };

  _draw = () => {
    const now = window.performance.now();
    const time_since_last = now - this._lastFrameTime;
    const target_time_between_frames = 1000 / this._targetFrameRate;

    // 在距离下一次绘制还有5ms以上，就绘制，因为时间足够，如果不够5ms则等下一次
    // 上次绘制完一定是requestAnimationFrame执行结束，所以now - this._lastFrameTime就是距离上次requestAnimationFrame执行结束过的时间
    const epsilon = 5;
    if (
      !this._loop ||
      time_since_last >= target_time_between_frames - epsilon
    ) {
      //mandatory update values(matrixs and stack)
      this.redraw();
      this._frameRate = 1000.0 / (now - this._lastFrameTime);
      this.deltaTime = now - this._lastFrameTime;
      this._setProperty('deltaTime', this.deltaTime);
      this._lastFrameTime = now;
    }

    // get notified the next time the browser gives us
    // an opportunity to draw.
    if (this._loop) {
      this._requestAnimId = window.requestAnimationFrame(this._draw);
    }
  };

  createCanvas(w, h, renderer) {
    //optional: renderer, otherwise defaults to p2d
    const r = renderer || constants.P2D;
    const c = document.createElement('canvas');
    // var i = 0;
    // while (document.getElementById('defaultCanvas'.concat(i))) {
    //   i++;
    // }
    // defaultId = 'defaultCanvas'.concat(i);
    c.id = 'pfive-canvas';
    c.classList.add('pfive-canvas');

    this.containerRef.current.appendChild(c);

    // 校验参数 _main.default._validateParameters('createCanvas', arguments);

    // set to invisible if still in setup (to prevent flashing with manipulate)
    if (!this._setupDone) {
      c.dataset.hidden = true; // tag to show later
      c.style.visibility = 'hidden';
    }

    // Init our graphics renderer
    //webgl mode
    if (r === constants.WEBGL) {
      this._setProperty('_renderer', new RendererGL(c, this, true));
      this._elements.push(this._renderer);
    } else {
      //P2D mode
      if (!this._defaultGraphics) {
        this._setProperty('_renderer', new Renderer2D(c, this, true));
        this._defaultGraphicsCreated = true;
        this._elements.push(this._renderer);
      }
    }

    // this._renderer.resize.call(this, w, h);
    // this._renderer.call._applyDefaults(this);
    this._renderer.resize(w, h);
    this._renderer._applyDefaults();
    return this._renderer;
  };

  redraw(n) {
    if (this._inUserDraw || !this._setupDone) {
      return;
    }

    let numberOfRedraws = parseInt(n); // n决定执行多少次draw
    if (isNaN(numberOfRedraws) || numberOfRedraws < 1) {
      numberOfRedraws = 1;
    }

    const context = this._isGlobal ? window : this;

    if (typeof this.props.draw === 'function') {
      if (typeof context.setup === 'undefined') {
        context.scale(context._pixelDensity, context._pixelDensity);
      }
      const callMethod = f => {
        f.call(context);
      };

      for (let idxRedraw = 0; idxRedraw < numberOfRedraws; idxRedraw++) {
        this._renderer.resetMatrix(this);
        // if (this._renderer.isP3D) { // webgl
        //   this._renderer._update();
        // }

        this._setProperty('frameCount', this.frameCount + 1);

        context._registeredMethods.pre.forEach(callMethod);

        this._inUserDraw = true;
        try {
          this.props.draw(this);
        } finally {
          this._inUserDraw = false;
        }

        context._registeredMethods.post.forEach(callMethod);

      }
    }


  };

  // setting
  fill(...args) {
    this._renderer._setProperty('_fillSet', true);
    this._renderer._setProperty('_doFill', true);
    this._renderer.fill(...args);
    return this;
  };


  render() {
    return <div id="main" ref={this.containerRef}></div>
  }
}
