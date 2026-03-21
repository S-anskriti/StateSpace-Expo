// data.js
// all the problem info, algo descriptions etc
// keeping it all in one place is easier - sanskriti

var problemList = {
  maze:         { label: 'Maze Pathfinding',   icon: '🧩', tag: 'State Space',  unit: 1 },
  missionaries: { label: 'Missionaries & C.',  icon: '🚣', tag: 'Real Problem', unit: 1 },
  tsp:          { label: 'Traveling Salesman', icon: '🗺️', tag: 'Optimization', unit: 1 },
  tictactoe:    { label: 'Tic-Tac-Toe',        icon: '❌', tag: 'Toy Problem',  unit: 1 },
  graphsearch:  { label: 'Graph Search',       icon: '🕸️', tag: 'Search Algos', unit: 2 },
  searchtree:   { label: 'Search Tree',        icon: '🌲', tag: 'Frontier Viz', unit: 2 },
  nqueens:      { label: 'N-Queens (CSP)',     icon: '♛',  tag: 'CSP',          unit: 3 },
  mapcolor:     { label: 'Map Coloring',       icon: '🗾', tag: 'CSP / Rooms',  unit: 3 },
  tictactoe3:   { label: 'Minimax / Alpha-Beta', icon: '🎮', tag: 'Adversarial', unit: 3 },
};

// which algos are available for each problem
var problemAlgos = {
  maze:         ['BFS', 'DFS', 'A*', 'Greedy', 'UCS'],
  missionaries: ['BFS', 'DFS'],
  tsp:          ['Nearest'],
  tictactoe:    ['Minimax', 'Alpha-Beta'],
  graphsearch:  ['BFS', 'DFS', 'Dijkstra', 'A*', 'DLS', 'IDA*'],
  searchtree:   ['BFS', 'DFS', 'Greedy'],
  nqueens:      ['Backtracking', 'Fwd Checking'],
  mapcolor:     ['Backtracking', 'Fwd Checking'],
  tictactoe3:   ['Minimax', 'Alpha-Beta'],
};

// descriptions shown in the problem section
var problemDesc = {
  maze:        'Grid cells = states. Walls block transitions. Find path from purple Start to red Goal. Draw walls by click/drag. Right-click to erase.',
  missionaries:'3 missionaries + 3 cannibals cross a river. Boat holds 1-2. Cannibals must never outnumber missionaries. State = (M_left, C_left, boat_side).',
  tsp:         'Visit all cities once, return home with minimum distance. NP-Hard. Drag cities to reposition. Click empty space to add (max 12).',
  tictactoe:   'Toy Problem. Click to play as X. AI plays O using Minimax or Alpha-Beta. Shows nodes evaluated and branches pruned.',
  graphsearch: 'Weighted graph. Click a node to set Source then Destination. Compare how BFS, Dijkstra, A* explore differently.',
  searchtree:  'Random branching tree. BFS fills level-by-level (wide amber frontier). DFS dives deep (thin frontier). Click node to set as Goal.',
  nqueens:     'Place N queens so none attack each other. Compare Backtracking vs Forward Checking with domain pruning. Adjust board size.',
  mapcolor:    'Color 7 rooms so no adjacent rooms share a color - straight from Unit 3 Room Colouring CSP.',
  tictactoe3:  'Full Minimax game tree for Tic-Tac-Toe. Alpha-Beta prunes branches vs plain Minimax.',
};

// info for each algorithm
var algoInfo = {
  'BFS': {
    name: 'Breadth-First Search', color: '#00d4ff',
    desc: 'Queue (FIFO). Explores level by level. Guarantees shortest path on unweighted graphs.',
    tc: 'O(V+E)', sc: 'O(V)', isOptimal: true, isComplete: true
  },
  'DFS': {
    name: 'Depth-First Search', color: '#ff9f43',
    desc: 'Stack (LIFO). Dives deep before backtracking. Memory-efficient but not always optimal.',
    tc: 'O(V+E)', sc: 'O(V)', isOptimal: false, isComplete: true
  },
  'A*': {
    name: 'A* Search', color: '#3effa0',
    desc: 'f(n) = g(n) + h(n). Path cost + Manhattan heuristic. Optimal when h is admissible.',
    tc: 'O(b^d)', sc: 'O(b^d)', isOptimal: true, isComplete: true
  },
  'Greedy': {
    name: 'Greedy Best-First', color: '#ffd166',
    desc: 'Only uses h(n). Rushes toward goal ignoring actual cost. Fast but not optimal.',
    tc: 'O(b^m)', sc: 'O(b^m)', isOptimal: false, isComplete: false
  },
  'UCS': {
    name: 'Uniform Cost Search', color: '#6c63ff',
    desc: 'Priority queue on g(n). Same as Dijkstra. Optimal for non-negative costs.',
    tc: 'O(V+E)', sc: 'O(V)', isOptimal: true, isComplete: true
  },
  'Dijkstra': {
    name: "Dijkstra's Algorithm", color: '#6c63ff',
    desc: 'Classic weighted shortest-path via min-heap. Relaxes edges iteratively.',
    tc: 'O((V+E)logV)', sc: 'O(V)', isOptimal: true, isComplete: true
  },
  'DLS': {
    name: 'Depth-Limited Search', color: '#ff6b9d',
    desc: 'DFS with a max depth limit L=4. Prevents infinite loops in deep graphs.',
    tc: 'O(b^L)', sc: 'O(bL)', isOptimal: false, isComplete: false
  },
  'IDA*': {
    name: 'Iterative Deepening A*', color: '#ffd166',
    desc: 'A* but uses DFS memory. Increases f-cost threshold each iteration. Space = O(d).',
    tc: 'O(b^d)', sc: 'O(d)', isOptimal: true, isComplete: true
  },
  'Minimax': {
    name: 'Minimax Algorithm', color: '#ff6b9d',
    desc: 'MAX picks highest score, MIN picks lowest. Evaluates full game tree. Perfect play.',
    tc: 'O(b^m)', sc: 'O(bm)', isOptimal: true, isComplete: true
  },
  'Alpha-Beta': {
    name: 'Alpha-Beta Pruning', color: '#ff4c6a',
    desc: 'Minimax + pruning. alpha = MAX guarantee, beta = MIN guarantee. Prunes when alpha >= beta.',
    tc: 'O(b^m/2)', sc: 'O(bm)', isOptimal: true, isComplete: true
  },
  'Backtracking': {
    name: 'Backtracking CSP', color: '#ff6b9d',
    desc: 'Assign values one by one. Check constraints. Backtrack on conflict. No look-ahead.',
    tc: 'O(d^n)', sc: 'O(n)', isOptimal: true, isComplete: true
  },
  'Fwd Checking': {
    name: 'Forward Checking', color: '#ffd166',
    desc: 'After each assignment, prune domains of unassigned variables. Early backtrack.',
    tc: 'O(d^n)', sc: 'O(n^2)', isOptimal: true, isComplete: true
  },
  'Nearest': {
    name: 'Greedy Nearest Neighbor', color: '#ffd166',
    desc: 'Always go to nearest unvisited city. Simple heuristic. Fast but not optimal.',
    tc: 'O(n^2)', sc: 'O(n)', isOptimal: false, isComplete: true
  },
};

// step by step explanations shown in panel
var algoStepsList = {
  'BFS': [
    'Add Start to Queue (FIFO)',
    'Dequeue front node, mark VISITED (blue)',
    'If node = Goal, trace path back',
    'Add unvisited neighbors to Queue (amber)',
    'Repeat - explores level by level',
  ],
  'DFS': [
    'Push Start onto Stack (LIFO)',
    'Pop top node, mark VISITED (blue)',
    'If node = Goal, trace path back',
    'Push unvisited neighbors onto Stack (amber)',
    'Repeat - dives deep before backtracking',
  ],
  'A*': [
    'Add Start to priority queue with f=0',
    'Pop node with lowest f = g + h',
    'If node = Goal, trace path back',
    'For each neighbor: g+1 and h = Manhattan dist',
    'If cheaper path, update and push (amber)',
    'Repeat - always expands most promising node',
  ],
  'Greedy': [
    'Add Start to priority queue',
    'Pop node with lowest h(n) = heuristic to goal',
    'If node = Goal, done',
    'Add unvisited neighbors by h(n) (amber)',
    'Ignores actual cost - may miss optimal path',
  ],
  'UCS': [
    'Add Start to priority queue with cost g=0',
    'Pop node with lowest total cost g(n)',
    'If node = Goal, optimal path found',
    'Add neighbors with updated g costs (amber)',
    'Guarantees cheapest path',
  ],
  'Dijkstra': [
    'Set dist[Start]=0, all others = infinity',
    'Pop node with min distance from priority queue',
    'If node = Goal, shortest path found',
    'Relax edges: if dist[u]+w < dist[v], update (amber)',
    'All edge weights are honored - optimal',
  ],
  'DLS': [
    'DFS with max depth limit L = 4',
    'Push Start onto Stack with depth = 0',
    'Pop node and visit (blue)',
    'Only expand neighbors if depth < L',
    'If depth=L and not goal, stop that branch',
  ],
  'IDA*': [
    'Set initial threshold = h(Start)',
    'Run DFS but only expand if f <= threshold',
    'If Goal found within threshold, done',
    'Else: set threshold = min f that exceeded it',
    'Repeat - uses only O(d) memory',
  ],
  'Minimax': [
    'MAX node picks move with highest score',
    'MIN node picks move with lowest score',
    'Recursively evaluate all game tree states',
    'Terminal states: win=+10, loss=-10, draw=0',
    'Backpropagate scores up the tree',
  ],
  'Alpha-Beta': [
    'Same as Minimax but track alpha and beta',
    'At MAX: if score >= beta, prune branch',
    'At MIN: if score <= alpha, prune branch',
    'Pruned branches cannot affect the result',
    'Reduces nodes from b^m to roughly b^(m/2)',
  ],
  'Backtracking': [
    'Assign a value to first variable',
    'Check constraints with already assigned vars',
    'If conflict, backtrack to previous variable',
    'Try next value in domain',
    'If all domains empty, no solution',
  ],
  'Fwd Checking': [
    'Assign value to current variable',
    'Remove that value from neighbors domains',
    'If any neighbor domain becomes empty, backtrack',
    'Otherwise continue to next variable',
    'Domain pruning avoids wasted search',
  ],
  'Nearest': [
    'Start at city A',
    'Find nearest unvisited city (amber)',
    'Travel to that city, add to tour (green)',
    'Repeat until all cities visited',
    'Return home to complete the tour',
  ],
};
