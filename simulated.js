const SESSION_TYPE = "immersive-vr";       // "immersive-vr" or "inline"
//const SESSION_TYPE = "inline";

// PIXIJS : New DRC
let app2=null;
let graphicsL2;
let graphicsR2;
let graphicsVline;
let containerL2;
let containerR2;

window.addEventListener("load", onLoad);

function onLoad() {
  //xrButton = document.querySelector("#enter-xr");
  //xrButton.addEventListener("click", onXRButtonClick);
  //setupXRButton();

  pixi_stereoSetup();
}

const phone_width=1598; // for simulation
const phone_height=1514/2.0;

function pixi_stereoSetup() {
  //let canvas = document.getElementById("canvas2");
  let canvas = document.querySelector("canvas");
  var gl = canvas.getContext("webgl", { xrCompatible: true });

  // DRC's Samsung S8+
  //const width=1598/2.0;
  //const height=1514;
  const width=document.body.scrollWidth;
  const height=document.body.scrollHeight;

  // Default width is 800x600. Make twice as wide
  app2=new PIXI.Application({antialias: true, backgroundColor:0x000000, view: canvas, width:phone_width, height:phone_height});
  document.pixi=app2;
  //document.body.app2endChild(app2.view);

  console.log(app2.screen.width);
  console.log(app2.screen.height);
  console.log(width);

  containerL2=new PIXI.Container();
      //containerL2.x=width;
      //containerL2.y=0;
      //containerL2.width=width;
      //containerL2.height=height;

  //console.log(containerL2.width);
  //console.log(containerL2.height);


  graphicsL2=new PIXI.Graphics();
  containerL2.addChild(graphicsL2);

  //console.log(height, height/2.0, containerL2.height);

  //drawLeft(graphicsL2,0,height);
  //app2.stage.addChild(graphicsL2);

  containerR2=new PIXI.Container();

  graphicsR2=new PIXI.Graphics();
  containerR2.addChild(graphicsR2);

  app2.stage.addChild(containerR2);
  app2.stage.addChild(containerL2);
  //drawRight(graphicsR2,width,height);

  // DEBUG
  document.containerL2=containerL2;
  document.containerR2=containerR2;
  document.graphicsL2=graphicsL2;
  document.graphicsR2=graphicsR2;

  graphicsVline=new PIXI.Graphics();

  app2.stage.addChild(graphicsVline);

  simulatedDraw();
}

function sessionEnded() {
  xrButton.innerText = "Enter WebXR";
  
  // If we have a pending animation request, cancel it; this
  // will stop processing the animation of the scene.
  
  if (animationFrameRequestID) {
    xrSession.cancelAnimationFrame(animationFrameRequestID);
    animationFrameRequestID = 0;
  }
  xrSession = null;
}

let lastFrameTime = 0;
function simulatedDraw(time, frame) {
  let canvas = document.querySelector("canvas");
  //let canvas = document.getElementById("canvas2");

      let middle_x=canvas.width/2.0;
      let height=canvas.height;

     const vpw=window.innerWidth/2.0;
     const vph=window.innerHeight/2.0;
     let nvw; let nvh;

      // https://medium.com/@michelfariarj/scale-a-pixi-js-game-to-fit-the-screen-1a32f8730e9c
      if (vph / vpw < phone_height / phone_width/2.0) {
        // If height-to-width ratio of the viewport is less than the height-to-width ratio
        // of the game, then the height will be equal to the height of the viewport, and
        // the width will be scaled.
        nvh = vph;
        nvw = (nvh * phone_width) / phone_height;
      } else {
        // In the else case, the opposite is happ2ening.
        nvw = vpw/2.0;
        nvh = (nvw * phone_height) / phone_width;
      }

      containerL2.x=0;
      containerR2.x=middle_x;

      graphicsL2.clear();
      drawLeft(graphicsL2,canvas.width/2.0,canvas.height);
      graphicsR2.clear();

      // Draw vertical line in middle
      graphicsVline.lineStyle(4, 0xffff00, 1);
      graphicsVline.moveTo(middle_x, 0);
      graphicsVline.lineTo(middle_x, height);

      drawRight(graphicsR2,canvas.width/2.0,canvas.height);
      app2.renderer.render(app2.stage);

      console.log(nvw,nvh,phone_width,phone_height);

      app2.renderer.resize(nvw, nvh);
      app2.stage.scale.set(nvw/phone_width,nvh/phone_height);
      //app2.stage.scale.set(0.5,0.5);
}

