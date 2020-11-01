const SESSION_TYPE = "immersive-vr";       // "immersive-vr" or "inline"
//const SESSION_TYPE = "inline";

// PIXIJS : New DRC
let app=null;
let graphicsL;
let graphicsR;
let graphicsVline;
let containerL;
let containerR;

window.addEventListener("load", onLoad);

function onLoad() {
  //xrButton = document.querySelector("#enter-xr");
  //xrButton.addEventListener("click", onXRButtonClick);
  //setupXRButton();

  pixi_stereoSetup();

  console.log("Simulated Alive");
}

const phone_width=1598; // for simulation
const phone_height=1514;

function pixi_stereoSetup() {
  let canvas = document.querySelector("canvas");
  //gl = canvas.getContext("webgl", { xrCompatible: true });

  // DRC's Samsung S8+
  //const width=1598/2.0;
  //const height=1514;
  const width=document.body.scrollWidth;
  const height=document.body.scrollHeight;

  // Default width is 800x600. Make twice as wide
  app=new PIXI.Application({antialias: true, backgroundColor:0x000000, view: canvas, width:phone_width, height:phone_height});
  document.pixi=app;
  //document.body.appendChild(app.view);

  console.log(app.screen.width);
  console.log(app.screen.height);
  console.log(width);

  containerL=new PIXI.Container();
      //containerL.x=width;
      //containerL.y=0;
      //containerL.width=width;
      //containerL.height=height;

  //console.log(containerL.width);
  //console.log(containerL.height);


  graphicsL=new PIXI.Graphics();
  containerL.addChild(graphicsL);

  //console.log(height, height/2.0, containerL.height);

  //drawLeft(graphicsL,0,height);
  //app.stage.addChild(graphicsL);

  containerR=new PIXI.Container();

  graphicsR=new PIXI.Graphics();
  containerR.addChild(graphicsR);

  app.stage.addChild(containerR);
  app.stage.addChild(containerL);
  //drawRight(graphicsR,width,height);

  // DEBUG
  document.containerL=containerL;
  document.containerR=containerR;
  document.graphicsL=graphicsL;
  document.graphicsR=graphicsR;

  graphicsVline=new PIXI.Graphics();

  app.stage.addChild(graphicsVline);

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
        // In the else case, the opposite is happening.
        nvw = vpw/2.0;
        nvh = (nvw * phone_height) / phone_width;
      }

      containerL.x=0;
      containerR.x=middle_x;

      graphicsL.clear();
      drawLeft(graphicsL,canvas.width/2.0,canvas.height);
      graphicsR.clear();

      // Draw vertical line in middle
      graphicsVline.lineStyle(4, 0xffff00, 1);
      graphicsVline.moveTo(middle_x, 0);
      graphicsVline.lineTo(middle_x, height);

      drawRight(graphicsR,canvas.width/2.0,canvas.height);
      app.renderer.render(app.stage);

      console.log(nvw,nvh,phone_width,phone_height);

      app.renderer.resize(nvw, nvh);
      app.stage.scale.set(nvw/phone_width,nvh/phone_height);
      //app.stage.scale.set(0.5,0.5);
}

