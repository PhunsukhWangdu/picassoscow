import { CanvasCfg, ICanvas } from '../../interface';
import UTIL from '../../../../util';
import Canvas from '../base/canvas';
import Defs from '../Defs';
import Group from './group';
import { createSVGElement } from '../../../../util/dom';

const PX_SUFFIX = 'px';

class SvgCanvas extends Canvas implements ICanvas{
  constructor(cfg: CanvasCfg) {
    super(cfg);
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

  getGroupBase() {
    return Group;
  }

}

export default SvgCanvas;