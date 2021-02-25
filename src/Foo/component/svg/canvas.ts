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

  getGroupBase() {
    return Group;
  }

}

export default SvgCanvas;