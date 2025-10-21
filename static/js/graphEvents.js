document.addEventListener("DOMContentLoaded", () => {
  const addNodeBtn = document.getElementById("addNodeBtn");
  const addEdgeBtn = document.getElementById("addEdgeBtn");
  const calcBtn = document.getElementById("calcBtn");
  const directedSwitch = document.getElementById("directedSwitch");
  const clearGraphBtn = document.getElementById("clearGraphBtn");
  const downloadGraphBtn = document.getElementById("downloadGraphBtn");
  const uSelect = document.getElementById("uSelect");
  const vSelect = document.getElementById("vSelect");
  const sourceSelect = document.getElementById("sourceSelect");
  const targetSelect = document.getElementById("targetSelect");

  let nodes = [];
  let edges = [];
  let directed = directedSwitch.checked;

  function updateSelects(nodes) {
    [uSelect, vSelect, sourceSelect, targetSelect].forEach(select => {
      const current = select.value;
      select.innerHTML = '<option value="" disabled selected>' + select.dataset.placeholder + '</option>';
      nodes.forEach(n => {
        const opt = document.createElement("option");
        opt.value = n;
        opt.textContent = n;
        select.appendChild(opt);
      });
      if (nodes.includes(current)) select.value = current;
    });
  }

  function updateAutomataDetails(nodes, edges, source, target) {
    const Σ = edges.map(e => `${e.u}->${e.v}`).join(", ");
    const Q = nodes.join(", ");
    const q0 = source || "N/A";
    const F = target || "N/A";
    const δ = edges.map(e => `${e.u} --(${e.w})--> ${e.v}`).join("\n");

    const pre = document.getElementById("automataPre");
    pre.textContent = `
Alfabeto Σ: { ${Σ} }
Estados Q: { ${Q} }
Estado inicial q₀: ${q0}
Estados de aceptación F: { ${F} }
Transiciones δ:
${δ}
    `;
  }

  // 🟢 Añadir nodo
  addNodeBtn.addEventListener("click", async () => {
    const nodeInput = document.getElementById("nodeInput");
    let node = nodeInput.value.trim();
    if (!node) return;
    if (node.length > 25) node = node.slice(0, 25);

    const res = await fetch("/add_node", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ node })
    });
    const data = await res.json();
    nodes = data.nodes;
    updateSelects(nodes);
    updateAutomataDetails(nodes, edges, sourceSelect.value, targetSelect.value);
    nodeInput.value = "";
  });

  // 🟡 Añadir arista
  addEdgeBtn.addEventListener("click", async () => {
    const u = uSelect.value;
    const v = vSelect.value;
    const w = parseFloat(document.getElementById("wInput").value) || 1;
    directed = directedSwitch.checked;
    if (!u || !v) return;

    const res = await fetch("/add_edge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ u, v, w, directed })
    });
    const data = await res.json();
    edges = data.edges;
    drawGraph(edges);
    updateAutomataDetails(nodes, edges, sourceSelect.value, targetSelect.value);
  });

  // 🔵 Cambiar tipo de grafo
  directedSwitch.addEventListener("change", async () => {
    directed = directedSwitch.checked;
    await fetch("/toggle_directed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ directed })
    });
    updateAutomataDetails(nodes, edges, sourceSelect.value, targetSelect.value);
  });

  // 🟠 Calcular ruta más corta
  calcBtn.addEventListener("click", async () => {
    const source = sourceSelect.value;
    const target = targetSelect.value;
    const res = await fetch("/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source, target })
    });
    const data = await res.json();
    const resultText = document.getElementById("resultText");
    const outputPre = document.getElementById("outputPre");
    if (data.success) {
      resultText.textContent = `Distancia: ${data.distance.toFixed(2)}`;
      outputPre.textContent = `Camino: ${data.path.join(" → ")}`;
      highlightPath(data.path_edges);
    } else {
      resultText.textContent = "❌ " + data.error;
      outputPre.textContent = "";
    }
    updateAutomataDetails(nodes, edges, source, target);
  });

  // 🔴 Limpiar grafo
  clearGraphBtn.addEventListener("click", async () => {
    await fetch("/clear", { method: "POST" });
    nodes = [];
    edges = [];
    drawGraph([]);
    updateSelects([]);
    document.getElementById("resultText").textContent = "";
    document.getElementById("outputPre").textContent = "";
    updateAutomataDetails(nodes, edges, "", "");
  });

  downloadGraphBtn.addEventListener("click", () => {
    const canvas = document.getElementById("graphCanvas");
    const link = document.createElement("a");
    link.download = "grafo.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
});
