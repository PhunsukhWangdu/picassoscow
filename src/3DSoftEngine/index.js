import React from 'react';
import * as BABYLON from 'babylonjs';

// https://www.davrous.com/2013/06/13/tutorial-series-learning-how-to-write-a-3d-soft-engine-from-scratch-in-c-typescript-or-javascript/

class Camera {
  constructor() {
    this.Position = BABYLON.Vector3.Zero();
    this.Target = BABYLON.Vector3.Zero();
  }
}
class Mesh {
  constructor(name, verticesCount) {
    this.Vertices = new Array(verticesCount);
    this.Rotation = BABYLON.Vector3.Zero();
    this.Position = BABYLON.Vector3.Zero();
  }
}

class Device {
  constructor(canvas) {
    // Note: the back buffer size is equal to the number of pixels to draw
    // on screen (width*height) * 4 (R,G,B & Alpha values). 
    this.workingCanvas = canvas;
    this.workingWidth = canvas.width;
    this.workingHeight = canvas.height;
    this.workingContext = this.workingCanvas.getContext("2d");
  }

  // This function is called to clear the back buffer with a specific color
  clear() {
    // Clearing with black color by default
    // 在给定的矩形内清除指定的像素
    this.workingContext.clearRect(0, 0, this.workingWidth, this.workingHeight);
    // once cleared with black pixels, we're getting back the associated image data to 
    // clear out back buffer
    // getImageData 返回 ImageData 对象，该对象为画布上指定的矩形复制像素数据
    this.backbuffer = this.workingContext.getImageData(0, 0, this.workingWidth, this.workingHeight);
  };

  // Once everything is ready, we can flush the back buffer
  // into the front buffer. 
  present() {
    // putImageData 把图像数据（从指定的 ImageData 对象）放回画布上
    this.workingContext.putImageData(this.backbuffer, 0, 0);
  };

  // Called to put a pixel on screen at a specific X,Y coordinates
  putPixel(x, y, color) {
    this.backbufferdata = this.backbuffer.data;
    // As we have a 1-D Array for our back buffer
    // we need to know the equivalent cell index in 1-D based
    // on the 2D coordinates of the screen
    var index = ((x >> 0) + (y >> 0) * this.workingWidth) * 4;



    // RGBA color space is used by the HTML5 canvas
    this.backbufferdata[index] = color.r * 255;
    this.backbufferdata[index + 1] = color.g * 255;
    this.backbufferdata[index + 2] = color.b * 255;
    this.backbufferdata[index + 3] = color.a * 255;
  };

  // Project takes some 3D coordinates and transform them
  // in 2D coordinates using the transformation matrix
  project(coord, transMat) {
    var point = BABYLON.Vector3.TransformCoordinates(coord, transMat);
    // The transformed coordinates will be based on coordinate system
    // starting on the center of the screen. But drawing on screen normally starts
    // from top left. We then need to transform them again to have x:0, y:0 on top left.
    var x = point.x * this.workingWidth + this.workingWidth / 2.0 >> 0; // >>0 二进制右移 相当于取整
    var y = -point.y * this.workingHeight + this.workingHeight / 2.0 >> 0;
    return (new BABYLON.Vector2(x, y));
  };

  // drawPoint calls putPixel but does the clipping operation before
  drawPoint(point) {
    // Clipping what's visible on screen
    if (point.x >= 0 && point.y >= 0 && point.x < this.workingWidth
      && point.y < this.workingHeight) {
      // Drawing a yellow point
      this.putPixel(point.x, point.y, new BABYLON.Color4(1, 1, 0, 1));
    }
  };

  // The main method of the engine that re-compute each vertex projection
  // during each frame
  render(camera, meshes) {
    // To understand this part, please read the prerequisites resources
    // 观察矩阵 也就是摄像机
    // 在计算机图形学中，如果想换个角度观察一座山，您可以移动摄像机也可以……移动山
    // glm::mat4 CameraMatrix = glm::LookAt(
    //   cameraPosition, // the position of your camera, in world space
    //   cameraTarget,   // where you want to look at, in world space
    //   upVector        // probably glm::vec3(0,1,0), but (0,-1,0) would make you looking upside-down, which can be great too
    // );
    var viewMatrix = BABYLON.Matrix.LookAtLH(camera.Position, camera.Target, BABYLON.Vector3.Up());

    // 投影矩阵 perspective 确定物体距离摄像机的空间距离 xy固定时z大的会画在前面
    // Creates a left-handed perspective projection matrix
    // Generates a really hard-to-read matrix, but a normal, standard 4x4 matrix nonetheless
    // glm::mat4 projectionMatrix = glm::perspective(
    //   glm::radians(FoV), // The vertical Field of View, in radians: the amount of "zoom". Think "camera lens". Usually between 90&deg; (extra wide) and 30&deg; (quite zoomed in)
    //   4.0f / 3.0f,       // Aspect Ratio. Depends on the size of your window. Notice that 4/3 == 800/600 == 1280/960, sounds familiar ?
    //   0.1f,              // Near clipping plane. Keep as big as possible, or you'll get precision issues.
    //   100.0f             // Far clipping plane. Keep as little as possible.
    // );
    var projectionMatrix = BABYLON.Matrix.PerspectiveFovLH(0.78,
      this.workingWidth / this.workingHeight, 0.01, 1.0); //水平视角、宽高比、近水平视场、远水平视场

    for (var index = 0; index < meshes.length; index++) {
      // current mesh to work on
      var cMesh = meshes[index];
      // Beware to apply rotation before translation

      // 创建世界空间旋转矩阵 平移*旋转
      // 物体所有顶点都应该位于世界空间 物体需要从模型空间（Model Space）（顶点都相对于模型的中心定义）变换到世界空间（顶点都相对于世界空间中心定义）。
      var worldMatrix = BABYLON.Matrix.RotationYawPitchRoll(
        cMesh.Rotation.y, cMesh.Rotation.x, cMesh.Rotation.z)
        .multiply(BABYLON.Matrix.Translation(
          cMesh.Position.x, cMesh.Position.y, cMesh.Position.z)); // Multiply two matrices矩阵相乘

      //var transformMatrix => worldMatrix * viewMatrix * projectionMatrix;
      var transformMatrix = worldMatrix.multiply(viewMatrix).multiply(projectionMatrix);

      // 8个点的循环
      cMesh.Vertices.forEach(
        meshPoint => {
          // First, we project the 3D coordinates into the 2D space
          var projectedPoint = this.project(meshPoint, transformMatrix);
          // Then we can draw on screen
          this.drawPoint(projectedPoint);
        }
      )
    }
  };
};

export default class Pfive extends React.PureComponent {
  constructor(props) {
    super(props);
    this.containerRef = React.createRef();

    this.mesh = new Mesh("Cube", 8);
    this.mesh.Vertices[0] = new BABYLON.Vector3(-1, 1, 1); // setVertices
    this.mesh.Vertices[1] = new BABYLON.Vector3(1, 1, 1);
    this.mesh.Vertices[2] = new BABYLON.Vector3(-1, -1, 1);
    this.mesh.Vertices[3] = new BABYLON.Vector3(-1, -1, -1);
    this.mesh.Vertices[4] = new BABYLON.Vector3(-1, 1, -1);
    this.mesh.Vertices[5] = new BABYLON.Vector3(1, 1, -1);
    this.mesh.Vertices[6] = new BABYLON.Vector3(1, -1, 1);
    this.mesh.Vertices[7] = new BABYLON.Vector3(1, -1, -1);

    this.meshes = [this.mesh];

    this.camera = new Camera();
    this.camera.Position = new BABYLON.Vector3(0, 0, 10); // setPositon
    this.camera.Target = new BABYLON.Vector3(0, 0, 0);
  }

  componentDidMount() {
    // canvas = document.getElementById("frontBuffer");
    this.device = new Device(this.containerRef.current);
    // Calling the HTML5 rendering loop
    requestAnimationFrame(this.drawingLoop);
  }

  // Rendering loop handler
  drawingLoop = () => {
    this.device.clear();

    console.log(this.mesh.Rotation)

    // rotating slightly the cube during each frame rendered
    this.mesh.Rotation.x += 0.01;
    this.mesh.Rotation.y += 0.01;

    // Doing the various matrix operations
    this.device.render(this.camera, this.meshes);
    // Flushing the back buffer into the front buffer
    this.device.present();

    // Calling the HTML5 rendering loop recursively
    requestAnimationFrame(this.drawingLoop);
  }

  render() {
    return <canvas id="main" ref={this.containerRef} width="500" height="500" style={{ background: '#000000' }}></canvas>
  }
}