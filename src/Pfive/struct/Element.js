export default class PfiveElement {
  constructor(elt, pInst) {
    /**
     * Underlying HTML element. All normal HTML methods can be called on this.
     * @example
     * <div>
     * <code>
     * function setup() {
     *   let c = createCanvas(50, 50);
     *   c.elt.style.border = '5px solid red';
     * }
     *
     * function draw() {
     *   background(220);
     * }
     * </code>
     * </div>
     *
     * @property elt
     * @readOnly
     */
    this.elt = elt;
    this._pInst = this._pixelsState = pInst;
    this._events = {};
    this.width = this.elt.offsetWidth;
    this.height = this.elt.offsetHeight;
  };
}