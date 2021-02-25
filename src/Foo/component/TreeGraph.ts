import EventEmitter from '../../../util/event-emitter';
import UTIL from '../../../util';
import {
  Item, ITEM_TYPE, GraphOptions, GraphData, NodeConfig, EdgeConfig, ComboConfig, NodeMap, States, TreeGraphData,
  ModelConfig,
  IAbstractGraph,
  ICanvas,
  IGroup,
  ShapeStyle
} from '../interface';
import SVGCanvas from './SvgCanvas';
import Hierarchy from '@antv/hierarchy';
import Base from './base/base';
import ItemController from './controller/item';
import { Particle } from 'babylonjs';
import Global from '../global';

export interface PrivateGraphOption extends GraphOptions {
  data: GraphData;

  // capture event
  event: boolean;

  nodes: NodeConfig[];

  edges: EdgeConfig[];

  vedges: EdgeConfig[];

  combos: ComboConfig[];

  itemMap: NodeMap;

  callback: () => void;

  /**
   * 格式：
   * {
   *  hover: [Node, Node],
   *  selected: [Node]
   * }
   */
  states: States;
}

export class TreeGraph extends Base implements IAbstractGraph {

  cfg: GraphOptions & { [key: string]: any };

  constructor(cfg: GraphOptions) {
    super();
    this.cfg = UTIL.deepMix(this.getDefaultCfg(), cfg);
    this.init();

    const defaultNode = this.get('defaultNode');
    if (!defaultNode) {
      this.set('defaultNode', { type: 'circle' });
    }
    if (!defaultNode.type) {
      defaultNode.type = 'circle';
      this.set('defaultNode', defaultNode);
    }
    this.destroyed = false;

    this.set('layoutMethod', this.getLayout());
  }

  protected init() {
    this.initCanvas();

    const itemController = new ItemController(this);

    this.set('itemController', itemController);

    this.initGroups();

    // // 初始化布局机制
    // this.initLayoutController();

    // // 初始化事件机制
    // this.initEventController();

    // /** 初始化插件 */
    // this.initPlugins();
  }

   // 初始化所有 Group
   protected initGroups(): void {
    const canvas: ICanvas = this.get('canvas');
    const el: HTMLElement = this.get('canvas').get('el');
    const { id } = el;

    const group: IGroup = canvas.addGroup({
      id: `${id}-root`,
      className: Global.rootContainerClassName,
    });

    if (this.get('groupByTypes')) {
      const edgeGroup: IGroup = group.addGroup({
        id: `${id}-edge`,
        className: Global.edgeContainerClassName,
      });

      const nodeGroup: IGroup = group.addGroup({
        id: `${id}-node`,
        className: Global.nodeContainerClassName,
      });

      this.set({ nodeGroup, edgeGroup });
    }

    const delegateGroup: IGroup = group.addGroup({
      id: `${id}-delegate`,
      className: Global.delegateContainerClassName,
    });

    this.set({ delegateGroup });
    this.set('group', group);
  }


  // 每个节点的布局方式
  private getLayout() {
    const layout = this.get('layout');
    if (!layout) {
      return null;
    }
    if (typeof layout === 'function') {
      return layout;
    }
    if (!layout.type) {
      layout.type = 'dendrogram';
    }
    if (!layout.direction) {
      layout.direction = 'TB';
    }
    // if (layout.radial) {
    //   return (data: any) => {
    //     const layoutData = Hierarchy[layout.type](data, layout);
    //     radialLayout(layoutData);
    //     return layoutData;
    //   };
    // }
    return (data: any) => Hierarchy[layout.type](data, layout);
  }

  // eslint-disable-next-line class-methods-use-this
  public getDefaultCfg(): Partial<PrivateGraphOption> {
    return {
      /**
       * Container could be dom object or dom id
       */
      container: undefined,

      /**
       * Canvas width
       * unit pixel if undefined force fit width
       */
      width: undefined,

      /**
       * Canvas height
       * unit pixel if undefined force fit height
       */
      height: undefined,
      /**
       * renderer canvas or svg
       * @type {string}
       */
      renderer: 'canvas',
      /**
       * control graph behaviors
       */
      modes: {},
      /**
       * 注册插件
       */
      plugins: [],
      /**
       * source data
       */
      data: {},
      /**
       * Fit view padding (client scale)
       */
      fitViewPadding: 10,
      /**
       * Minimum scale size
       */
      minZoom: 0.2,
      /**
       * Maxmum scale size
       */
      maxZoom: 10,
      /**
       *  capture events
       */
      event: true,
      /**
       * group node & edges into different graphic groups
       */
      groupByTypes: true,
      /**
       * determine if it's a directed graph
       */
      directed: false,
      /**
       * when data or shape changed, should canvas draw automatically
       */
      autoPaint: true,
      /**
       * store all the node instances
       */
      nodes: [],
      /**
       * store all the edge instances
       */
      edges: [],
      /**
       * store all the combo instances
       */
      combos: [],
      /**
       * store all the edge instances which are virtual edges related to collapsed combo
       */
      vedges: [],
      /**
       * all the instances indexed by id
       */
      itemMap: {},
      /**
       * 边直接连接到节点的中心，不再考虑锚点
       */
      linkCenter: false,
      /**
       * 默认的节点配置，data 上定义的配置会覆盖这些配置。例如：
       * defaultNode: {
       *  type: 'rect',
       *  size: [60, 40],
       *  style: {
       *    //... 样式配置项
       *  }
       * }
       * 若数据项为 { id: 'node', x: 100, y: 100 }
       * 实际创建的节点模型是 { id: 'node', x: 100, y: 100， type: 'rect', size: [60, 40] }
       * 若数据项为 { id: 'node', x: 100, y: 100, type: 'circle' }
       * 实际创建的节点模型是 { id: 'node', x: 100, y: 100， type: 'circle', size: [60, 40] }
       */
      defaultNode: {},
      /**
       * 默认边配置，data 上定义的配置会覆盖这些配置。用法同 defaultNode
       */
      defaultEdge: {},
      /**
       * 节点默认样式，也可以添加状态样式
       * 例如：
       * const graph = new G6.Graph({
       *  nodeStateStyles: {
       *    selected: { fill: '#ccc', stroke: '#666' },
       *    active: { lineWidth: 2 }
       *  },
       *  ...
       * });
       *
       */
      nodeStateStyles: {},
      /**
       * 边默认样式，用法同nodeStateStyle
       */
      edgeStateStyles: {},
      /**
       * graph 状态
       */
      states: {},
      /**
       * 是否启用全局动画
       */
      animate: false,
      /**
       * 动画设置,仅在 animate 为 true 时有效
       */
      animateCfg: {
        /**
         * 帧回调函数，用于自定义节点运动路径，为空时线性运动
         */
        onFrame: undefined,
        /**
         * 动画时长(ms)
         */
        duration: 500,
        /**
         * 指定动画动效
         */
        easing: 'easeLinear',
      },
      callback: undefined,

      // 默认不启用 undo & redo 功能
      enabledStack: false,

      // 只有当 enabledStack 为 true 时才起作用
      maxStep: 10,

      // 存储图上的 tooltip dom，方便销毁
      tooltips: [],
    };
  }

  protected initCanvas() {
    let container: string | HTMLElement | Element | null = this.get('container');

    if (typeof container === 'string') {
      container = document.getElementById(container);
      this.set('container', container);
    }

    if (!container) {
      throw new Error('invalid container');
    }

    const width: number = this.get('width');
    const height: number = this.get('height');
    const renderer: string = this.get('renderer');

    let canvas;

    canvas = new SVGCanvas({
      container,
      width,
      height,
    });

    this.set('canvas', canvas);
  }

  public data(data?: GraphData | TreeGraphData): void {
    this.set('data', data);
  }

  public render(): void {
    const self = this;

    const data: TreeGraphData = self.get('data');

    if (!data) {
      throw new Error('data must be defined first');
    }

    self.clear();

    // self.emit('beforerender');

    self.layout(this.get('fitView'));

    // self.emit('afterrender');
  }

  public clear(): TreeGraph {
    const canvas: SVGCanvas = this.get('canvas');

    canvas.clear();
    // 清空画布时同时清除数据
    this.set({ itemMap: {}, nodes: [], edges: [], groups: [], combos: [], comboTrees: [] });

    return this;
  }

  // 整体画布布局准备
  public layout(fitView?: boolean) {
    const self = this;
    const data: TreeGraphData = self.get('data');

    const layoutMethod = self.get('layoutMethod');

    const layoutData = layoutMethod(data, self.get('layout'));

    const animate: boolean = self.get('animate');

    // self.emit('beforerefreshlayout', { data, layoutData });
    // self.emit('beforelayout');

    self.innerUpdateChild(layoutData, undefined, animate);

    if (fitView) {
      const viewController = self.get('viewController');
      viewController.fitView();
    }

    if (!animate) {
      // 如果没有动画，目前仅更新了节点的位置，刷新一下边的样式
      // self.refresh();
      self.paint();
    } else {
      self.layoutAnimate(layoutData);
    }

    // self.emit('afterrefreshlayout', { data, layoutData });
    // self.emit('afterlayout');
  }

  public paint(): void {
    // this.emit('beforepaint');
    this.get('canvas').draw();
    // this.emit('afterpaint');
  }

  public layoutAnimate(
    data: TreeGraphData,
    onFrame?: (
      item: Item,
      ratio: number,
      originAttrs?: ShapeStyle,
      data?: TreeGraphData,
    ) => unknown,
  ): void {
    const self = this;
    const animateCfg = this.get('animateCfg');
    // self.emit('beforeanimate', { data });
    // 如果边中没有指定锚点，但是本身有锚点控制，在动画过程中保持锚点不变
    // this.get('edges').forEach((edge) => {
    //   const model = edge.get('model');
    //   if (!model.sourceAnchor) {
    //     model.sourceAnchor = edge.get('sourceAnchorIndex');
    //   }
    // });

    this.get('canvas').animate(
      (ratio: number) => {
        UTIL.deepTraverse<TreeGraphData>(data, (child) => {
          const node = self.findById(child.id);

          // 只有当存在node的时候才执行
          if (node) {
            let origin = node.get('originAttrs');
            const model = node.get('model');

            if (!origin) {
              origin = {
                x: model.x,
                y: model.y,
              };
              node.set('originAttrs', origin);
            }

            if (onFrame) {
              const attrs = onFrame(node, ratio, origin, data);
              node.set('model', Object.assign(model, attrs));
            } else {
              model.x = origin.x + (child.x! - origin.x) * ratio;
              model.y = origin.y + (child.y! - origin.y) * ratio;
            }
          }
          return true;
        });

        each(self.get('removeList'), (node) => {
          const model = node.getModel();
          const from = node.get('originAttrs');
          const to = node.get('to');
          model.x = from.x + (to.x - from.x) * ratio;
          model.y = from.y + (to.y - from.y) * ratio;
        });

        self.refreshPositions();
      },
      {
        duration: animateCfg.duration,
        easing: animateCfg.ease,
        callback: () => {
          each(self.getNodes(), (node) => {
            node.set('originAttrs', null);
          });

          each(self.get('removeList'), (node) => {
            self.removeItem(node);
          });

          self.set('removeList', []);

          if (animateCfg.callback) {
            animateCfg.callback();
          }

          self.emit('afteranimate', { data });
        },
        delay: animateCfg.delay,
      },
    );
  }

  private innerUpdateChild(data: TreeGraphData, parent: Item | undefined, animate: boolean) {
    const self = this;
    const current = self.findById(data.id);

    // 若子树不存在，整体添加即可
    if (!current) {
      self.innerAddChild(data, parent, animate);
      return;
    }

    // // 更新新节点下所有子节点
    // each(data.children || [], (child: TreeGraphData) => {
    //   self.innerUpdateChild(child, current, animate);
    // });

    // // 用现在节点的children实例来删除移除的子节点
    // const children = current.get('children');
    // if (children) {
    //   const len = children.length;
    //   if (len > 0) {
    //     for (let i = children.length - 1; i >= 0; i--) {
    //       const child = children[i].getModel();

    //       if (TreeGraph.indexOfChild(data.children || [], child.id) === -1) {
    //         self.innerRemoveChild(
    //           child.id,
    //           {
    //             x: data.x!,
    //             y: data.y!,
    //           },
    //           animate,
    //         );

    //         // 更新父节点下缓存的子节点 item 实例列表
    //         children.splice(i, 1);
    //       }
    //     }
    //   }
    // }
    // let oriX: number;
    // let oriY: number;
    // if (current.get('originAttrs')) {
    //   oriX = current.get('originAttrs').x;
    //   oriY = current.get('originAttrs').y;
    // }
    // const model = current.getModel();
    // if (animate) {
    //   // 如果有动画，先缓存节点运动再更新节点
    //   current.set('originAttrs', {
    //     x: model.x,
    //     y: model.y,
    //   });
    // }
    // current.set('model', data.data);
    // if (oriX !== data.x || oriY !== data.y) {
    //   current.updatePosition({ x: data.x, y: data.y });
    // }
  }

  /**
   * 向🌲树中添加数据
   * @param treeData 树图数据
   * @param parent 父节点实例
   * @param animate 是否开启动画
   */
  private innerAddChild(treeData: TreeGraphData, parent: Item | undefined, animate: boolean): Item {
    const self = this;
    const model = treeData.data;

    if (model) {
      // model 中应存储真实的数据，特别是真实的 children
      model.x = treeData.x;
      model.y = treeData.y;
      model.depth = treeData.depth;
    }

    const node = self.addItem('node', model!, false);
    if (parent) {
      node.set('parent', parent);
      // if (animate) {
      //   const origin = parent.get('originAttrs');
      //   if (origin) {
      //     node.set('originAttrs', origin);
      //   } else {
      //     const parentModel = parent.getModel();
      //     node.set('originAttrs', {
      //       x: parentModel.x,
      //       y: parentModel.y,
      //     });
      //   }
      // }
      // 为父组件添加children 关联关系 画边
      const childrenList = parent.get('children');
      if (!childrenList) {
        parent.set('children', [node]);
      } else {
        childrenList.push(node);
      }
      self.addItem(
        'edge',
        {
          source: parent,
          target: node,
          id: `${parent.get('id')}:${node.get('id')}`,
        },
        false,
      );
    }
    // 渲染到视图上应参考布局的children, 避免多绘制了收起的节点
    UTIL.each(treeData.children || [], (child) => {
      self.innerAddChild(child, node, animate);
    });

    // elf.emit('afteraddchild', { item: node, parent });
    return node;
  }

  public findById(id: string): Item {
    return this.get('itemMap')[id];
  }

   /**
   * 新增元素
   * @param {ITEM_TYPE} type 元素类型(node | edge)
   * @param {ModelConfig} model 元素数据模型
   * @param {boolean} stack 本次操作是否入栈，默认为 true
   * @param {boolean} sortCombo 本次操作是否需要更新 combo 层级顺序，内部参数，用户在外部使用 addItem 时始终时需要更新
   * @return {Item} 元素实例
   */
  public addItem(
    type: ITEM_TYPE,
    model: ModelConfig,
    stack: boolean = true,
    sortCombo: boolean = true,
  ) {
    // const currentComboSorted = this.get('comboSorted');
    // this.set('comboSorted', currentComboSorted && !sortCombo);
    const itemController = this.get('itemController');

    // g1 g12
    if (model.id && this.findById(model.id as string)) {
      console.warn(
        `This item exists already. Be sure the id %c${model.id}%c is unique.`,
        'font-size: 20px; color: red;',
        '',
      );
      return;
    }

    let item;

    item = itemController.addItem(type, model);  // model = node->x、y... edge->source、target...

    this.paint();

    return item;
  }

}