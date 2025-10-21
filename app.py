from flask import Flask, render_template, request, jsonify
import networkx as nx
import matplotlib.pyplot as plt
import io
import base64

app = Flask(__name__)

# Variables globales
G = nx.DiGraph()  # Por defecto dirigido
is_directed = True


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/set_graph_type', methods=['POST'])
def set_graph_type():
    global G, is_directed
    data = request.get_json()
    graph_type = data.get('type', 'directed')

    is_directed = (graph_type == 'directed')
    G = nx.DiGraph() if is_directed else nx.Graph()

    return jsonify({'status': 'ok', 'directed': is_directed})


@app.route('/add_node', methods=['POST'])
def add_node():
    node_name = request.get_json().get('name', '').strip()
    if not node_name:
        return jsonify({'error': 'Nombre de nodo inválido'}), 400

    if node_name not in G.nodes:
        G.add_node(node_name)

    return jsonify({'status': 'ok', 'nodes': list(G.nodes)})


@app.route('/add_edge', methods=['POST'])
def add_edge():
    data = request.get_json()
    source = data.get('source')
    target = data.get('target')
    weight = float(data.get('weight', 1))

    if source not in G.nodes or target not in G.nodes:
        return jsonify({'error': 'Nodo no válido'}), 400
    if source == target:
        return jsonify({'error': 'Un nodo no puede apuntarse a sí mismo'}), 400

    G.add_edge(source, target, weight=weight)
    return jsonify({'status': 'ok', 'edges': list(G.edges(data=True))})


@app.route('/get_graph', methods=['GET'])
def get_graph():
    # Dibuja el grafo y devuelve la imagen en base64
    plt.figure(figsize=(6, 4))
    pos = nx.spring_layout(G)
    nx.draw(
        G, pos,
        with_labels=True,
        node_color='skyblue',
        node_size=1500,
        font_size=12,
        font_weight='bold',
        arrows=is_directed,
        connectionstyle="arc3,rad=0.1"
    )

    # Dibujar pesos
    edge_labels = nx.get_edge_attributes(G, 'weight')
    nx.draw_networkx_edge_labels(G, pos, edge_labels=edge_labels)

    buf = io.BytesIO()
    plt.tight_layout()
    plt.savefig(buf, format='png')
    plt.close()
    buf.seek(0)

    image_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
    return jsonify({'image': image_base64, 'nodes': list(G.nodes)})


if __name__ == '__main__':
    app.run(debug=True)
