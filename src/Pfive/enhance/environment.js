import Pfive from '../Pfive.js';

console.log(Pfive)

//注入上下文变量 可替换

Pfive.prototype._frameRate = 0;
Pfive.prototype._lastFrameTime = window.performance.now();
Pfive.prototype._targetFrameRate = 60;
