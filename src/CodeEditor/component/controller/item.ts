import {
  Item,
  ITEM_TYPE,
  ModelConfig,
  IAbstractGraph,
  EdgeConfig,
  IElement,
  IGroup
} from '../../interface';
import Node from '../item/node';
import Edge from '../item/edge';
import UTIL from '../../../../util';

const NODE = 'node';
const EDGE = 'edge';
const STATE_SUFFIX = 'stateStyles';

const { upperFirst } = UTIL;

class ItemController {

  private graph: IAbstractGraph;

  public destroyed: boolean;

  constructor(graph: IAbstractGraph) {
    this.graph = graph;
    this.destroyed = false;
  }

  public addItem(type: ITEM_TYPE, model: ModelConfig) { // model = node->x、y... edge->source、target...
    const { graph } = this;

    const upperType = upperFirst(type); // Node

    const parentGroup: IGroup = graph.get(`${type}Group`) || graph.get('group'); // graph[nodeGroup] graph[edgeGroup]

    // 获取 this.get('styles') 中的值
    let styles = graph.get(`${type}${upperFirst(STATE_SUFFIX)}`) || {}; // nodeStateStyles edgeStateStyles
    if (model[STATE_SUFFIX]) {
      // 设置 this.get('styles') 中的值
      styles = model[STATE_SUFFIX];
    }

    const defaultModel = graph.get(`default${upperType}`); // defaultNode defaultEdge
    if (defaultModel) {
      UTIL.each(defaultModel, (val, key) => {
        // defaultNode defaultEdge属性覆盖data中配置
        model[key] = val;
      })
    }

    let item;

    if (type === EDGE) {
      // 画边
      let source: any = (model as EdgeConfig).source; // eslint-disable-line prefer-destructuring
      let target: any = (model as EdgeConfig).target; // eslint-disable-line prefer-destructuring

      if (source && UTIL.isString(source)) {
        source = graph.findById(source as string);
      }
      if (target && UTIL.isString(target)) {
        target = graph.findById(target as string);
      }

      if (!source || !target) {
        console.warn(`The source or target node of edge ${model.id} does not exist!`);
        return;
      }

      item = new Edge({
        model,
        source,
        target,
        styles,
        linkCenter: graph.get('linkCenter'),
        group: parentGroup.addGroup(), // graph[nodeGroup] graph[edgeGroup] [children]中添加新创建的element
      });

    } else if (type === NODE) {
      item = new Node({
        model,
        styles: {},
        group: parentGroup.addGroup(),
      })
    }

    graph.get(`${type}s`).push(item); // graph[nodes] graph[edges] 平铺存储

    graph.get('itemMap')[item.get('id')] = item;

    return item;
  }
}

export default ItemController;