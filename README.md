# StateSpace Expo

Live: https://state-space-expo.vercel.app

A web app that visualizes AI search algorithms step by step. Built for the FT3 AI course project covering Units 1, 2, and 3.

---

## What it does

You pick a problem and an algorithm, hit Run, and watch the algorithm explore the state space in real time. Amber nodes are the frontier (being considered right now), blue nodes are visited (already explored), green is the final path.

There is also a live status bar, step counter, complexity info, and a side panel that highlights which step of the algorithm is currently executing.

---

## Problem Formulation and State Space

Every problem here is set up the same way — as a formal AI search problem:

- State: a snapshot of the world at one point in time
- Initial state: where the agent starts
- Goal state: what it is trying to reach
- Actions: what moves are possible from each state
- Transition model: what happens when an action is applied
- Path cost: how expensive each step is

This is exactly what problem formulation means in Unit 1. The visualization makes the state space visible — you can literally see the agent exploring states and the frontier expanding.

---

## Problems and Algorithms

**Unit 1 — Intro to AI**

| Problem | Algorithms |
|---|---|
| Maze Pathfinding | BFS, DFS, A*, Greedy, UCS |
| Missionaries and Cannibals | BFS, DFS |
| Traveling Salesman | Greedy Nearest Neighbor |
| Tic-Tac-Toe | Minimax, Alpha-Beta |

**Unit 2 — Search Algorithms**

| Problem | Algorithms |
|---|---|
| Graph Search | BFS, DFS, Dijkstra, A*, DLS |
| Search Tree Visualizer | BFS, DFS, Best-First |

**Unit 3 — Adversarial and CSP**

| Problem | Algorithms |
|---|---|
| N-Queens | Backtracking, Forward Checking |
| Map Coloring (Room Colouring) | Backtracking, Forward Checking |
| Minimax / Alpha-Beta | Minimax, Alpha-Beta |

---

## Algorithm Complexity

| Algorithm | Optimal | Complete | Time | Space |
|---|---|---|---|---|
| BFS | Yes | Yes | O(V+E) | O(V) |
| DFS | No | Yes | O(V+E) | O(V) |
| UCS | Yes | Yes | O(V+E) | O(V) |
| DLS | No | No | O(b^L) | O(bL) |
| A* | Yes | Yes | O(b^d) | O(b^d) |
| Greedy Best-First | No | No | O(b^m) | O(b^m) |
| Dijkstra | Yes | Yes | O((V+E)logV) | O(V) |
| IDA* | Yes | Yes | O(b^d) | O(d) |
| Minimax | Yes | Yes | O(b^m) | O(bm) |
| Alpha-Beta | Yes | Yes | O(b^m/2) | O(bm) |
| Backtracking | Yes | Yes | O(d^n) | O(n) |
| Forward Checking | Yes | Yes | O(d^n) | O(n^2) |

---

## Editable Inputs

Most problems let you change things before running:

- Maze: draw walls, move start/end, change grid size, generate a random maze
- Graph: generate random graphs with 8 or 12 nodes, click nodes to set source and destination
- Search Tree: change depth and branching factor, click any node to set it as the goal
- N-Queens: change board size from 6x6 to 12x12
- Map Coloring: add or remove rooms, drag rooms to reposition, add or remove edges, change number of colors
- TSP: drag cities or add new ones

---

## Tech

Plain HTML, CSS, and JavaScript. No libraries. Canvas API for rendering, Web Audio API for sound effects. Split into separate files — one per problem module.
