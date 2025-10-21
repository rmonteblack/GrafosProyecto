const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");
let positions = {}; // posiciones de nodos globales

function drawGraph(edges) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "14px Arial";
  ctx.fillStyle = "black";

  const nodes = new Set();
  edges.forEach(e => {
    nodes.add(e.u);
    nodes.add(e.v);
  });

  const nodeList = Array.from(nodes);
  const radius = 200;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  positions = {};
  nodeList.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / nodeList.length;
    positions[node] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });

  edges.forEach(e => {
    const from = positions[e.u];
    const to = positions[e.v];
    if (!from || !to) return;
    drawArrow(from, to, e.directed, e.w);
  });

  // Dibujar nodos
  nodeList.forEach(node => {
    const { x, y } = positions[node];
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fillStyle = "lightblue";
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.stroke();
    ctx.fillStyle = "black";
    ctx.fillText(node, x - 5, y + 5);
    ctx.closePath();
  });
}

function highlightPath(pathEdges) {
  if (!pathEdges || pathEdges.length === 0) return;
  pathEdges.forEach(({ u, v }) => {
    const from = positions[u];
    const to = positions[v];
    if (!from || !to) return;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.closePath();
  });
}

function drawArrow(from, to, directed, weight) {
  const nodeRadius = 20; // radio del nodo
  // Calcular ángulo
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const angle = Math.atan2(dy, dx);

  // Ajustar "to" para que la línea termine antes del nodo destino
  const endX = to.x - nodeRadius * Math.cos(angle);
  const endY = to.y - nodeRadius * Math.sin(angle);

  // Línea principal
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(endX, endY);
  ctx.strokeStyle = "gray";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.closePath();

  // Dibujar flecha si es dirigida
  if (directed) {
    const headlen = 10; // tamaño de la punta
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - headlen * Math.cos(angle - Math.PI / 6),
               endY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(endX - headlen * Math.cos(angle + Math.PI / 6),
               endY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.lineTo(endX, endY);
    ctx.fillStyle = "gray";
    ctx.fill();
    ctx.closePath();
  }

  // Peso en medio de la línea
  const midX = (from.x + endX) / 2;
  const midY = (from.y + endY) / 2;
  ctx.fillStyle = "black";
  ctx.fillText(weight, midX, midY);
}

