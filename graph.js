let canvas;
let context;
let R;
let graphScale;
let points = [];
let basePixelsUnit = 30;

export function initializeGraph(canvasElement, initialRadius, onPoint) {
  canvas = canvasElement;
  context = canvas.getContext("2d");
  R = initialRadius;
  if (R === null) {
    graphScale = 120;
  } else {
    graphScale = R * basePixelsUnit;
  }

  canvas.addEventListener("wheel", function(event) {
    event.preventDefault();
    if (event.deltaY < 0) {
      graphScale = graphScale + 10;
    } else {
      graphScale = graphScale - 10;
    }

    graphScale = Math.max(basePixelsUnit, Math.min(basePixelsUnit * 5, graphScale));

    redrawCanvas(points);
  }, { passive: false });

  canvas.addEventListener("click", function(event) {
    let canvasRect = canvas.getBoundingClientRect();

    let canvasX = (event.clientX - canvasRect.left) * (canvas.width / canvasRect.width);
    let canvasY = (event.clientY - canvasRect.top) * (canvas.height / canvasRect.height);
    let pointResult = {r: R, canvasX: canvasX, canvasY: canvasY, scale: graphScale};
    onPoint(pointResult);
  });

  drawGraph();
}

export function setRadius(radius) {
  R = radius;
  graphScale = R * basePixelsUnit;
  redrawCanvas(points);
}

function drawGraph() {
  let centerX = canvas.width / 2;
  let centerY = canvas.height / 2;
  let scale = graphScale;

  context.fillStyle = "lightpink";
  context.fillRect(centerX, centerY - scale, scale / 2, scale);
  context.beginPath();
  context.moveTo(centerX, centerY);
  context.arc(
    centerX,
    centerY,
    scale / 2,
    Math.PI,
    3 * Math.PI / 2
  );
  context.closePath();
  context.fill();
  context.beginPath();
  context.moveTo(centerX, centerY);
  context.lineTo(centerX + scale, centerY);
  context.lineTo(centerX, centerY + scale);
  context.closePath();
  context.fill();
  context.beginPath();

  context.moveTo(20, centerY);
  context.lineTo(canvas.width - 20, centerY);

  context.moveTo(centerX, canvas.height - 20);
  context.lineTo(centerX, 20);

  context.moveTo(canvas.width - 30, centerY - 5);
  context.lineTo(canvas.width - 20, centerY);
  context.lineTo(canvas.width - 30, centerY + 5);

  context.moveTo(centerX - 5, 30);
  context.lineTo(centerX, 20);
  context.lineTo(centerX + 5, 30);
  context.strokeStyle = "black";
  context.lineWidth = 2;
  context.stroke();

  context.fillStyle = "black";
  context.font = "16px sans-serif";

  context.fillText("X", canvas.width - 18, centerY - 10);
  context.fillText("Y", centerX + 10, 18);

  let marks = [scale, scale / 2, -scale / 2, -scale];

  context.beginPath();

  marks.forEach(function(offset) {
    context.moveTo(centerX + offset, centerY - 5);
    context.lineTo(centerX + offset, centerY + 5);

    context.moveTo(centerX - 5, centerY + offset);
    context.lineTo(centerX + 5, centerY + offset);
  });

  context.stroke();
  context.fillText("-R", centerX - scale - 10, centerY - 10);
  context.fillText("-R/2", centerX - scale / 2 - 18, centerY - 10);
  context.fillText("R/2", centerX + scale / 2 - 12, centerY - 10);
  context.fillText("R", centerX + scale - 5, centerY - 10);

  context.fillText("R", centerX + 10, centerY - scale + 5);
  context.fillText("R/2", centerX + 10, centerY - scale / 2 + 5);
  context.fillText("-R/2", centerX + 10, centerY + scale / 2 + 5);
  context.fillText("-R", centerX + 10, centerY + scale + 5);
}

function checkCanvasHit(pointX, pointY) {
  let centerX = canvas.width / 2;
  let centerY = canvas.height / 2;

  let x = pointX - centerX;
  let y = centerY - pointY;
  let scale = graphScale;

  let inCircle = x <= 0 && y >= 0 && x ** 2 + y ** 2 <= (scale / 2) ** 2;
  let inRectangle = x >= 0 && x <= scale / 2 && y >= 0 && y <= scale;
  let inTriangle = x >= 0 && x <= scale && y <= 0 && y >= x - scale;
  return inCircle || inRectangle || inTriangle;
}

function drawPoint(pointResult) {
  let centerX = canvas.width / 2;
  let centerY = canvas.height / 2;
  let pointX;
  let pointY;

  if (pointResult.movesWithGraph === false) {
    pointX = pointResult.canvasX;
    pointY = pointResult.canvasY;
  } else if (pointResult.source === "graph") {
    pointX = centerX + pointResult.relativeX * graphScale;
    pointY = centerY - pointResult.relativeY * graphScale;
  } else {
    pointX = centerX + (pointResult.x / pointResult.r) * graphScale;
    pointY = centerY - (pointResult.y / pointResult.r) * graphScale;
  }

  let pointHit = checkCanvasHit(pointX, pointY);

  context.beginPath();
  context.arc(pointX, pointY, 4, 0, Math.PI * 2);

  if (pointHit) {
    context.fillStyle = "green";
  } else {
    context.fillStyle = "red";
  }

  context.fill();
}

export function redrawCanvas(results) {
  points = results;
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawGraph();

  results.forEach(function(pointResult) {
    drawPoint(pointResult);
  });
}
