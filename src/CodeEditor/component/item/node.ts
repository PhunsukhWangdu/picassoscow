import Item from './item';
import { INode } from '../../interface';

class Node extends Item implements INode{
  public getDefaultCfg() {
    return {
      type: 'node',
      edges: [],
    };
  }
}

export default Node;
