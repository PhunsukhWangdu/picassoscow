import {
  IGroup
} from '../../interface';
import BaseGroup from '../base/group';
import * as Shape from './shape';

class Group extends BaseGroup implements IGroup {

  getShapeBase() {
    return Shape;
  }

  getGroupBase() {
    return Group; // Group自己也可以addGroup 选择基于自身的Group类addgroup
  }

  isGroup() {
    return true;
  }

  isEntityGroup() {
    return false;
  }

  clone() {
    const cloneGroup = super.clone();
    // 获取构造函数
    const children = this.get('children');
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      cloneGroup.add(child.clone());
    }
    return cloneGroup;
  }
}

export default Group;