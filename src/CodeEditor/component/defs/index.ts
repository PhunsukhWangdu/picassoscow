import { createSVGElement } from "util/dom";
import uniqueId from "util/unique-id";

class Defs {
  id: string;
  defaultArrow: {};
  children: any[];
  el: SVGDefsElement;
  canvas: SVGSVGElement;


  constructor(canvas: SVGSVGElement) {
    const el = createSVGElement('defs') as SVGDefsElement;
    const id = uniqueId('defs_');
    el.id = id;
    this.id = id;
    canvas.appendChild(el);
    this.el = el;
    this.canvas = canvas;
    this.children = [];
    this.defaultArrow = {};
  }
}

export default Defs;