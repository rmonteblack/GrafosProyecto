from flask import Flask, render_template, request, jsonify
import networkx as nx

app = Flask(__name__)

G = nx.DiGraph()
is_directed = True


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/add_node", methods=["POST"])
def add_node():
    data = request.get_json()
    node = data.get("node")
    if node:
        G.add_node(node)
        return jsonify({"success": True, "nodes": list(G.nodes)})
    return jsonify({"success": False, "error": "Nodo inválido"})


@app.route("/add_edge", methods=["POST"])
def add_edge():
    global G, is_directed
    data = request.get_json()
    u = data.get("u")
    v = data.get("v")
    w = data.get("w", 1)
    directed = data.get("directed", True)

    if directed != is_directed:
        G = nx.DiGraph() if directed else nx.Graph()
        is_directed = directed

    if not (u and v):
        return jsonify({"success": False, "error": "Origen o destino faltante."})

    G.add_edge(u, v, weight=float(w))
    if not directed:
        G.add_edge(v, u, weight=float(w))

    edges_data = [{"u": u, "v": v, "w": float(w), "directed": directed} for u, v, w in G.edges.data("weight")]
    return jsonify({"success": True, "edges": edges_data})


@app.route("/toggle_directed", methods=["POST"])
def toggle_directed():
    global G, is_directed
    data = request.get_json()
    directed = data.get("directed", True)
    if directed != is_directed:
        new_G = nx.DiGraph() if directed else nx.Graph()
        new_G.add_nodes_from(G.nodes(data=True))
        new_G.add_edges_from(G.edges(data=True))
        G = new_G
        is_directed = directed
    return jsonify({"success": True, "directed": is_directed})


@app.route("/calculate", methods=["POST"])
def calculate():
    data = request.get_json()
    source = data.get("source")
    target = data.get("target")

    if not (source and target):
        return jsonify({"success": False, "error": "Debe especificar origen y destino."})

    if source not in G.nodes or target not in G.nodes:
        return jsonify({"success": False, "error": "Nodos inválidos."})

    try:
        path = nx.shortest_path(G, source, target, weight="weight")
        distance = nx.shortest_path_length(G, source, target, weight="weight")
        path_edges = [{"u": path[i], "v": path[i+1]} for i in range(len(path)-1)]
        return jsonify({"success": True, "path": path, "distance": distance, "path_edges": path_edges})
    except nx.NetworkXNoPath:
        return jsonify({"success": False, "error": "No existe camino entre los nodos."})


@app.route("/clear", methods=["POST"])
def clear():
    global G
    G.clear()
    return jsonify({"success": True})


if __name__ == "__main__":
    app.run(debug=True)
