document.addEventListener("DOMContentLoaded", () => {
  const graphType = document.getElementById("graphType");
  const nodeName = document.getElementById("nodeName");
  const addNodeBtn = document.getElementById("addNodeBtn");
  const addEdgeBtn = document.getElementById("addEdgeBtn");
  const sourceNode = document.getElementById("sourceNode");
  const targetNode = document.getElementById("targetNode");
  const edgeWeight = document.getElementById("edgeWeight");
  const graphImage = document.getElementById("graphImage");

  function showAlert(msg) {
    alert(msg);
  }

  // 🔁 Actualiza selects y gráfico
  async function updateGraph() {
    try {
      const res = await fetch("/get_graph");
      const data = await res.json();

      console.log("Nodos recibidos de /get_graph:", data.nodes); // 👈 log para debug
      updateSelectOptions(data.nodes);

      if (data.image) {
        graphImage.src = "data:image/png;base64," + data.image;
      } else {
        graphImage.src = "";
      }
    } catch (err) {
      console.error("Error al actualizar el grafo:", err);
    }
  }

  // 🔁 Refresca selects
  function updateSelectOptions(nodes) {
    sourceNode.innerHTML = "<option value=''>Seleccione origen</option>";
    targetNode.innerHTML = "<option value=''>Seleccione destino</option>";

    nodes.forEach((n) => {
      const opt1 = document.createElement("option");
      opt1.value = n;
      opt1.textContent = n;
      sourceNode.appendChild(opt1);

      const opt2 = document.createElement("option");
      opt2.value = n;
      opt2.textContent = n;
      targetNode.appendChild(opt2);
    });
  }

  // ➕ Añadir nodo
  async function addNode() {
    const name = nodeName.value.trim();
    if (!name) return showAlert("Debe ingresar un nombre de nodo.");

    try {
      const res = await fetch("/add_node", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();
      console.log("Respuesta de /add_node:", data); // 👈 log para debug

      if (data.error) return showAlert(data.error);

      nodeName.value = "";
      await updateGraph(); // actualizar selects e imagen después de agregar
    } catch (err) {
      console.error("Error al agregar nodo:", err);
    }
  }

  // 🔗 Añadir arista
  async function addEdge() {
    const source = sourceNode.value;
    const target = targetNode.value;
    const weight = edgeWeight.value || 1;

    if (!source || !target) return showAlert("Seleccione origen y destino.");
    if (source === target) return showAlert("Un nodo no puede apuntarse a sí mismo.");

    try {
      const res = await fetch("/add_edge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, target, weight }),
      });

      const data = await res.json();
      console.log("Respuesta de /add_edge:", data); // 👈 log para debug

      if (data.error) return showAlert(data.error);

      edgeWeight.value = "";
      await updateGraph(); // actualizar selects e imagen
    } catch (err) {
      console.error("Error al agregar arista:", err);
    }
  }

  // Cambiar tipo de grafo
  async function changeGraphType() {
    const type = graphType.value;
    try {
      await fetch("/set_graph_type", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      await updateGraph();
    } catch (err) {
      console.error("Error al cambiar tipo de grafo:", err);
    }
  }

  graphType.addEventListener("change", changeGraphType);
  addNodeBtn.addEventListener("click", addNode);
  addEdgeBtn.addEventListener("click", addEdge);

  // Cargar inicial
  updateGraph();
});
