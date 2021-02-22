import { CanvasCfg } from '../interface';
import Base from './BaseClass';
import UTIL from '../../../util';
import Defs from './Defs';
import { createSVGElement } from '../../../util/dom';

const PX_SUFFIX = 'px';

abstract class AbstractContainer extends Base {
  constructor(cfg: CanvasCfg) {
    super(cfg);
    this.initContainer();
    this.initDom();
  }

  initContainer() {
    let container = this.get('container');
    if (UTIL.isString(container)) {
      container = document.getElementById(container);
      this.set('container', container);
    }
    if(!container) {
      throw new Error('invalid container');
    }
  }

  initDom() {
    const el = this.createDom();
    this.set('el', el);
    // 附加到容器
    const container = this.get('container');
    container.appendChild(el);
    // 设置初始宽度
    this.setDOMSize(this.get('width'), this.get('height'));
  }

  createDom() {
    const element = createSVGElement('svg') as SVGSVGElement;
    const context = new Defs(element);
    element.setAttribute('width', `${this.get('width')}`);
    element.setAttribute('height', `${this.get('height')}`);
    // 缓存 context 对象
    this.set('context', context);
    return element;
  }

  setDOMSize(width: number, height: number) {
    const el = this.get('el');
    if (typeof window !== 'undefined' && typeof window.document !== 'undefined') {
      el.style.width = width + PX_SUFFIX;
      el.style.height = height + PX_SUFFIX;
    }
  }
}

export default AbstractContainer;