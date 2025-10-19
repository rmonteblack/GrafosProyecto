const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");

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
  const positions = {};
  const radius = 200;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  nodeList.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / nodeList.length;
    positions[node] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });

  // Aristas
  edges.forEach(({ u, v, w, directed }) => {
    const a = positions[u];
    const b = positions[v];
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = "gray";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.closePath();
    // Peso
    const midX = (a.x + b.x) / 2;
    const midY = (a.y + b.y) / 2;
    ctx.fillText(w, midX, midY);
  });

  // Nodos
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
  pathEdges.forEach(({ u, v }) => {
    ctx.strokeStyle = "red";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(positions[u].x, positions[u].y);
    ctx.lineTo(positions[v].x, positions[v].y);
    ctx.stroke();
    ctx.closePath();
  });
}
