import { CanvasCfg, ICanvas, IGroup, IElement } from '../../interface';
import Element from './element';
import UTIL from '../../../../util';
import Defs from '../Defs';
import Group from './group';
import Timeline from '../animate/timeline';
import { createSVGElement } from '../../../../util/dom';

const PX_SUFFIX = 'px';

/**
 * 设置 canvas
 * 工具方法 针对任何element生效 所以不放在BaseCanvas内部
 * @param {IElement} element 元素
 * @param {ICanvas}  canvas  画布
 */
function setCanvas(element: IElement, canvas: ICanvas) {
  element.set('canvas', canvas);
  if (element.isGroup()) {
    const children = element.get('children');
    if (children.length) {
      children.forEach((child: IElement) => {
        setCanvas(child, canvas);
      });
    }
  }
}

class BaseCanvas extends Element implements ICanvas {
  constructor(cfg: CanvasCfg) {
    super(cfg);
    this.initContainer();
    this.initDom();
    this.initTimeline();
  }

  initContainer() {
    let container = this.get('container');
    if (UTIL.isString(container)) {
      container = document.getElementById(container);
      this.set('container', container);
    }
    if (!container) {
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

  initTimeline() {
    const timeline = new Timeline(this);
    this.set('timeline', timeline);
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

  draw() {
    const context = this.get('context');
    const children = this.get('children');
    // child其实是group
    setClip(this, context);
    if (children.length) {
      children.forEach((child: IElement) => {
        child.draw(context);
      });
    }
  }

  getGroupBase() {
    return Group;
  }

  // 具体group的实现类 通过getGroupBase提供自组件覆盖的入口
  addGroup(...args: any[]): IGroup {
    const [groupClass] = args;
    let group;
    const tmpCfg = groupClass || {};
    const TmpGroupClass = this.getGroupBase(); // avgcanvas自己实现group
    group = new TmpGroupClass(tmpCfg); // new SvgGroup({ id, className })

    this.add(group); //添加前将子元素原本上层dom链清理
    return group;
  }

  add(element: IElement) {
    const canvas = this.getCanvas();
    const children = this.getChildren();
    // const timeline = this.get('timeline');

    // 将自己从父节点删除 不销毁
    this.removeChild(element, false);

    element.set('parent', this);

    if (canvas) {
      setCanvas(element, canvas);
    }
    // if (timeline) {
    //   setTimeline(element, timeline);
    // }
    children.push(element);
    element.onCanvasChange('add');
    // this._applyElementMatrix(element);
  }

  getChildren(): IElement[] {
    return this.get('children') as IElement[];
  }

  /**
   * 移除对应子元素
   * 与element中不一样的是，这个删除自己及后面的子节点,element还会向上删除父节点中的自己
   * @param {IElement} element 子元素
   * @param {boolean} destroy 是否销毁子元素，默认为 true
   */
  removeChild(element: IElement, destroy = true) {
    if (this.contain(element)) {
      element.remove(destroy);
    }
  }

  /**
   * 是否包含对应元素
   * @param {IElement} element 元素
   * @return {boolean}
   */
  contain(element: IElement): boolean {
    const children = this.getChildren();
    return children.indexOf(element) > -1;
  }

  /**
   * 根据 ID 查找元素
   * @param {string} id 元素 id
   * @return {IElement|null} 元素
   */
  findById(id: string): IElement | null{
    return this.find((element: IElement) => {
      return element.get('id') === id;
    });
  }

  /**
   * 查找元素，找到第一个返回
   * @param  fn    匹配函数
   * @return {IElement|null} 元素，可以为空
   */
  find(fn: (v:IElement) => boolean): IElement | null {
    let rst: IElement | null = null;
    const children = this.getChildren();
    UTIL.each(children, (element: IElement) => {
      if (fn(element)) {
        rst = element;
      } else if (element.isGroup()) {
        rst = (element as IGroup).find(fn);
      }
      if (rst) {
        return false;
      }
    });
    return rst;
  }
}

export default BaseCanvas;