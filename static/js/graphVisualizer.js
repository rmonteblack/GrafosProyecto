const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");

let nodesSet = new Set();
let edgesList = [];
let positions = {};

function drawGraph(edges = edgesList, nodes = Array.from(nodesSet)) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "14px Arial";
  ctx.fillStyle = "black";

  const radius = 200;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  positions = {};

  // Distribuir nodos en círculo
  nodes.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / nodes.length;
    positions[node] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });

  // Dibujar aristas
  edges.forEach(({ u, v, w, directed }) => {
    const a = positions[u];
    const b = positions[v];
    if (!a || !b) return;

    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = "gray";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Peso
    const midX = (a.x + b.x) / 2;
    const midY = (a.y + b.y) / 2;
    ctx.fillStyle = "black";
    ctx.fillText(w, midX, midY);

    // Flecha si es dirigido
    if (directed) {
      const angle = Math.atan2(b.y - a.y, b.x - a.x);
      const arrowLength = 10;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(
        b.x - arrowLength * Math.cos(angle - Math.PI / 6),
        b.y - arrowLength * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        b.x - arrowLength * Math.cos(angle + Math.PI / 6),
        b.y - arrowLength * Math.sin(angle + Math.PI / 6)
      );
      ctx.fillStyle = "gray";
      ctx.fill();
    }
  });

  // Dibujar nodos
  nodes.forEach(node => {
    const { x, y } = positions[node];
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fillStyle = "#cce5ff";
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.stroke();
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(node, x, y);
    ctx.closePath();
  });
}

function highlightPath(pathEdges) {
  if (!pathEdges || !positions) return;
  pathEdges.forEach(({ u, v }) => {
    const a = positions[u];
    const b = positions[v];
    if (!a || !b) return;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.closePath();
  });
}

export { nodesSet, edgesList, drawGraph, highlightPath };
