from flask import Flask, render_template, request, jsonify
from graph_logic import shortest_path_from_payload

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

    if u and v:
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

if __name__ == '__main__':
    app.run(debug=True)
