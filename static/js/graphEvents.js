import { nodesSet, edgesList, drawGraph, highlightPath } from "./graphVisualizer.js";

document.addEventListener("DOMContentLoaded", () => {
  const addNodeBtn = document.getElementById("addNodeBtn");
  const addEdgeBtn = document.getElementById("addEdgeBtn");
  const calcBtn = document.getElementById("calcBtn");
  const directedSwitch = document.getElementById("directedSwitch");
  const clearGraphBtn = document.getElementById("clearGraphBtn");
  const resultText = document.getElementById("resultText");
  const outputPre = document.getElementById("outputPre");
  const uSelect = document.getElementById("uSelect");
  const vSelect = document.getElementById("vSelect");

  let directed = directedSwitch.checked;

  function updateNodeSelects() {
    const nodes = Array.from(nodesSet);
    uSelect.innerHTML = `<option value="">Origen...</option>`;
    vSelect.innerHTML = `<option value="">Destino...</option>`;
    nodes.forEach(node => {
      uSelect.innerHTML += `<option value="${node}">${node}</option>`;
      vSelect.innerHTML += `<option value="${node}">${node}</option>`;
    });
  }

  uSelect.addEventListener("change", () => {
    const selected = uSelect.value;
    const nodes = Array.from(nodesSet);
    vSelect.innerHTML = `<option value="">Destino...</option>`;
    nodes.forEach(node => {
      if (node !== selected) {
        vSelect.innerHTML += `<option value="${node}">${node}</option>`;
      }
    });
  });

  // Añadir nodo
  addNodeBtn.addEventListener("click", async () => {
    const node = document.getElementById("nodeInput").value.trim();
    if (!node) return alert("Ingrese un nombre de nodo válido");
    const res = await fetch("/add_node", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ node }),
    });
    const data = await res.json();
    if (data.success) {
      nodesSet.add(node);
      document.getElementById("nodeInput").value = "";
      updateNodeSelects();
      drawGraph();
    } else {
      alert("Error al agregar nodo: " + data.error);
    }
  });

  // Añadir arista
  addEdgeBtn.addEventListener("click", async () => {
    const u = uSelect.value;
    const v = vSelect.value;
    const w = parseFloat(document.getElementById("wInput").value) || 1;
    directed = directedSwitch.checked;

    if (nodesSet.size === 0) {
      return alert("No hay nodos creados. Agrega nodos primero.");
    }
    if (!u || !v) {
      return alert("Seleccione origen y destino válidos.");
    }

    const res = await fetch("/add_edge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ u, v, w, directed }),
    });
    const data = await res.json();
    if (data.success) {
      edgesList.length = 0;
      edgesList.push(...data.edges);
      drawGraph(edgesList, Array.from(nodesSet));
    } else {
      alert(data.error);
    }
  });

  // Cambiar tipo de grafo
  directedSwitch.addEventListener("change", async () => {
    directed = directedSwitch.checked;
    await fetch("/toggle_directed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ directed }),
    });
    drawGraph(edgesList, Array.from(nodesSet));
  });

  // Calcular ruta más corta
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
      drawGraph(edgesList, Array.from(nodesSet));
      highlightPath(data.path_edges);
    } else {
      resultText.textContent = "❌ " + data.error;
      outputPre.textContent = "";
    }
  });

  // Limpiar
  clearGraphBtn.addEventListener("click", async () => {
    await fetch("/clear", { method: "POST" });
    nodesSet.clear();
    edgesList.length = 0;
    updateNodeSelects();
    drawGraph([]);
    outputPre.textContent = "";
    resultText.textContent = "";
  });

  drawGraph();
});
