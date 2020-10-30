const SESSION_TYPE = "immersive-vr";       // "immersive-vr" or "inline"
//const SESSION_TYPE = "inline";

// PIXIJS : New DRC
let app=null;
let graphicsR;

// WebXR variables

let xrSession = null;
let xrInputSources = null;
let xrReferenceSpace = null;
let xrButton = null;
let gl = null;
let animationFrameRequestID = 0;

// Not sure if needed:
// Renderer variables and constants

const viewerStartPosition = vec3.fromValues(0, 0, -10);
const viewerStartOrientation = vec3.fromValues(0, 0, 1.0);

const cubeMatrix=mat4.create();
const cubeOrientation=vec3.create();
const upVector=vec3.fromValues(0,1,0);

// Conversion constants

const RADIANS_PER_DEGREE = Math.PI / 180.0;

// Vectors used for creating "orthonormal up"; that is,
// the vector pointing straight out of the top of the
// object, even if it's rotated.

const vecX = vec3.create();
const vecY = vec3.create();

// Log a WebGL error message. The where parameter should be
// a string identifying the circumstance of the error.

function LogGLError(where) {
  let err = gl.getError();
  if (err) {
    console.error(`WebGL error returned by ${where}: ${err}`);
  }
}

window.addEventListener("load", onLoad);

function onLoad() {
  xrButton = document.querySelector("#enter-xr");
  xrButton.addEventListener("click", onXRButtonClick);

  setupXRButton();
}

function setupXRButton() {
  if (navigator.xr.isSessionSupported) {
    navigator.xr.isSessionSupported(SESSION_TYPE)
    .then((supported) => {
      xrButton.disabled = !supported;
    });
  } else {
    navigator.xr.supportsSession(SESSION_TYPE)
    .then(() => {
      xrButton.disabled = false;
    })
    .catch(() => {
      xrButton.disabled = true;
    });
  }
}

async function onXRButtonClick(event) {
  if (!xrSession) {
    navigator.xr.requestSession(SESSION_TYPE)
    .then(sessionStarted);
  } else {
    await xrSession.end();
    
    // If the end event didn't cause us to close things down,
    // do it explicitly here, now that the promise returned by
    // end() has been resolved.
    
    if (xrSession) {
      sessionEnded();
    }
  }
}

function sessionStarted(session) {
  let refSpaceType;
  
  xrSession = session;
  xrButton.innerText = "Exit WebXR";

  // Listen for the "end" event; when it arrives, we will
  // halt any animations and the like.
  
  xrSession.addEventListener("end", sessionEnded);
  
  // Set up the rendering context for use with the display we're
  // using. Here, we're using a context that's actually
  // visible in the document, in order to see what's going
  // on even without a headset. Normally you would use
  // document.createElement("canvas") to create an offscreen
  // canvas.
  
  let canvas = document.querySelector("canvas");
  gl = canvas.getContext("webgl", { xrCompatible: true });

  // Create the XRWebGLLayer to use as the base layer for the
  // session.

  xrSession.updateRenderState({
    baseLayer: new XRWebGLLayer(xrSession, gl)
  });
  
  // Get the reference space for querying poses.  
  
  if (SESSION_TYPE == "immersive-vr") {
    refSpaceType = "local";
  } else {
    refSpaceType = "viewer";
  }
  
  // Set up the initial matrix for the cube's position
  // and orientation.
  
  mat4.fromTranslation(cubeMatrix, viewerStartPosition);
  
  // Initialize the cube's current orientation relative to the
  // global space.
  
  vec3.copy(cubeOrientation, viewerStartOrientation);

  // Set vecY to point straight up copying the upVector
  // into it. vecY will always point outward from the top
  // of the object, regardless of changes made to yaw and
  // pitch by the user.
  
  vec3.copy(vecY, upVector);

  xrSession.requestReferenceSpace(refSpaceType)
  .then((refSpace) => {
    xrReferenceSpace = refSpace;
    xrReferenceSpace = xrReferenceSpace.getOffsetReferenceSpace(
          new XRRigidTransform(viewerStartPosition, cubeOrientation));
    animationFrameRequestID = xrSession.requestAnimationFrame(drawFrame);
  });
  
  // DRC's Samsung S8+
  const width=1598/2.0;
  const height=1514;

  app=new PIXI.Application({antialias: true, backgroundColor:0x000000, view: canvas });
  document.pixi=app;
  //document.body.appendChild(app.view);

  console.log(app.screen.width);
  console.log(app.screen.height);

  //const containerL=new PIXI.Container();
  //containerL.x=0;
  //containerL.y=0;
  //containerL.width=width/2;
  //containerL.height=height/2;
  //app.stage.addChild(containerL);

  //console.log(height, height/2.0, containerL.height);

  //const graphicsL=new PIXI.Graphics();
  //drawLeft(graphicsL,0,height);
  //app.stage.addChild(graphicsL);

  //const containerR=new PIXI.Container();
  //containerR.x=width/2;
  //containerR.y=0;
  //containerR.width=width/2;
  //containerR.height=height/2;

  graphicsR=new PIXI.Graphics();
  app.stage.addChild(graphicsR);

  drawRight(graphicsR,width,height);

  return xrSession;
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

function drawFrame(time, frame) {
  // Adjust for any mouse-based movement of the viewer
  
  let adjustedRefSpace = xrReferenceSpace;

  // Get the pose relative to the reference space
  
  let pose = frame.getViewerPose(adjustedRefSpace);

  // Let the session know to go ahead and plan to hit us up
  // again next frame
  
  animationFrameRequestID = frame.session.requestAnimationFrame(drawFrame);
    
  // Make sure we have a pose and start rendering
  
  if (pose) {
    let glLayer = frame.session.renderState.baseLayer;
    
    // Bind the WebGL layer's framebuffer to the renderer
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, glLayer.framebuffer);
    LogGLError("bindFrameBuffer");

    // Clear the GL context in preparation to render the
    // new frame
    
    gl.clearColor(0, 0, 0, 1.0);
    gl.clearDepth(1.0);                 // Clear everything
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    LogGLError("glClear");
        
    const deltaTime = (time - lastFrameTime) * 0.001;  // Convert to seconds
    lastFrameTime = time;

    // Render all of the frame's views to the output

//    for (let view of pose.views) {
      let view = pose.views[0]
      let viewport = glLayer.getViewport(view);
      gl.viewport(viewport.x, viewport.y, viewport.width*2.0, viewport.height);
      LogGLError(`Setting viewport for eye: ${view.eye}`);
      //console.log(viewport.x,viewport.y);
      gl.canvas.width = viewport.width * 1.0; //pose.views.length;
      gl.canvas.height = viewport.height;

      graphicsR.clear();
      drawRight(graphicsR,viewport.width,viewport.height);
      app.renderer.render(app.stage)

	if (false) {
      view = pose.views[1];
      viewport = glLayer.getViewport(view);
      gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
      console.log(viewport.x,viewport.y);
      LogGLError(`Setting viewport for eye: ${view.eye}`);
      gl.canvas.width = viewport.width; // * pose.views.length;
      gl.canvas.height = viewport.height;

      graphicsR.clear();
      drawRight(graphicsR,viewport.width,viewport.height);
      app.renderer.render(app.stage)
}
            
      // Draw the view; typically there's one view for each eye unless
      // we're in a monoscopic view, such as an inline session.
      
      //renderScene(gl, view, programInfo, buffers, texture, deltaTime);
            
      // Draw the view; typically there's one view for each eye unless
      // we're in a monoscopic view, such as an inline session.
      
      //renderScene(gl, view, programInfo, buffers, texture, deltaTime);

    //console.log(viewport.x,viewport.y,viewport.width,viewport.height);

  }
}

