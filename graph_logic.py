# graph.py
import heapq
from typing import Dict, List, Tuple, Any

def build_adj(edges: List[Dict[str, Any]]) -> Dict[str, List[Tuple[str, float]]]:
    """
    Construye lista de adyacencia a partir de edges.
    Cada edge: {u, v, w, directed}
    Si directed == False, añade la arista en ambas direcciones.
    """
    adj = {}
    for e in edges:
        u = e.get("u") or e.get("from") or e.get("origin")
        v = e.get("v") or e.get("to") or e.get("dest")
        w = float(e.get("w", e.get("weight", 1)))
        directed = bool(e.get("directed", True))

        if u not in adj:
            adj[u] = []
        adj[u].append((v, w))

        if not directed:
            if v not in adj:
                adj[v] = []
            adj[v].append((u, w))
    return adj

def dijkstra(adj: Dict[str, List[Tuple[str, float]]], source: str, target: str):
    """
    Dijkstra clásico que devuelve (dist, path_list) o (None, []) si no hay camino.
    """
    if source not in adj:
        # source may exist as isolated node (no edges) -> add it
        adj.setdefault(source, [])
    if target not in adj:
        adj.setdefault(target, [])

    dist = {node: float('inf') for node in adj}
    prev = {node: None for node in adj}
    dist[source] = 0
    heap = [(0, source)]

    while heap:
        d, u = heapq.heappop(heap)
        if d > dist[u]:
            continue
        if u == target:
            break
        for v, w in adj.get(u, []):
            nd = d + w
            if nd < dist.get(v, float('inf')):
                dist[v] = nd
                prev[v] = u
                heapq.heappush(heap, (nd, v))

    if dist[target] == float('inf'):
        return None, []
    # reconstruir camino
    path = []
    cur = target
    while cur is not None:
        path.append(cur)
        cur = prev[cur]
    path.reverse()
    return dist[target], path

def shortest_path_from_payload(nodes_payload, edges_payload, source, target):
    """
    Entrada: nodes (ignored por el algoritmo, pero se pueden validar), edges, source, target.
    Devuelve JSON-friendly dict: {success, distance, path, path_edges}
    """
    # preparar edges con nombres u/v/w/directed
    edges = []
    for e in edges_payload:
        # aceptar varias claves posibles para compatibilidad front/back
        u = e.get("u") or e.get("from") or e.get("origin")
        v = e.get("v") or e.get("to") or e.get("dest")
        w = e.get("w") if "w" in e else e.get("weight", 1)
        directed = e.get("directed", True)
        try:
            w = float(w)
        except Exception:
            w = 1.0
        if u is None or v is None:
            continue
        edges.append({"u": u, "v": v, "w": w, "directed": bool(directed)})

    # construir lista adyacente
    adj = build_adj(edges)

    # si source/target no están en nodos ni en adj, devolver error útil
    if source is None or target is None or source == "" or target == "":
        return {"success": False, "error": "source o target vacíos", "distance": None, "path": []}

    # correr dijkstra
    dist, path = dijkstra(adj, source, target)
    if dist is None:
        return {"success": False, "error": "No hay camino entre source y target", "distance": None, "path": []}

    # crear lista de aristas del camino (u->v) para que frontend las resalte
    path_edges = []
    for i in range(len(path) - 1):
        path_edges.append({"u": path[i], "v": path[i+1]})

    return {"success": True, "distance": dist, "path": path, "path_edges": path_edges}
