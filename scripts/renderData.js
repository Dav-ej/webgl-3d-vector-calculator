// Define Viewport Scale and worldObjectSize //
var scale = 1;
var worldObjectSize = 50;

// Handle Zoom In Button //
function zoomIn() {
  if (scale > 0.2) {
    scale = scale-0.1;
    if (scale < 0.2) {
      scale = 0.2;
    }
    expressions.recalcVertices();
    renderer.drawScene();
  }
}
var counter1;
function startZoomIn() {
  zoomIn();
  counter1 = setInterval(function() {
    zoomIn()
  }, 100);
}
function endZoomIn() {
  clearInterval(counter1);
}
var zoomInBtn = document.getElementById("zoom-in");
zoomInBtn.addEventListener("mousedown", startZoomIn, false);
zoomInBtn.addEventListener("mouseup", endZoomIn, false);
zoomInBtn.addEventListener("mouseleave", endZoomIn, false);

// Handle Zoom Out Button
function zoomOut(){
  scale =  scale+0.1;
  expressions.recalcVertices();
  renderer.drawScene();
}
var counter2;
function startZoomOut() {
  zoomOut();
  counter2 = setInterval(function() {
    zoomOut();
  }, 100);
}
function endZoomOut() {
  clearInterval(counter2);
}
var zoomOutBtn = document.getElementById("zoom-out");
zoomOutBtn.addEventListener("mousedown", startZoomOut, false);
zoomOutBtn.addEventListener("mouseup", endZoomOut, false);
zoomOutBtn.addEventListener("mouseleave", endZoomOut, false);

// Initialise objects (letters, arrows, grid)
var o_x = new xLetter([], [0,0,0.75,1]);
var e_x = new expressionItem("1", true);
e_x.setObject(o_x);
expressions.addsetExpression(e_x);

var o_y = new yLetter([], [0,0.75,0,1]);
var e_y = new expressionItem("2", true);
e_y.setObject(o_y);
expressions.addsetExpression(e_y);

var o_z = new zLetter([], [0.75,0,0,1]);
var e_z = new expressionItem("3", true);
e_z.setObject(o_z);
expressions.addsetExpression(e_z);

var o_xArrow = new arrow(['x'], [0,0,0.75,1]);
var e_xArrow = new expressionItem("4", true);
e_xArrow.setObject(o_xArrow);
expressions.addsetExpression(e_xArrow);

var o_yArrow = new arrow(['y'], [0,0.75,0,1]);
var e_yArrow = new expressionItem("5", true);
e_yArrow.setObject(o_yArrow);
expressions.addsetExpression(e_yArrow);

var o_zArrow = new arrow(['z'], [0.75,0,0,1]);
var e_zArrow = new expressionItem("6", true);
e_zArrow.setObject(o_zArrow);
expressions.addsetExpression(e_zArrow);

var o_gridBig = new grid([1], [0.75,0.75,0.75,1]);
var e_gridBig = new expressionItem("7", true);
e_gridBig.setObject(o_gridBig);
expressions.addsetExpression(e_gridBig);

var o_gridSmall = new grid([10], [0.85,0.85,0.85,1]);
var e_gridSmall = new expressionItem("8", true);
e_gridSmall.setObject(o_gridSmall);
expressions.addsetExpression(e_gridSmall);

var o_gridBorder = new gridBorder([], [0.75,0.75,0.75,1]);
var e_gridBorder = new expressionItem("9", true);
e_gridBorder.setObject(o_gridBorder);
expressions.addsetExpression(e_gridBorder);

// Handle Canvas Rotating with Mouse //
var rotation1 = -22;
var rotation2 = 22;

var canvas = document.getElementById("#canvas");
var mouseDown = false;
var mousePos = [0, 0];

function setMouseDown(e) {
  mouseDown = true;
  mousePos = [e.x, e.y];
}
canvas.addEventListener("mousedown", setMouseDown, false);

function setMouseUp(e) {
  mouseDown = false;
}
canvas.addEventListener("mouseup", setMouseUp, false);
canvas.addEventListener("mouseleave", setMouseUp, false);

function move(e) {
  if (mouseDown) {
    var delta = [e.x - mousePos[0], e.y - mousePos[1]];
    var speed = 0.25;
    rotation1 -= delta[1]*speed;
    rotation2 -= delta[0]*speed;
    mousePos = [e.x, e.y];
    renderer.drawScene();
  }
}
canvas.addEventListener("mousemove", move, false);