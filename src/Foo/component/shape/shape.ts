import UTIL from '../../../../util';
import { 
  ShapeOptions,
  ModelConfig,
  IGroup,
  IElement,
 } from '../../interface';

const { upperFirst } = UTIL;

/**
 * 工厂方法的基类
 * @type Shape.FactoryBase
 */
export const ShapeFactoryBase = {
  /**
   * 默认的形状，当没有指定/匹配 shapeType 时，使用默认的
   * @type {String}
   */
  defaultShapeType: 'defaultType', // node->rect edge->line
  /**
   * 形状的 className，用于搜索
   * @type {String}
   */
  className: null,
  /**
   * 获取绘制 Shape 的工具类，无状态
   * @param  {String} type 类型
   * @return {Shape} 工具类
   */
  getShape(type?: string): ShapeOptions {
    // type 注册的string
    const self = this as any;
    const shape = self[type!] || self[self.defaultShapeType] || self['simple-circle'];
    return shape;
  },
  /**
   * 绘制图形
   * @param  {String} type  类型
   * @param  {Object} cfg 配置项
   * @param  {G.Group} group 图形的分组
   * @return {IShape} 图形对象
   */
  draw(type: string, cfg: ModelConfig, group: IGroup): IElement {
    // rect, cfg, group
    const shape = this.getShape(type);
    // Node[circle] || Node['simple-circle'];
    const rst = shape.drawShape!(cfg, group);
    // drawShape(cfg: NodeConfig, group: IGroup): IShape {
    //   const style = this.getShapeStyle!(cfg);
    //   const keyShape: IShape = group.addShape('circle', {
    //     attrs: style,
    //     className: `${this.type}-keyShape`,
    //     draggable: true,
    //   });

    //   return keyShape;
    // },
    return rst;
  },
};

/**
 * 元素的框架
 */
const ShapeFramework = {
  // 默认样式及配置
  options: {},
  /**
   * 绘制
   */
  drawShape(/* cfg, group */) { },
  /**
   * 绘制完成后的操作，便于用户继承现有的节点、边
   */
  afterDraw(/* cfg, group */) { },
  // update(cfg, item) // 默认不定义
  afterUpdate(/* cfg, item */) { },
  /**
   * 设置节点、边状态
   */
  setState(/* name, value, item */) { },
  /**
   * 获取控制点
   * @param  {Object} cfg 节点、边的配置项
   * @return {Array|null} 控制点的数组,如果为 null，则没有控制点
   */
  getControlPoints(cfg: NodeConfig | EdgeConfig) {
    return cfg.controlPoints;
  },
  /**
   * 获取控制点
   * @param  {Object} cfg 节点、边的配置项
   * @return {Array|null} 控制点的数组,如果为 null，则没有控制点
   */
  getAnchorPoints(cfg: NodeConfig | EdgeConfig) {
    const { anchorPoints: defaultAnchorPoints } = this.options as any;
    const anchorPoints = cfg.anchorPoints || defaultAnchorPoints;
    return anchorPoints;
  },
  /* 如果没定义 update 方法，每次都调用 draw 方法
  update(cfg, item) {

  }
  */
};


class Shape {

  static Node = ShapeFactoryBase;

  static registerFactory(factoryType: string, cfg: object): object {
    const className = upperFirst(factoryType); // Node
    const shapeFactory = {
      ...ShapeFactoryBase,
      ...cfg,
      className,
    }
    Shape[className] = shapeFactory;
    return shapeFactory;
  }

  static registerNode(shapeType: string, cfg: ShapeOptions, extendShapeType?: string): object {
    const nodeShapeFactory = Shape.Node;
    const extendeShapeCfg = extendShapeType ? nodeShapeFactory.getShape(extendShapeType) : ShapeFramework;
    // Node.rect = {} shapeType->rect
    const shapeObj = {
      ...extendeShapeCfg,
      ...cfg,
      type: shapeType,
      itemType: 'node'
    }
    nodeShapeFactory[shapeType] = shapeObj;
    return shapeObj;
  }

  public static getFactory(factoryType: string) {
    const className = upperFirst(factoryType);
    return (Shape as any)[className];
  }

}

// 注册 Node 的工厂方法
Shape.registerFactory('node', {
  defaultShapeType: 'circle',
});

// 注册 Edge 的工厂方法
Shape.registerFactory('edge', {
  defaultShapeType: 'line',
});

export default Shape;