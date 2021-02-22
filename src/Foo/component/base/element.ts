// import { IElement } from '../../interface';
import Base from './base';
import { IObject } from '../../interface';

const noop = () => {};

abstract class Element extends Base {

  constructor(cfg:IObject) {
    super(cfg);
  }

  public animate(...args: any[]) {
    if (!this.get('timeline') && !this.get('canvas')) {
      return;
    }
    this.set('animating', true);

    let [toAttrs, duration, easing = 'easeLinear', callback = noop, delay = 0] = args;

    const onFrame = toAttrs;
    toAttrs = {};

    const animateCfg = duration;
    duration = animateCfg.duration;
    easing = animateCfg.easing || 'easeLinear';
    delay = animateCfg.delay || 0;
    
    // animateCfg 中的设置优先级更高
    const repeat = animateCfg.repeat || false;
    callback = animateCfg.callback || noop;
    const pauseCallback = animateCfg.pauseCallback || noop;
    const resumeCallback = animateCfg.resumeCallback || noop;
  }

}

export default Element;