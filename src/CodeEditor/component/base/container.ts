import { max, min } from '@antv/util';
import {
  IContainer, IShape, IGroup, IElement, ICanvas,
  ICtor
} from '../interfaces';
import { BBox, ElementFilterFn } from '../types';
import Timeline from '../animate/timeline';
import Element from './element';
import { isFunction, isObject, each, removeFromArray, upperFirst, isAllowCapture } from '../util/util';
import Group from './group';
import Shape from '../shape';

const SHAPE_MAP = {};
const INDEX = '_INDEX';

/**
 * 设置 canvas
 * @param {IElement} element 元素
 * @param {ICanvas}  canvas  画布
 */
function setCanvas(element: IElement, canvas: ICanvas) {
  element.set('canvas', canvas);
  if (element.isGroup()) {
    const children = element.get('children');
    if (children.length) {
      children.forEach((child) => {
        setCanvas(child, canvas);
      });
    }
  }
}

function contains(container: IContainer, element: IElement): boolean {
  const children = container.getChildren();
  return children.indexOf(element) >= 0;
}

function removeChild(container: IContainer, element: IElement, destroy: boolean = true) {
  // 不再调用 element.remove() 方法，会出现循环调用
  if (destroy) {
    element.destroy();
  } else {
    element.set('parent', null);
    element.set('canvas', null);
  }
  removeFromArray(container.getChildren(), element);
}

function getComparer(compare: Function) {
  return function (left, right) {
    const result = compare(left, right);
    return result === 0 ? left[INDEX] - right[INDEX] : result;
  };
}

abstract class Container extends Element implements IContainer {

  // container类型包括canvas、group 添加group基于自己所基于的group
  getGroupBase() {
    return Group;
  }

  // svg canvas有基于自己的Shape
  getShapeBase() {
    return Shape;
  }

  isCanvas() {
    return false;
  }

  isGroup() {
    return false;
  }

  //  增加组[]
  //  具体group的实现类 通过getGroupBase提供自组件覆盖的入口
  addGroup(...args: any[]): IGroup {
    const [groupClass] = args;
    let group;
    const tmpCfg = groupClass || {};
    const TmpGroupClass = this.getGroupBase(); // avgcanvas自己实现group 覆盖container中getGroupBase
    group = new TmpGroupClass(tmpCfg); // new SvgGroup({ id, className })

    this.add(group); //添加前将子元素原本上层dom链清理
    return group;
  }

  // 增加图形
  addShape(...args: any[]): IShape {
    // group.addShape('circle', {
    //   attrs: style,
    //   className: `${this.type}-keyShape`,
    //   draggable: true,
    // });

    const type = args[0];
    let cfg = args[1];
    if (isObject(type)) {
      cfg = type;
    } else {
      cfg['type'] = type;
    }
    let shapeType = SHAPE_MAP[cfg.type];
    if (!shapeType) {
      shapeType = upperFirst(cfg.type); //Circle
      SHAPE_MAP[cfg.type] = shapeType;
    }
    const ShapeBase = this.getShapeBase();
    const shape = new ShapeBase[shapeType](cfg); //Shape[Circle]
    this.add(shape);
    return shape;
  }

  // 添加到当前节点children
  add(element: IElement): void {
    const canvas = this.get('canvas');
    const children = this.get('children');
    const preParent = element.get('parent'); // 原先的父节点
    if (preParent) {
      removeChild(preParent, element, false);
    }

    element.set('parent', this);
    if (canvas) {
      setCanvas(element, canvas);
    }
    children.push(element);
  }

  // 根据子节点确定 BBox
  getBBox(): BBox {
    // 所有的值可能在画布的可视区外
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    const xArr = [];
    const yArr = [];
    // 将可见元素、图形以及不为空的图形分组筛选出来，用于包围盒合并
    const children = this.getChildren().filter(
      (child) =>
        child.get('visible') && (!child.isGroup() || (child.isGroup() && (child as IGroup).getChildren().length > 0))
    );
    if (children.length > 0) {
      each(children, (child: IElement) => {
        const box = child.getBBox();
        xArr.push(box.minX, box.maxX);
        yArr.push(box.minY, box.maxY);
      });
      minX = min(xArr);
      maxX = max(xArr);
      minY = min(yArr);
      maxY = max(yArr);
    } else {
      minX = 0;
      maxX = 0;
      minY = 0;
      maxY = 0;
    }
    const box = {
      x: minX,
      y: minY,
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY,
    };
    return box;
  }

  // 获取画布的包围盒
  getCanvasBBox(): BBox {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    const xArr = [];
    const yArr = [];
    // 将可见元素、图形以及不为空的图形分组筛选出来，用于包围盒合并
    const children = this.getChildren().filter(
      (child) =>
        child.get('visible') && (!child.isGroup() || (child.isGroup() && (child as IGroup).getChildren().length > 0))
    );
    if (children.length > 0) {
      each(children, (child: IElement) => {
        const box = child.getCanvasBBox();
        xArr.push(box.minX, box.maxX);
        yArr.push(box.minY, box.maxY);
      });
      minX = min(xArr);
      maxX = max(xArr);
      minY = min(yArr);
      maxY = max(yArr);
    } else {
      minX = 0;
      maxX = 0;
      minY = 0;
      maxY = 0;
    }
    const box = {
      x: minX,
      y: minY,
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY,
    };
    return box;
  }

  getDefaultCfg() {
    const cfg = super.getDefaultCfg();
    cfg['children'] = [];
    return cfg;
  }

  onAttrChange(name, value, originValue) {
    super.onAttrChange(name, value, originValue);
    if (name === 'matrix') {
      const totalMatrix = this.getTotalMatrix();
      this._applyChildrenMarix(totalMatrix);
    }
  }

  // 不但应用到自己身上还要应用于子元素
  applyMatrix(matrix: number[]) {
    const preTotalMatrix = this.getTotalMatrix();
    super.applyMatrix(matrix);
    const totalMatrix = this.getTotalMatrix();
    // totalMatrix 没有发生变化时，这里仅考虑两者都为 null 时
    // 不继续向下传递矩阵
    if (totalMatrix === preTotalMatrix) {
      return;
    }
    this._applyChildrenMarix(totalMatrix);
  }

  // 在子元素上设置矩阵
  _applyChildrenMarix(totalMatrix) {
    const children = this.getChildren();
    each(children, (child) => {
      child.applyMatrix(totalMatrix);
    });
  }

  getCanvas() {
    let canvas;
    if (this.isCanvas()) {
      canvas = this;
    } else {
      canvas = this.get('canvas');
    }
    return canvas;
  }

  getShape(x: number, y: number, ev: Event): IShape {
    // 如果不支持拾取，则直接返回
    if (!isAllowCapture(this)) {
      return null;
    }
    const children = this.getChildren();
    let shape;
    // 如果容器是 group
    if (!this.isCanvas()) {
      let v = [x, y, 1];
      // 将 x, y 转换成对应于 group 的局部坐标
      v = this.invertFromMatrix(v);
      if (!this.isClipped(v[0], v[1])) {
        shape = this._findShape(children, v[0], v[1], ev);
      }
    } else {
      shape = this._findShape(children, x, y, ev);
    }
    return shape;
  }

  _findShape(children: IElement[], x: number, y: number, ev: Event) {
    let shape = null;
    for (let i = children.length - 1; i >= 0; i--) {
      const child = children[i];
      if (isAllowCapture(child)) {
        if (child.isGroup()) {
          shape = (child as IGroup).getShape(x, y, ev);
        } else if ((child as IShape).isHit(x, y)) {
          shape = child;
        }
      }
      if (shape) {
        break;
      }
    }
    return shape;
  }

  getChildren(): IElement[] {
    return this.get('children') as IElement[];
  }

  sort() {
    const children = this.getChildren();
    // 稳定排序
    each(children, (child, index) => {
      child[INDEX] = index;
      return child;
    });
    children.sort(
      getComparer((obj1, obj2) => {
        return obj1.get('zIndex') - obj2.get('zIndex');
      })
    );
    this.onCanvasChange('sort');
  }

  clear() {
    this.set('clearing', true);
    if (this.destroyed) {
      return;
    }
    const children = this.getChildren();
    for (let i = children.length - 1; i >= 0; i--) {
      children[i].destroy(); // 销毁子元素
    }
    this.set('children', []);
    this.onCanvasChange('clear');
    this.set('clearing', false);
  }

  destroy() {
    if (this.get('destroyed')) {
      return;
    }
    this.clear();
    super.destroy();
  }

  /**
   * 获取第一个子元素
   * @return {IElement} 第一个元素
   */
  getFirst(): IElement {
    return this.getChildByIndex(0);
  }

  /**
   * 获取最后一个子元素
   * @return {IElement} 元素
   */
  getLast(): IElement {
    const children = this.getChildren();
    return this.getChildByIndex(children.length - 1);
  }

  /**
   * 根据索引获取子元素
   * @return {IElement} 第一个元素
   */
  getChildByIndex(index: number): IElement {
    const children = this.getChildren();
    return children[index];
  }

  /**
   * 子元素的数量
   * @return {number} 子元素数量
   */
  getCount(): number {
    const children = this.getChildren();
    return children.length;
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
   * 移除对应子元素
   * @param {IElement} element 子元素
   * @param {boolean} destroy 是否销毁子元素，默认为 true
   */
  removeChild(element: IElement, destroy = true) {
    if (this.contain(element)) {
      element.remove(destroy);
    }
  }

  /**
   * 查找所有匹配的元素
   * @param  {ElementFilterFn}   fn  匹配函数
   * @return {IElement[]} 元素数组
   */
  findAll(fn: ElementFilterFn): IElement[] {
    let rst: IElement[] = [];
    const children = this.getChildren();
    each(children, (element: IElement) => {
      if (fn(element)) {
        rst.push(element);
      }
      if (element.isGroup()) {
        rst = rst.concat((element as IGroup).findAll(fn));
      }
    });
    return rst;
  }

  /**
   * 查找元素，找到第一个返回
   * @param  {ElementFilterFn} fn    匹配函数
   * @return {IElement|null} 元素，可以为空
   */
  find(fn: ElementFilterFn): IElement {
    let rst: IElement = null;
    const children = this.getChildren();
    each(children, (element: IElement) => {
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

  /**
   * 根据 ID 查找元素
   * @param {string} id 元素 id
   * @return {IElement|null} 元素
   */
  findById(id: string): IElement {
    return this.find((element) => {
      return element.get('id') === id;
    });
  }

  /**
   * 该方法即将废弃，不建议使用
   * 根据 className 查找元素
   * TODO: 该方式定义暂时只给 G6 3.3 以后的版本使用，待 G6 中的 findByClassName 方法移除后，G 也需要同步移除
   * @param {string} className 元素 className
   * @return {IElement | null} 元素
   */
  findByClassName(className: string): IElement {
    return this.find((element) => {
      return element.get('className') === className;
    });
  }

  /**
   * 根据 name 查找元素列表
   * @param {string}      name 元素名称
   * @return {IElement[]} 元素
   */
  findAllByName(name: string): IElement[] {
    return this.findAll((element) => {
      return element.get('name') === name;
    });
  }
}

export default Container;
