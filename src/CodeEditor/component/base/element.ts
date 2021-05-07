// import { IElement } from '../../interface';
import Base from './base';
import { ICtor, IObject, IElement, ShapeAttrs, ICanvas, IGroup } from '../../interface';
import UTIL from '../../../../util'

const CLONE_CFGS = ['zIndex', 'capture', 'visible', 'type'];

const noop = () => { };

// 数组嵌套数组 复制出新的数组
// 数组嵌套对象的场景不考虑
function _cloneArrayAttr(arr: any[]) {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    if (UTIL.isArray(arr[i])) {
      result.push([].concat(arr[i]));
    } else {
      result.push(arr[i]);
    }
  }
  return result;
}

abstract class Element extends Base implements IElement {

  /**
   * @protected
   * 图形属性
   * @type {ShapeAttrs}
   */
  attrs: ShapeAttrs = {};

  constructor(cfg: IObject) {
    super(cfg);
    const attrs = this.getDefaultAttrs();
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

    let animations = this.get('animations') || [];
    let timeline = this.get('timeline');
    if (!timeline) {
      timeline = this.get('canvas').get('timeline');
      this.set('timeline', timeline);
    }

    timeline.addAnimator(this);

    animations.push({
      duration,
      easing,
      repeat,
      callback,
      pauseCallback,
      resumeCallback,
      delay,
      startTime: timeline.getTime(),
      id: UTIL.uniqueId(),
      onFrame,
      pathFormatted: false,
    });

    this.set('animations', animations);
    this.set('_pause', { isPaused: false });

  }

  // // element的添加有自己所基于的group
  // abstract getGroupBase(): ICtor<IGroup>;

  /**
  * @protected
  * 获取默认的属性
  */
  getDefaultAttrs() {
    return {
      matrix: this.getDefaultMatrix(),
      opacity: 1,
    };
  }

  /**
   * @protected
   * 获取默认的矩阵
   * @returns {number[]|null} 默认的矩阵
   */
  getDefaultMatrix() {
    return null;
  }

  clone() {
    const originAttrs = this.attrs;
    const attrs = {};
    UTIL.each(originAttrs, (val, k) => {
      if (UTIL.isArray(val)) {
        attrs[k] = _cloneArrayAttr(val);
      } else {
        attrs[k] = val;
      }
    });

    const cons = this.constructor;
    // @ts-ignore
    const cloneElement = new cons({ attrs });

    UTIL.each(CLONE_CFGS, (cfgName) => {
      cloneElement.set(cfgName, this.get(cfgName));
    });
    return cloneElement;
  }

  getCanvas(): ICanvas {
    return this.get('canvas');
  }

  getParent(): ICanvas | IGroup {
    return this.get('parent');
  }

  /**
   * 一些方法调用会引起画布变化
   * @param {ChangeType} changeType 改变的类型
   */
  onCanvasChange(
    changeType:
      | 'changeSize'
      | 'add'
      | 'sort'
      | 'clear'
      | 'attr'
      | 'show'
      | 'hide'
      | 'zIndex'
      | 'remove'
      | 'matrix'
      | 'clip'
  ) {
    const context = this.get('context');
    const el = this.get('el');
    if (changeType === 'clear') {
      // el maybe null for canvas
      if (el) {
        // 清空 SVG 元素
        el.innerHTML = '';
        const defsEl = context.el;
        // 清空 defs 元素
        defsEl.innerHTML = '';
        // 将清空后的 defs 元素挂载到 el 下
        el.appendChild(defsEl);
      }
    } else if (changeType === 'changeSize') {
      el.setAttribute('width', `${this.get('width')}`);
      el.setAttribute('height', `${this.get('height')}`);
    }
  }

  // 向上将自己从父节点删除
  remove(destroy = true) {
    const parent = this.getParent();
    if (parent) {
      UTIL.removeFromArray(parent.getChildren(), this);
      if (!parent.get('clearing')) {
        // 如果父元素正在清理，当前元素不触发 remove
        this.onCanvasChange('remove');
      }
    } else {
      this.onCanvasChange('remove');
    }
    if (destroy) {
      this.destroy();
    } else {
      this.set('parent', null);
      this.set('canvas', null);
    }
  }

  destroy() {
    const destroyed = this.destroyed;
    if (destroyed) {
      return;
    }
    this.attrs = {};
    super.destroy();
    // this.onCanvasChange('destroy');
  }
}

export default Element;