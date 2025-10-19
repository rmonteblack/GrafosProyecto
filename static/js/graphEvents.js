document.addEventListener("DOMContentLoaded", () => {
  const addNodeBtn = document.getElementById("addNodeBtn");
  const addEdgeBtn = document.getElementById("addEdgeBtn");
  const calcBtn = document.getElementById("calcBtn");
  const directedSwitch = document.getElementById("directedSwitch");
  const clearGraphBtn = document.getElementById("clearGraphBtn");
  const resultText = document.getElementById("resultText");
  const outputPre = document.getElementById("outputPre");

  let edges = [];
  let directed = directedSwitch.checked;

  // 🟢 Añadir nodo
  addNodeBtn.addEventListener("click", async () => {
    const node = document.getElementById("nodeInput").value.trim();
    if (!node) return;
    await fetch("/add_node", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ node }),
    });
    document.getElementById("nodeInput").value = "";
  });

  // 🟡 Añadir arista
  addEdgeBtn.addEventListener("click", async () => {
    const u = document.getElementById("uInput").value.trim();
    const v = document.getElementById("vInput").value.trim();
    const w = parseFloat(document.getElementById("wInput").value) || 1;
    directed = directedSwitch.checked;

    if (!u || !v) return;

    const res = await fetch("/add_edge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ u, v, w, directed }),
    });

    const data = await res.json();
    edges = data.edges;
    drawGraph(edges); // dibuja en el canvas
  });

  // 🔵 Cambiar tipo de grafo
  directedSwitch.addEventListener("change", async () => {
    directed = directedSwitch.checked;
    await fetch("/toggle_directed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ directed }),
    });
  });

  // 🟠 Calcular ruta más corta
  calcBtn.addEventListener("click", async () => {
    const source = document.getElementById("sourceInput").value.trim();
    const target = document.getElementById("targetInput").value.trim();

    const res = await fetch("/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source, target }),
    });

    const data = await res.json();

    if (data.success) {
      resultText.textContent = `Distancia: ${data.distance.toFixed(2)}`;
      outputPre.textContent = `Camino: ${data.path.join(" → ")}`;
      highlightPath(data.path_edges); // resalta visualmente
    } else {
      resultText.textContent = "❌ " + data.error;
      outputPre.textContent = "";
    }
  });

  // 🔴 Limpiar grafo
  clearGraphBtn.addEventListener("click", async () => {
    await fetch("/clear", { method: "POST" });
    edges = [];
    drawGraph([]);
    outputPre.textContent = "";
    resultText.textContent = "";
  });
});
