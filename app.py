from flask import Flask, render_template, request, jsonify
from graph_logic import shortest_path_from_payload
import os

app = Flask(__name__)

nodes = []
edges = []
directed = True  

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/add_node', methods=['POST'])
def add_node():
    data = request.get_json()
    node = data.get('node')
    if node and node not in nodes:
        nodes.append(node)
    return jsonify({"nodes": nodes})

@app.route('/add_edge', methods=['POST'])
def add_edge():
    data = request.get_json()
    u = data.get('u')
    v = data.get('v')
    w = data.get('w', 1)
    directed_flag = data.get('directed', directed)

    if u and v and u != v:  # evita que un nodo se apunte a sí mismo
        edges.append({
            "u": u, "v": v, "w": w, "directed": directed_flag
        })
        if u not in nodes: nodes.append(u)
        if v not in nodes: nodes.append(v)
    return jsonify({"edges": edges})

@app.route('/toggle_directed', methods=['POST'])
def toggle_directed():
    global directed
    data = request.get_json()
    directed = bool(data.get('directed', True))
    return jsonify({"directed": directed})

@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.get_json()
    source = data.get('source')
    target = data.get('target')
    result = shortest_path_from_payload(nodes, edges, source, target)
    return jsonify(result)

@app.route('/clear', methods=['POST'])
def clear():
    global nodes, edges
    nodes = []
    edges = []
    return jsonify({"success": True, "nodes": nodes, "edges": edges})

@app.route("/feedback", methods=["POST"])
def feedback():
    data = request.get_json()
    name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    message = data.get("message", "").strip()

    if not name or not email or not message:
        return jsonify({"success": False, "error": "Por favor complete todos los campos."})

    # ruta relativa al archivo app.py
    base_dir = os.path.dirname(__file__)
    filepath = os.path.join(base_dir, "feedbacks.txt")

    try:
        with open(filepath, "a", encoding="utf-8") as f:
            f.write(f"Nombre: {name}\nCorreo: {email}\nMensaje: {message}\n{'-'*40}\n")
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

if __name__ == '__main__':
    app.run(debug=True)
