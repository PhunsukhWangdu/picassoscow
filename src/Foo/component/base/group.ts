import {
  IGroup
} from '../../interface';
import Container from './container';

// group实际上也是一个container 也可以addGroup等
class Group extends Container implements IGroup {

  isGroup() {
    return true;
  }

  getGroupBase() {
    return Group;
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