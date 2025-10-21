import heapq
from typing import Dict, List, Tuple, Any

def build_adj(edges: List[Dict[str, Any]]) -> Dict[str, List[Tuple[str, float]]]:
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
    if source not in adj:
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
    path = []
    cur = target
    while cur is not None:
        path.append(cur)
        cur = prev[cur]
    path.reverse()
    return dist[target], path

def shortest_path_from_payload(nodes_payload, edges_payload, source, target):
    edges = []
    for e in edges_payload:
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
    adj = build_adj(edges)
    if source is None or target is None or source == "" or target == "":
        return {"success": False, "error": "source o target vacíos", "distance": None, "path": []}
    dist, path = dijkstra(adj, source, target)
    if dist is None:
        return {"success": False, "error": "No hay camino entre source y target", "distance": None, "path": []}
    path_edges = [{"u": path[i], "v": path[i+1]} for i in range(len(path)-1)]
    return {"success": True, "distance": dist, "path": path, "path_edges": path_edges}
