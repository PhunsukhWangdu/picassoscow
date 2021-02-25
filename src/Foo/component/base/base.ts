import EE from '../../../../util/event-emitter';
import { IObject } from '../../interface';
import UTIL from '../../../../util';

abstract class Base extends EE {
  /**
   * 内部属性，用于 get,set，但是可以用于优化性能使用
   * @type {object}
   */
  cfg: IObject;

  /**
   * 是否被销毁
   * @type {boolean}
   */
  destroyed: boolean = false;

  /**
   * @protected
   * 默认的配置项
   * @returns {object} 默认的配置项
   */
  getDefaultCfg() {
    return {};
  }

  constructor(cfg?: IObject) {
    super();
    const defaultCfg = this.getDefaultCfg();
    this.cfg = UTIL.deepMix(defaultCfg, cfg);
  }

  public set(key: object | string, val?: any): Base {
    if (UTIL.isPlainObject(key)) {
      // @ts-ignore
      this.cfg = { ...this.cfg, ...key };
    } else {
      this.cfg[key] = val;
    }
    return this;
  }
  
  public get(key: string): any {
    return this.cfg[key];
  }

  // 实现接口的方法
  public destroy() {
    this.cfg = {
      destroyed: true,
    };
    this.off();
    this.destroyed = true;
  }
}

export default Base;
