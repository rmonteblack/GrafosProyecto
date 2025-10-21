from flask import Flask, render_template, request, jsonify
import networkx as nx
import matplotlib.pyplot as plt
import io
import base64

app = Flask(__name__)

# Estructura global del grafo
G = nx.DiGraph()  # por defecto dirigido
directed = True

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/configurar', methods=['POST'])
def configurar():
    global G, directed
    data = request.json
    directed = data.get("directed", True)
    G = nx.DiGraph() if directed else nx.Graph()
    return jsonify({"message": "Configuración actualizada correctamente"})


@app.route('/agregar_nodo', methods=['POST'])
def agregar_nodo():
    data = request.json
    nodo = data.get("nodo")
    if nodo and nodo not in G:
        G.add_node(nodo)
        return jsonify({"message": f"Nodo '{nodo}' agregado", "nodos": list(G.nodes())})
    return jsonify({"error": "Nodo inválido o duplicado"}), 400


@app.route('/agregar_arista', methods=['POST'])
def agregar_arista():
    data = request.json
    origen = data.get("origen")
    destino = data.get("destino")
    peso = float(data.get("peso", 1))
    if origen in G.nodes() and destino in G.nodes() and origen != destino:
        G.add_edge(origen, destino, weight=peso)
        return jsonify({"message": "Arista agregada", "aristas": list(G.edges(data=True))})
    return jsonify({"error": "Error al agregar la arista"}), 400


@app.route('/grafo')
def grafo():
    img = io.BytesIO()
    plt.figure(figsize=(6, 4))
    pos = nx.spring_layout(G)
    nx.draw(
        G, pos,
        with_labels=True,
        node_color='skyblue',
        node_size=1000,
        font_size=10,
        font_weight='bold',
        arrows=directed,
        arrowsize=20,
    )
    edge_labels = nx.get_edge_attributes(G, 'weight')
    nx.draw_networkx_edge_labels(G, pos, edge_labels=edge_labels)

    plt.axis('off')
    plt.tight_layout()
    plt.savefig(img, format='png')
    plt.close()
    img.seek(0)
    img_b64 = base64.b64encode(img.getvalue()).decode()
    return jsonify({"image": f"data:image/png;base64,{img_b64}"})


if __name__ == '__main__':
    app.run(debug=True)
