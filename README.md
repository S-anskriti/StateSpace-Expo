# StateSpace Expo

Live at: https://state-space-expo.vercel.app

An interactive visualizer for AI search algorithms built as part of an AI course project covering Units 1, 2, and 3. The goal is to make abstract search concepts visible — you can watch an algorithm explore a state space step by step, see the frontier grow and shrink, and understand why different algorithms make different decisions.

---
## Problem Formulation and State Space

Every problem in this app is modeled as a formal AI search problem with the following components:

- **State** — a snapshot of the world at a point in time (e.g. a grid cell position, a board configuration, a river-crossing arrangement)
- **Initial State** — where the agent starts
- **Goal State** — what the agent is trying to reach
- **Actions** — what moves are available from any given state
- **Transition Model** — the result of applying an action to a state
- **Path Cost** — the cost of reaching a state (uniform = 1 per step, or weighted)

This formulation is the foundation of all search algorithms. The app makes the state space visible by coloring nodes: amber for the frontier (states being considered), blue for visited (states already explored), and green for the solution path. Every problem in the app maps directly to this formal definition, which reflects the problem modelling approach taught in the course.

---

## Problems Covered

### Unit 1 — Introduction to AI

**Maze Pathfinding**
The grid is the state space. Each cell is a state. Walls remove transitions. The agent searches from a start cell to a goal cell. Demonstrates how the same physical problem can be solved with different strategies — BFS finds the shortest path, DFS finds any path fast, A* uses a heuristic to find the shortest path efficiently.

**Missionaries and Cannibals**
A real-world planning problem. The state is (missionaries on left, cannibals on left, boat side). The constraint is that cannibals must never outnumber missionaries on either bank. BFS finds the minimum number of crossings; DFS finds a valid solution via depth-first exploration of the state space.

**Traveling Salesman Problem**
An optimization problem where the agent must visit all cities exactly once and return home with minimum total distance. NP-Hard — demonstrates the limits of search. The Greedy Nearest Neighbor heuristic shows how approximate solutions are found in polynomial time when exact search is not feasible.

**Tic-Tac-Toe**
A toy problem used to introduce game tree search. The AI uses Minimax to evaluate every possible game state and pick the optimal move. Alpha-Beta Pruning is shown as an improvement — same result, fewer nodes evaluated.

### Unit 2 — Search Algorithms

**Graph Search**
A weighted graph with nine nodes. Demonstrates all major search strategies on the same input. BFS and DFS show uninformed search. Dijkstra and UCS show uniform-cost search. A* shows informed search with a Euclidean heuristic. DLS shows depth-limited search and IDA* shows how iterative deepening reduces memory usage while preserving optimality.

**Search Tree Visualizer**
A randomly generated branching tree. Shows how the frontier expands differently depending on the algorithm — BFS produces a wide, shallow frontier; DFS produces a narrow, deep one; Best-First collapses toward the goal. The depth and branching factor are configurable to demonstrate exponential growth in the state space.

### Unit 3 — Adversarial Search and CSP

**Minimax and Alpha-Beta**
Full game tree search for Tic-Tac-Toe. Shows MAX and MIN levels, terminal state evaluation, and score backpropagation. Alpha-Beta pruning is visualized by comparing nodes evaluated vs nodes pruned — demonstrating the reduction from O(b^m) to roughly O(b^(m/2)).

**N-Queens**
A Constraint Satisfaction Problem. Place N queens on an N x N board with no two queens attacking each other. Variables are rows, domains are column positions, and constraints are the no-attack rules. Backtracking explores assignments naively; Forward Checking prunes domains after each assignment and backtracks earlier when a domain becomes empty.

**Map Coloring (Room Colouring)**
Directly from Unit 3. Color a set of rooms so no two adjacent rooms share the same color. Modeled as a CSP where variables are rooms, domains are colors, and constraints are the adjacency relationships. The number of rooms, edges between them, and number of colors are all editable. Demonstrates how constraint propagation reduces the search space compared to pure backtracking.

---

## AI Logic and Techniques Demonstrated

The app reflects understanding of the following AI concepts from the course:

**Problem Formulation**
Each module translates a real or toy problem into a formal state space. The user can see the state (which cells are visited, which nodes are on the frontier) update in real time, making the abstract concept of a search space concrete.

**Uninformed Search**
BFS, DFS, UCS, and DLS operate without any knowledge of where the goal is. The app makes their blind exploration visible — BFS sweeps outward in rings, DFS dives into a single branch, and the contrast makes the trade-offs between time and memory obvious.

**Informed Search**
A* and Greedy Best-First use heuristics to guide the search. On the maze, the Manhattan distance heuristic is used. On the graph, Euclidean distance is used. The app shows how informed search visits far fewer nodes than BFS for the same result, directly demonstrating the value of a good heuristic.

**Adversarial Search**
Minimax models the game as a two-player zero-sum problem where one agent maximizes and the other minimizes. Alpha-Beta pruning shows that branches provably cannot affect the final decision can be skipped entirely, reducing the effective branching factor without changing the outcome.

**Constraint Satisfaction**
N-Queens and Map Coloring are formulated as CSPs rather than search problems. The difference between Backtracking (no look-ahead) and Forward Checking (domain pruning) is shown side by side. The pruned domains in Forward Checking make it clear why the algorithm backtracks far less.

---

## Color System

Every algorithm uses the same color language across all problems so the visualization is immediately readable:

| Color | Meaning |
|---|---|
| Amber | Frontier — states currently in the queue or stack |
| Blue | Visited — states already fully explored |
| Green | Path — the solution |
| Purple | Start node or initial state |
| Red | Goal node or target state |

---

## Algorithms and Complexity

| Algorithm | Type | Optimal | Complete | Time | Space |
|---|---|---|---|---|---|
| BFS | Uninformed | Yes | Yes | O(V+E) | O(V) |
| DFS | Uninformed | No | Yes | O(V+E) | O(V) |
| UCS | Uninformed | Yes | Yes | O(V+E) | O(V) |
| DLS | Uninformed | No | No | O(b^L) | O(bL) |
| IDA* | Informed | Yes | Yes | O(b^d) | O(d) |
| A* | Informed | Yes | Yes | O(b^d) | O(b^d) |
| Greedy Best-First | Informed | No | No | O(b^m) | O(b^m) |
| Dijkstra | Informed | Yes | Yes | O((V+E)logV) | O(V) |
| Minimax | Adversarial | Yes | Yes | O(b^m) | O(bm) |
| Alpha-Beta | Adversarial | Yes | Yes | O(b^(m/2)) | O(bm) |
| Backtracking | CSP | Yes | Yes | O(d^n) | O(n) |
| Forward Checking | CSP | Yes | Yes | O(d^n) | O(n^2) |

---

## Features

- Live status bar below the canvas narrates what the algorithm is doing at every step
- Right panel shows time/space complexity, optimal/complete badges, and a step-by-step explanation that highlights the current step as the animation runs
- Speed control from slow to instant
- Step counter tracks every frame
- Sound cues for frontier expansion, goal found, and failure — can be toggled off
- All inputs are editable: grid size, city count, board size, graph topology, room layout

---

## Tech Stack

- HTML5, CSS3, JavaScript with no external frameworks or libraries
- Canvas API for all rendering
- Web Audio API for sound
- Split across separate files, one per problem module

---

## File Structure

```
index.html        layout and HTML
style.css         all styling
utils.js          animation engine, sound, logging, status bar
data.js           algorithm descriptions and step explanations
app.js            sidebar, problem switching, info panel
maze.js           maze pathfinding
missionaries.js   missionaries and cannibals
tsp.js            traveling salesman
tictactoe.js      tic-tac-toe minimax
graphsearch.js    weighted graph search
searchtree.js     search tree visualizer
nqueens.js        n-queens CSP
mapcolor.js       map coloring CSP
vercel.json       deployment config
```

---

## Running Locally

No setup needed. Clone the repo and open index.html in a browser.

```
git clone https://github.com/S-anskriti/StateSpace-Expo.git
cd StateSpace-Expo
open index.html
```

---

## Course Context

Built for FT3 Application Development covering Units 1, 2, and 3 of the AI course.

- CO1: Problem formulation, state space representation, and AI logic — each module defines states, actions, transitions, and goal tests explicitly, directly reflecting the problem modelling approach from the syllabus
- CO2: Application of search techniques to solve problems — running any algorithm animates the actual search process on the actual problem
- CO3: Adversarial search, constraint satisfaction, and intelligent agent concepts — Minimax, Alpha-Beta, Backtracking, and Forward Checking are all implemented and visualized with live comparison of nodes visited vs pruned

---

Sanskriti — AI Course, FT3
