import { Particle } from "babylonjs";
import { ClassType } from "react";

// Node Edge Combo 实例
export type Item = INode | IEdge | ICombo;

export interface States {
  [key: string]: INode[];
}

// item 的配置项
export type IItemBaseConfig = Partial<{
  /**
   * id
   */
  id: string;

  /**
   * 类型
   */
  type: 'item' | 'node' | 'edge' | 'combo' | 'vedge';

  /**
   * data model
   */
  model: ModelConfig;

  /**
   * G Group
   */
  group: IGroup;

  /**
   * is open animate
   */
  animate: boolean;

  /**
   * visible - not group visible
   */
  visible: boolean;

  /**
   * locked - lock node
   */
  locked: boolean;
  /**
   * capture event
   */
  event: boolean;
  /**
   * key shape to calculate item's bbox
   */
  // keyShape: IShapeBase;
  /**
   * item's states, such as selected or active
   * @type Array
   */
  states: string[];

  /**
   * Item 的样式
   */
  styles: ModelStyle;

  source: string | Item;
  target: string | Item;

  linkCenter: boolean;
}> & {
  [key: string]: any;
};

export type ITEM_TYPE = 'node' | 'edge' | 'combo' | 'vedge';
/**
 * @interface IObservable
 * 可以绑定事件的接口
 */
export interface IObservable {
  /**
   * 绑定事件
   * @param  eventName 事件名
   * @param callback  回调函数
   */
  on(eventName: string, callback: Function): void;
  /**
   * 移除事件
   */
  off(): void;
  /**
   * 移除事件
   * @param eventName 事件名
   */
  off(eventName: string): void;
  /**
   * 移除事件
   * @param eventName 事件名
   * @param callback  回调函数
   */
  off(eventName: string, callback: Function): void;
  /**
   * 触发事件, trigger 的别名函数
   * @param eventName 事件名称
   * @param eventObject 参数
   */
  emit(eventName: string, eventObject: object): void;

  getEvents(): any;
}

/**
 * @interface IBase
 * 所有图形类公共的接口，提供 get,set 方法
 */
export interface IBase extends IObservable {
  cfg: IObject;
  /**
   * 获取属性值
   * @param  {string} name 属性名
   * @return {any} 属性值
   */
  get(name: string): any;
  /**
   * 设置属性值
   * @param {string} name  属性名称
   * @param {any}    value 属性值
   */
  set(name: string, value: any): void;

  /**
   * 是否销毁
   * @type {boolean}
   */
  destroyed: boolean;

  /**
   * 销毁对象
   */
  destroy(): void;
}

export interface IItemBase {
  _cfg: IItemBaseConfig | null;

  destroyed: boolean;

  isItem: () => boolean;

  setOriginStyle: (cfg?: ModelConfig) => void;

  getShapeStyleByName: (name?: string) => ShapeStyle;

  /**
   * 获取当前元素的所有状态
   * @return {Array} 元素的所有状态
   */
  getStates: () => string[];

  /**
   * 当前元素是否处于某状态
   * @param {String} state 状态名
   * @return {Boolean} 是否处于某状态
   */
  hasState: (state: string) => boolean;

  getStateStyle: (state: string) => ShapeStyle;

  getOriginStyle: () => ShapeStyle;

  getCurrentStatesStyle: () => ShapeStyle;

  /**
   * 更改元素状态， visible 不属于这个范畴
   * @internal 仅提供内部类 graph 使用
   * @param {String} state 状态名
   * @param {Boolean} value 节点状态值
   */
  setState: (state: string, value: string | boolean) => void;

  clearStates: (states?: string | string[]) => void;

  /**
   * 节点的图形容器
   * @return {G.Group} 图形容器
   */
  // getContainer: () => IGroup;

  /**
   * 节点的关键形状，用于计算节点大小，连线截距等
   * @return {IShapeBase} 关键形状
   */
  // getKeyShape: () => IShapeBase;

  /**
   * 节点 / 边 / Combo 的数据模型
   * @return {Object} 数据模型
   */
  getModel: () => NodeConfig | EdgeConfig | ComboConfig | TreeGraphData;

  /**
   * 节点类型
   * @return {string} 节点的类型
   */
  getType: () => ITEM_TYPE;

  /**
   * 获取 Item 的ID
   */
  getID: () => string;

  /**
   * 获取 图形 的配置项
   */
  getShapeCfg: (model: ModelConfig) => ModelConfig;

  /**
   * 刷新一般用于处理几种情况
   * 1. item model 在外部被改变
   * 2. 边的节点位置发生改变，需要重新计算边
   *
   * 因为数据从外部被修改无法判断一些属性是否被修改，直接走位置和 shape 的更新
   */
  refresh: () => void;

  /**
   * 将更新应用到 model 上，刷新属性
   * @internal 仅提供给 Graph 使用，外部直接调用 graph.update 接口
   * @param  {Object} cfg       配置项，可以是增量信息
   * @param  {boolean} onlyMove 是否仅移动，只有 node 和 combo 可能是 true
   */
  update: (cfg: ModelConfig, onlyMove?: boolean) => void;

  /**
   * 更新元素内容，样式
   */
  updateShape: () => void;

  /**
   * 更新位置，避免整体重绘
   * @param {object} cfg 待更新数据
   */
  // updatePosition: (cfg: Point) => void;

  /**
   * 绘制元素
   */
  draw: () => void;

  /**
   * 获取 item 的包围盒，这个包围盒是相对于 item 自己，不会将 matrix 计算在内
   */
  // getBBox: () => IBBox;

  /**
   * 获取 item 相对于画布的包围盒，会将从顶层到当前元素的 matrix 都计算在内
   */
  // getCanvasBBox: () => IBBox;

  /**
   * 将元素放到最前面
   */
  toFront: () => void;

  /**
   * 将元素放到最后面
   */
  toBack: () => void;

  /**
   * 显示元素
   */
  show: () => void;

  /**
   * 隐藏元素
   */
  hide: () => void;

  /**
   * 更改是否显示
   * @param  {Boolean} visible 是否显示
   */
  changeVisibility: (visible: boolean) => void;

  /**
   * 是否捕获及触发该元素的交互事件
   * @param {Boolean} enable 标识位
   */
  enableCapture: (enable: boolean) => void;

  isVisible: () => boolean;

  isOnlyMove: (cfg: ModelConfig) => boolean;

  get: <T = any>(key: string) => T;
  set: <T = any>(key: string, value: T) => void;

  destroy: () => void;
}

export interface ICombo extends INode {
  /**
   * 获取 Combo 中所有的子元素，包括 Combo、Node 及 Edge
   */
  getChildren: () => { nodes: INode[]; combos: ICombo[] };

  /**
   * 获取 Combo 中所有节点
   */
  getNodes: () => INode[];

  /**
   * 获取 Combo 中所有子 combo
   */
  getCombos: () => INode[];

  /**
   * 向 Combo 中增加 combo
   * @param item 节点或 combo 的 Item 实例
   * @return boolean 添加成功返回 true，否则返回 false
   */
  addChild: (item: INode | ICombo) => boolean;

  /**
   * 向 Combo 中增加 combo
   * @param combo Combo 实例
   * @return boolean 添加成功返回 true，否则返回 false
   */
  addCombo: (combo: ICombo) => boolean;

  /**
   * 向 Combo 中添加节点
   * @param node 节点实例
   * @return boolean 添加成功返回 true，否则返回 false
   */
  addNode: (node: string | INode) => boolean;

  /**
   * 从 Combo 中移除子元素
   * @param item Combo 或 Node 实例
   * @return boolean 添加成功返回 true，否则返回 false
   */
  removeChild: (item: ICombo | INode) => boolean;

  /**
   * 从 Combo 中移除指定的 combo
   * @param combo Combo 实例
   * @return boolean 移除成功返回 true，否则返回 false
   */
  removeCombo: (combo: ICombo) => boolean;

  /**
   * 向 Combo 中移除指定的节点
   * @param node 节点实例
   * @return boolean 移除成功返回 true，否则返回 false
   */
  removeNode: (node: INode) => boolean;
}

export interface IEdge extends IItemBase {
  setSource: (source: INode | ICombo) => void;
  setTarget: (target: INode | ICombo) => void;
  getSource: () => INode | ICombo;
  getTarget: () => INode | ICombo;
}

export interface INode extends IItemBase {
  // /**
  //  * 获取从节点关联的所有边
  //  * @return {Array} 边的集合
  //  */
  // getEdges: () => IEdge[];

  // /**
  //  * 获取引入节点的边 target == this
  //  * @return {Array} 边的集合
  //  */
  // getInEdges: () => IEdge[];

  // /**
  //  * 获取从节点引出的边 source == this
  //  * @return {Array} 边的集合
  //  */
  // getOutEdges: () => IEdge[];

  // /**
  //  * 根据锚点的索引获取连接点
  //  * @param  {Number} index 索引
  //  * @return {Object} 连接点 {x,y}
  //  */
  // getLinkPointByAnchor: (index: number) => IPoint;

  // /**
  //  * 获取连接点
  //  * @param {Object} point 节点外面的一个点，用于计算交点、最近的锚点
  //  * @return {Object} 连接点 {x,y}
  //  */
  // getLinkPoint: (point: IPoint) => IPoint | null;

  // /**
  //  * 添加边
  //  * @param {Edge} edge 边
  //  */
  // addEdge: (edge: IEdge) => void;

  // /**
  //  * 移除边
  //  * @param {Edge} edge 边
  //  */
  // removeEdge: (edge: IEdge) => void;

  // /**
  //  * 获取锚点的定义
  //  * @return {array} anchorPoints， {x,y,...cfg}
  //  */
  // getAnchorPoints: () => IPoint[] | number[][];

  // hasLocked: () => boolean;

  // lock: () => void;

  // unlock: () => void;

  // /**
  //  * 获取节点所有的邻居节点
  //  *
  //  * @returns {INode[]}
  //  * @memberof INode
  //  */
  // getNeighbors: (type?: 'source' | 'target' | undefined) => INode[];
  [key: string]: any;
}

export interface NodeMap {
  [key: string]: INode;
}

export type LabelStyle = Partial<{
  rotate: number;
  textAlign: 'center' | 'start' | 'end' | 'left' | 'right';
  angle: number;
  x: number;
  y: number;
  text: string;
  stroke: string | null;
  opacity: number;
  fontSize: number;
  fontStyle: 'normal' | 'italic' | 'oblique';
  fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number;
  fill: string | null;
  rotateCenter: string;
  lineWidth: number;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  position: string;
  textBaseline: 'top' | 'middle' | 'bottom' | 'hanging' | 'alphabetic' | 'ideographic';
  offset: number;
  background?: {
    fill?: string;
    stroke?: string;
    lineWidth?: number;
    radius?: number[] | number;
    padding?: number[] | number;
  };
}>;

export type ILabelConfig = Partial<{
  position: string;
  offset: number;
  refX: number;
  refY: number;
  autoRotate: boolean;
  style: LabelStyle;
}>;

export interface ModelConfig extends ModelStyle {
  // 节点或边的类型
  type?: string;
  label?: string | LabelStyle;
  labelCfg?: ILabelConfig;
  x?: number;
  y?: number;
  size?: number | number[];
  color?: string;
  anchorPoints?: number[][];
  startPoint?: {
    x: number;
    y: number;
  };
  endPoint?: {
    x: number;
    y: number;
  };
  visible?: boolean;
}

export interface TreeGraphData {
  id: string;
  label?: string;
  x?: number;
  y?: number;
  children?: TreeGraphData[];
  data?: ModelConfig;
  side?: 'left' | 'right';
  depth?: number;
  collapsed?: boolean;
  style?:
  | ShapeStyle
  | {
    [key: string]: ShapeStyle;
  };
  stateStyles?: StateStyles;
  [key: string]: unknown;
}

export interface NodeConfig extends ModelConfig {
  id: string;
  groupId?: string;
  comboId?: string;
  children?: TreeGraphData[];
  description?: string;
  descriptionCfg?: {
    style?: object;
    [key: string]: any;
  };
  img?: string;
  innerR?: number;
  direction?: string;
  preRect?: {
    show?: boolean;
    [key: string]: any;
  };
  logoIcon?: {
    show?: boolean;
    [key: string]: any;
  };
  stateIcon?: {
    show?: boolean;
    [key: string]: any;
  };
  linkPoints?: {
    top?: boolean;
    right?: boolean;
    bottom?: boolean;
    left?: boolean;
    size?: number;
    lineWidth?: number;
    fill?: string;
    stroke?: string;
    r?: number;
    [key: string]: any;
  };
  icon?: {
    show?: boolean;
    // icon的地址，字符串类型
    img?: string;
    width?: number;
    height?: number;
    offset?: number;
  };
  clipCfg?: {
    show?: boolean;
    type?: string;
    // circle
    r?: number;
    // ellipse
    rx?: number;
    ry?: number;
    // rect
    width?: number;
    height?: number;
    // polygon
    points?: number[][];
    // path
    path?: Array<Array<string | number>>;
    // 坐标
    x?: number;
    y?: number;
    // clip 的属性样式
    // style?: ShapeStyle
  };
}

export interface IPoint {
  x: number;
  y: number;
  // 获取连接点时使用
  anchorIndex?: number;
  [key: string]: number | undefined;
}

// 自环边配置
export type LoopConfig = Partial<{
  dist: number;
  position: string;
  // 如果逆时针画，交换起点和终点
  clockwise: boolean;
}>;

export interface EdgeConfig extends ModelConfig {
  id?: string;
  source?: string | IElement;
  target?: string | IElement;
  sourceNode?: Node;
  targetNode?: Node;
  startPoint?: IPoint;
  endPoint?: IPoint;
  controlPoints?: IPoint[];
  curveOffset?: number | number[];
  // loop edge config
  loopCfg?: LoopConfig;
  labelCfg?: ILabelConfig;
  curvePosition?: number | number[];
}

export interface ComboTree {
  id: string;
  label?: string | LabelStyle;
  children?: ComboTree[];
  depth?: number;
  parentId?: string;
  removed?: boolean;
  itemType?: 'node' | 'combo';
  [key: string]: unknown;
}


export interface ComboConfig extends ModelConfig {
  id: string;
  parentId?: string;
  children?: ComboTree[];
  depth?: number;
  padding?: number | number[];
  collapseIcon?: Partial<{
    show: boolean;
    collapseSymbol: any;
    expandSymbol: any;
    r: number;
    lineWidth: number;
    stroke: string;
    offsetX: number;
    offsetY: number;
  }>;
}

export interface GraphData {
  nodes?: NodeConfig[];
  edges?: EdgeConfig[];
  combos?: ComboConfig[];
}

export interface LayoutConfig {
  type?: string;
  [key: string]: unknown;
}

export type Padding = number | string | number[];

export interface ModeOption {
  type: string;
  delegate?: boolean;
  delegateStyle?: object;
  updateEdge?: boolean;
  trigger?: string;
  enableDelegate?: boolean;
  maxZoom?: number;
  minZoom?: number;
  enableOptimize?: boolean;
  optimizeZoom?: number;
  multiple?: boolean;
  activeState?: string;
  inactiveState?: string;
  comboActiveState?: string;
  selectedState?: string;
  onlyChangeComboSize?: boolean;
  includeEdges?: boolean;
  direction?: 'x' | 'y';
  scalableRange?: number;
  offset?: number;
  sensitivity?: number;
  fixSelectedItems?: Partial<{
    fixAll: boolean;
    fixLineWidth: boolean;
    fixLabel: boolean;
    fixState: string;
  }>;
  key?: string | undefined;
  // edgeConfig?: EdgeConfig;
  functionName?: string;
  functionParams?: any[];
  relayout?: boolean;
  // shouldUpdate?: (e: IG6GraphEvent) => boolean;
  // shouldBegin?: (e: IG6GraphEvent) => boolean;
  // shouldEnd?: (e: IG6GraphEvent) => boolean;
  // onChange?: (item?: Item, judge?: boolean) => unknown;
  // onSelect?: (selectedNodes?: Item[], selectedEdges?: Item[]) => unknown;
  // onDeselect?: (selectedNodes?: Item[], selectedEdges?: Item[]) => unknown;
  // formatText?: (data: { [key: string]: unknown }) => string;
}

export type ModeType = string | ModeOption;

export interface Modes {
  default?: ModeType[];
  [key: string]: ModeType[] | undefined;
}

export interface ArrowConfig {
  d?: number;
  path?: string;
  stroke?: string;
  fill?: string;
}

// Shape types
export type ShapeStyle = Partial<{
  x: number;
  y: number;
  r: number;
  radius: number;
  width: number;
  height: number;
  offset: number | number[];
  stroke: string | null;
  strokeOpacity: number;
  fill: string | null;
  fillOpacity: number;
  lineWidth: number;
  lineAppendWidth: number;
  lineDash: number[];
  path: string | object[];
  points: object[];
  matrix: number[];
  opacity: number;
  size: number | number[];
  endArrow: boolean | ArrowConfig;
  startArrow: boolean | ArrowConfig;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  cursor: string;
  position: string;
  fontSize: number;

  keepVisualSize: boolean;
}>;

export interface StateStyles {
  [key: string]:
  | ShapeStyle
  | {
    [key: string]: ShapeStyle;
  };
}

export type ModelStyle = Partial<{
  [key: string]: unknown;
  style: ShapeStyle;
  stateStyles: StateStyles;
}>;

export type AnimateCfg = {
  /**
   * 动画执行时间
   * @type {number}
   */
  duration: number;
  /**
   * 动画缓动效果
   * @type {string}}
   */
  easing?: string;
  /**
   * 动画执行的延迟时间
   * @type {function}}
   */
  delay?: number;
  /**
   * 是否重复执行动画
   * @type {boolean}}
   */
  repeat?: boolean;
  /**
   * 动画执行完时的回调函数
   * @type {function}}
   */
  callback?: () => void;
  /**
   * 动画暂停时的回调函数
   * @type {function}}
   */
  pauseCallback?: () => void;
  /**
   * 动画恢复(重新唤醒)时的回调函数
   * @type {function}}
   */
  resumeCallback?: () => void;
};

export interface GraphAnimateConfig extends AnimateCfg {
  /**
   * 回调函数，用于自定义节点运动路径。
   */
  onFrame?: (item: Item, ratio: number, data?: GraphData, originAttrs?: ShapeStyle) => unknown;
}

export interface GraphOptions {
  /**
   * 图的 DOM 容器，可以传入该 DOM 的 id 或者直接传入容器的 HTML 节点对象
   */
  container: string | HTMLElement;
  /**
   * 指定画布宽度，单位为 'px'
   */
  width: number;
  /**
   * 指定画布高度，单位为 'px'
   */
  height: number;
  /**
   * renderer canvas or svg
   */
  renderer?: string;

  fitView?: boolean;

  fitCenter?: boolean;

  layout?: LayoutConfig;

  /**
   * 图适应画布时，指定四周的留白。
   * 可以是一个值, 例如：fitViewPadding: 20
   * 也可以是一个数组，例如：fitViewPadding: [20, 40, 50,20]
   * 当指定一个值时，四边的边距都相等，当指定数组时，数组内数值依次对应 上，右，下，左四边的边距。
   */
  fitViewPadding?: Padding;
  /**
   * 各种元素是否在一个分组内，决定节点和边的层级问题，默认情况下所有的节点在一个分组中，所有的边在一个分组中，当这个参数为 false 时，节点和边的层级根据生成的顺序确定。
   * 默认值：true
   */
  groupByTypes?: boolean;

  // 是否有向图
  directed?: boolean;

  /**
   * 当图中元素更新，或视口变换时，是否自动重绘。建议在批量操作节点时关闭，以提高性能，完成批量操作后再打开，参见后面的 setAutoPaint() 方法。
   * 默认值：true
   */
  autoPaint?: boolean;

  /**
   * 设置画布的模式。详情可见G6中的Mode文档。
   */
  modes?: Modes;

  /**
   * 默认状态下节点的配置，比如 type, size, color。会被写入的 data 覆盖。
   */
  defaultNode?: Partial<{
    type: string;
    size: number | number[];
    color: string;
  }> &
  ModelStyle;

  /**
   * 默认状态下边的配置，比如 type, size, color。会被写入的 data 覆盖。
   */
  defaultEdge?: Partial<{
    type: string;
    size: number | number[];
    color: string;
  }> &
  ModelStyle;

  /**
   * Combo 默认配置
   */
  defaultCombo?: Partial<{
    type: string;
    size: number | number[];
    color: string;
  }> &
  ModelStyle;

  nodeStateStyles?: StateStyles;

  edgeStateStyles?: StateStyles;

  // Combo 状态样式
  comboStateStyles?: StateStyles;

  /**
   * 向 graph 注册插件。插件机制请见：plugin
   */
  plugins?: any[];
  /**
   * 是否启用全局动画。
   */
  animate?: boolean;

  /**
   * 动画配置项，仅在animate为true时有效。
   */
  animateCfg?: GraphAnimateConfig;
  /**
   * 最小缩放比例
   * 默认值 0.2
   */
  minZoom?: number;
  /**
   * 最大缩放比例
   * 默认值 10
   */
  maxZoom?: number;

  groupType?: string;

  /**
   * Edge 是否连接到节点中间
   */
  linkCenter?: boolean;

  /**
   * 是否启用 stack，即是否开启 redo & undo 功能
   */
  enabledStack?: boolean;

  /**
   * redo & undo 最大步数, 只有当 enabledStack 为 true 时才起作用
   */
  maxStep?: number;

  /**
   * 存储图上的 tooltip dom，方便销毁
   */
  tooltips?: [];
}

export type CanvasCfg = {
  /**
   * 容器
   * @type {string|HTMLElement}
   */
  container: string | HTMLElement | Element;
  /**
   * 画布宽度
   * @type {number}
   */
  width: number;
  /**
   * 画布高度
   * @type {number}
   */
  height: number;
  /**
   * 是否可监听
   * @type {boolean}
   */
  capture?: boolean;
  /**
   * 只读属性，渲染引擎
   * @type {string}
   */
  // renderer?: Renderer;

  /**
   * 画布的 cursor 样式
   * @type {Cursor}
   */
  // cursor?: Cursor;
  [key: string]: any;
};

export interface ICtor<T> {
  new (cfg: any): T;
}

export interface IObject {
  [key: string]: any;
}

export interface IAbstractGraph {
  getDefaultCfg: () => Partial<GraphOptions>;
  get: <T = any>(key: string) => T;
  set: <T = any>(key: string | object, value?: T) => any;
  findById: (id: string) => Item | null;
  translate?: (dx: number, dy: number) => void;
  // zoom: (ratio: number, center?: Point) => void;
  [key: string]: any,
}

export type ShapeOptions = Partial<{
  shapeType: string;
  [key: string]: any;
}>
export interface IGroup {
  [key: string]: any;
}
export interface IElement extends IBase {
  /**
   * 复制对象
   */
  clone(): IElement;
  /**
  * 执行动画
  * @param {ElementAttrs} toAttrs 动画最终状态
  * @param {number}       duration 动画执行时间
  * @param {string}       easing 动画缓动效果
  * @param {function}     callback 动画执行后的回调
  * @param {number}       delay 动画延迟时间
  */
  animate(toAttrs: IObject, duration: number, easing?: string, callback?: Function, delay?: number): any;

  /**
   * 获取所属的 Canvas
   * @return {ICanvas} Canvas 对象
   */
  getCanvas(): ICanvas;

  /**
   * 获取父元素
   * @return {IContainer} 父元素一般是 Group 或者是 Canvas
   */
  getParent(): ICanvas | IGroup;

  [key: string]: any;
}


export interface ICanvas extends IElement {
  draw(): void;
  /**
   * 添加图形分组，并设置配置项
   * @param {GroupCfg} cfg 图形分组的配置项
   * @returns 添加的图形分组
   */
  addGroup(cfg: IObject): IGroup;
  /**
   * 获取所有的子元素
   * @return {IElement[]} 子元素的集合
   */
  getChildren(): IElement[];
  /**
   * 移除对应子元素
   * @param {IElement} element 子元素
   * @param {boolean} destroy 是否销毁子元素，默认为 true
   */
  removeChild(element: IElement, destroy?: boolean): void;

  /**
   * 从父元素中移除
   * @param {boolean} destroy 是否同时销毁
   */
  remove(destroy?: boolean): void;

}



type ColorType = string | null;

export type ShapeAttrs = {
  /** x 坐标 */
  x?: number;
  /** y 坐标 */
  y?: number;
  /** 圆半径 */
  r?: number;
  /** 描边颜色 */
  stroke?: ColorType;
  /** 描边透明度 */
  strokeOpacity?: number;
  /** 填充颜色 */
  fill?: ColorType;
  /** 填充透明度 */
  fillOpacity?: number;
  /** 整体透明度 */
  opacity?: number;
  /** 线宽 */
  lineWidth?: number;
  /** 指定如何绘制每一条线段末端 */
  lineCap?: 'butt' | 'round' | 'square';
  /** 用来设置2个长度不为0的相连部分（线段，圆弧，曲线）如何连接在一起的属性（长度为0的变形部分，其指定的末端和控制点在同一位置，会被忽略） */
  lineJoin?: 'bevel' | 'round' | 'miter';
  /**
   * 设置线的虚线样式，可以指定一个数组。一组描述交替绘制线段和间距（坐标空间单位）长度的数字。 如果数组元素的数量是奇数， 数组的元素会被复制并重复。例如， [5, 15, 25] 会变成 [5, 15, 25, 5, 15, 25]。这个属性取决于浏览器是否支持 setLineDash() 函数。
   */
  lineDash?: number[] | null;
  /** Path 路径 */
  path?: string | object[];
  /** 图形坐标点 */
  points?: object[];
  /** 宽度 */
  width?: number;
  /** 高度 */
  height?: number;
  /** 阴影模糊效果程度 */
  shadowBlur?: number;
  /** 阴影颜色 */
  shadowColor?: ColorType;
  /** 阴影 x 方向偏移量 */
  shadowOffsetX?: number;
  /** 阴影 y 方向偏移量 */
  shadowOffsetY?: number;
  /** 设置文本内容的当前对齐方式 */
  textAlign?: 'start' | 'center' | 'end' | 'left' | 'right';
  /** 设置在绘制文本时使用的当前文本基线 */
  textBaseline?: 'top' | 'hanging' | 'middle' | 'alphabetic' | 'ideographic' | 'bottom';
  /** 字体样式 */
  fontStyle?: 'normal' | 'italic' | 'oblique';
  /** 文本字体大小 */
  fontSize?: number;
  /** 文本字体 */
  fontFamily?: string;
  /** 文本粗细 */
  fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number;
  /** 字体变体 */
  fontVariant?: 'normal' | 'small-caps' | string;
  /** 文本行高 */
  lineHeight?: number;
  [key: string]: any;
};