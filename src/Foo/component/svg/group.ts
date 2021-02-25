import {
  IGroup
} from '../../interface';
import BaseGroup from '../base/group';

class Group extends BaseGroup implements IGroup {

  getGroupBase() {
    return Group; // Group自己也可以addGroup 选择基于自身的Group类addgroup
  }

  // container中也有实现
  addGroup(...args: any[]): IGroup {
    const [groupClass] = args;
    let group;
    const tmpCfg = groupClass || {};
    const TmpGroupClass = this.getGroupBase(); // avgcanvas自己实现group group.addGroup
    group = new TmpGroupClass(tmpCfg);

    this.add(group); //添加前将子元素原本上层dom链清理
    return group;
  }
}

export default Group;