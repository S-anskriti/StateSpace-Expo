// maze.js
// maze pathfinding - BFS DFS A* Greedy UCS
// sanskriti

var mazeMod = (function() {

  // grid dimensions
  var numRows = 22;
  var numCols = 22;
  var cellSize = 0;

  // grid arrays
  var gridType  = []; // 0=empty 1=wall 2=start 3=end
  var gridState = []; // 0=unvisited 1=frontier 2=visited 3=path

  // start and end positions
  var startRow = 0, startCol = 0;
  var endRow   = 0, endCol   = 0;

  // cell type constants
  var EMPTY = 0, WALL = 1, START = 2, END = 3;
  var UNVIS = 0, FRONT = 1, VIS = 2, PATH = 3;

  // current draw tool
  var drawTool = 'wall';
  var mouseIsDown = false;

  function calcCellSize() {
    var area = document.getElementById('canvas-area');
    var maxW = area.clientWidth  - 28;
    var maxH = area.clientHeight - 28;
    cellSize = Math.max(8, Math.floor(Math.min(maxW / numCols, maxH / numRows)));
    myCanvas.width  = cellSize * numCols;
    myCanvas.height = cellSize * numRows;
  }

  function setupGrid() {
    gridType  = [];
    gridState = [];
    for (var r = 0; r < numRows; r++) {
      gridType.push(new Uint8Array(numCols));
      gridState.push(new Uint8Array(numCols));
    }
    // default start and end positions
    startRow = Math.floor(numRows / 2); startCol = 2;
    endRow   = Math.floor(numRows / 2); endCol   = numCols - 3;
    gridType[startRow][startCol] = START;
    gridType[endRow][endCol]     = END;
  }

  function drawOneCell(r, c) {
    var x = c * cellSize;
    var y = r * cellSize;
    var gt = gridType[r][c];
    var gs = gridState[r][c];

    // pick background color
    var bg = '#0b0b18';
    if      (gt === WALL)  bg = '#1c1c36';
    else if (gt === START) bg = '#1a0a3a';
    else if (gt === END)   bg = '#3a0a0a';
    else if (gs === PATH)  bg = '#052a18';
    else if (gs === VIS)   bg = '#071428';
    else if (gs === FRONT) bg = '#1a1200';

    myCtx.fillStyle = bg;
    myCtx.fillRect(x + 0.5, y + 0.5, cellSize - 1, cellSize - 1);

    // color overlay for frontier and visited
    if (gs === FRONT && gt !== START && gt !== END) {
      myCtx.fillStyle = 'rgba(245,158,11,0.7)';
      myCtx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
    }
    if (gs === VIS && gt !== START && gt !== END) {
      myCtx.fillStyle = 'rgba(59,130,246,0.55)';
      myCtx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
    }
    if (gs === PATH && gt !== START && gt !== END) {
      myCtx.fillStyle = 'rgba(16,185,129,0.85)';
      myCtx.fillRect(x + cellSize*0.08, y + cellSize*0.08, cellSize*0.84, cellSize*0.84);
    }

    // glowing start dot
    if (gt === START) {
      myCtx.shadowColor = '#8b5cf6';
      myCtx.shadowBlur  = cellSize * 0.6;
      myCtx.fillStyle   = '#8b5cf6';
      myCtx.beginPath();
      myCtx.arc(x + cellSize/2, y + cellSize/2, cellSize * 0.32, 0, Math.PI * 2);
      myCtx.fill();
      myCtx.shadowBlur = 0;
    }
    // glowing end dot
    if (gt === END) {
      myCtx.shadowColor = '#ef4444';
      myCtx.shadowBlur  = cellSize * 0.6;
      myCtx.fillStyle   = '#ef4444';
      myCtx.beginPath();
      myCtx.arc(x + cellSize/2, y + cellSize/2, cellSize * 0.32, 0, Math.PI * 2);
      myCtx.fill();
      myCtx.shadowBlur = 0;
    }
  }

  function drawEverything() {
    myCtx.fillStyle = '#06060f';
    myCtx.fillRect(0, 0, myCanvas.width, myCanvas.height);
    for (var r = 0; r < numRows; r++) {
      for (var c = 0; c < numCols; c++) {
        drawOneCell(r, c);
      }
    }
  }

  function clearVisualization() {
    for (var r = 0; r < numRows; r++) {
      for (var c = 0; c < numCols; c++) {
        if (gridState[r][c] !== UNVIS) {
          gridState[r][c] = UNVIS;
          drawOneCell(r, c);
        }
      }
    }
  }

  // get row/col from mouse event
  function getCellFromEvent(e) {
    var rect = myCanvas.getBoundingClientRect();
    var scaleX = myCanvas.width  / rect.width;
    var scaleY = myCanvas.height / rect.height;
    var col = Math.floor(((e.clientX - rect.left) * scaleX) / cellSize);
    var row = Math.floor(((e.clientY - rect.top)  * scaleY) / cellSize);
    if (row >= 0 && row < numRows && col >= 0 && col < numCols) {
      return { r: row, c: col };
    }
    return null;
  }

  function applyDrawTool(cell) {
    if (!cell) return;
    var r = cell.r, c = cell.c;
    var gt = gridType[r][c];

    if (drawTool === 'wall' && gt !== START && gt !== END) {
      gridType[r][c] = WALL;
      drawOneCell(r, c);
    } else if (drawTool === 'erase' && gt !== START && gt !== END) {
      gridType[r][c]  = EMPTY;
      gridState[r][c] = UNVIS;
      drawOneCell(r, c);
    } else if (drawTool === 'start' && gt !== END) {
      gridType[startRow][startCol] = EMPTY;
      drawOneCell(startRow, startCol);
      startRow = r; startCol = c;
      gridType[r][c] = START;
      drawOneCell(r, c);
    } else if (drawTool === 'end' && gt !== START) {
      gridType[endRow][endCol] = EMPTY;
      drawOneCell(endRow, endCol);
      endRow = r; endCol = c;
      gridType[r][c] = END;
      drawOneCell(r, c);
    }
  }

  // mouse event listeners
  myCanvas.addEventListener('mousedown', function(e) {
    if (currentProb !== 'maze' || isRunning) return;
    mouseIsDown = true;
    applyDrawTool(getCellFromEvent(e));
  });
  myCanvas.addEventListener('mousemove', function(e) {
    if (!mouseIsDown || currentProb !== 'maze' || isRunning) return;
    applyDrawTool(getCellFromEvent(e));
  });
  myCanvas.addEventListener('mouseup',    function() { mouseIsDown = false; });
  myCanvas.addEventListener('mouseleave', function() { mouseIsDown = false; });
  myCanvas.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    if (currentProb !== 'maze' || isRunning) return;
    var old = drawTool;
    drawTool = 'erase';
    applyDrawTool(getCellFromEvent(e));
    drawTool = old;
  });

  // get valid neighbors
  function getNeighbors(r, c) {
    var dirs = [[0,1],[1,0],[0,-1],[-1,0]];
    var result = [];
    dirs.forEach(function(d) {
      var nr = r + d[0], nc = c + d[1];
      if (nr >= 0 && nr < numRows && nc >= 0 && nc < numCols && gridType[nr][nc] !== WALL) {
        result.push({ r: nr, c: nc });
      }
    });
    return result;
  }

  function manhattanDist(r1, c1, r2, c2) {
    return Math.abs(r1 - r2) + Math.abs(c1 - c2);
  }

  // trace back path from end to start using parent map
  function buildPath(parentMap, er, ec) {
    var path = [];
    var key  = er + ',' + ec;
    while (key) {
      var parts = key.split(',');
      path.unshift({ r: parseInt(parts[0]), c: parseInt(parts[1]) });
      key = parentMap[key];
    }
    return path;
  }

  // build animation steps for chosen algo
  function buildAlgoSteps(algoName) {
    var startKey = startRow + ',' + startCol;
    var endKey   = endRow   + ',' + endCol;
    var steps    = [];
    var parents  = {};
    parents[startKey] = null;

    if (algoName === 'BFS' || algoName === 'UCS') {
      var queue   = [{ r: startRow, c: startCol, g: 0 }];
      var visited = new Set([startKey]);

      while (queue.length > 0) {
        if (algoName === 'UCS') queue.sort(function(a, b) { return a.g - b.g; });
        var cur = queue.shift();
        steps.push({ type: 'visit', r: cur.r, c: cur.c });

        if (cur.r === endRow && cur.c === endCol) {
          steps.push({ type: 'path', path: buildPath(parents, endRow, endCol) });
          return steps;
        }
        getNeighbors(cur.r, cur.c).forEach(function(nb) {
          var k = nb.r + ',' + nb.c;
          if (!visited.has(k)) {
            visited.add(k);
            parents[k] = cur.r + ',' + cur.c;
            queue.push({ r: nb.r, c: nb.c, g: cur.g + 1 });
            steps.push({ type: 'frontier', r: nb.r, c: nb.c });
          }
        });
      }

    } else if (algoName === 'DFS') {
      var stack   = [{ r: startRow, c: startCol }];
      var visited = new Set([startKey]);

      while (stack.length > 0) {
        var cur = stack.pop();
        var curKey = cur.r + ',' + cur.c;
        if (visited.has(curKey) && curKey !== startKey) continue;
        visited.add(curKey);
        steps.push({ type: 'visit', r: cur.r, c: cur.c });

        if (cur.r === endRow && cur.c === endCol) {
          steps.push({ type: 'path', path: buildPath(parents, endRow, endCol) });
          return steps;
        }
        getNeighbors(cur.r, cur.c).forEach(function(nb) {
          var k = nb.r + ',' + nb.c;
          if (!visited.has(k)) {
            parents[k] = cur.r + ',' + cur.c;
            stack.push(nb);
            steps.push({ type: 'frontier', r: nb.r, c: nb.c });
          }
        });
      }

    } else {
      // A* and Greedy
      var pq     = [];
      var gCosts = {};
      gCosts[startKey] = 0;
      var visited = new Set();

      pq.push({ r: startRow, c: startCol, f: 0, g: 0 });
      pq.sort(function(a, b) { return a.f - b.f; });

      while (pq.length > 0) {
        var cur = pq.shift();
        var curKey = cur.r + ',' + cur.c;
        if (visited.has(curKey)) continue;
        visited.add(curKey);
        steps.push({ type: 'visit', r: cur.r, c: cur.c });

        if (cur.r === endRow && cur.c === endCol) {
          steps.push({ type: 'path', path: buildPath(parents, endRow, endCol) });
          return steps;
        }

        getNeighbors(cur.r, cur.c).forEach(function(nb) {
          var nk  = nb.r + ',' + nb.c;
          var ng  = cur.g + 1;
          if (gCosts[nk] === undefined || ng < gCosts[nk]) {
            gCosts[nk]  = ng;
            parents[nk] = curKey;
            var h = manhattanDist(nb.r, nb.c, endRow, endCol);
            var fVal = algoName === 'A*' ? ng + h : h;
            pq.push({ r: nb.r, c: nb.c, f: fVal, g: ng });
            pq.sort(function(a, b) { return a.f - b.f; });
            steps.push({ type: 'frontier', r: nb.r, c: nb.c });
          }
        });
      }
    }

    steps.push({ type: 'fail' });
    return steps;
  }

  // generate maze using recursive backtracker (dfs)
  function makeMaze() {
    for (var r = 0; r < numRows; r++) {
      for (var c = 0; c < numCols; c++) {
        if (gridType[r][c] !== START && gridType[r][c] !== END) {
          gridType[r][c] = WALL;
        }
      }
    }

    var visited = new Set();
    var stack   = [{ r: 1, c: 1 }];
    gridType[1][1] = EMPTY;
    visited.add('1,1');

    while (stack.length > 0) {
      var cur = stack[stack.length - 1];
      var neighbors = [[-2,0],[2,0],[0,-2],[0,2]].map(function(d) {
        return { r: cur.r + d[0], c: cur.c + d[1] };
      }).filter(function(n) {
        return n.r > 0 && n.r < numRows-1 && n.c > 0 && n.c < numCols-1 && !visited.has(n.r+','+n.c);
      });

      if (neighbors.length === 0) {
        stack.pop();
        continue;
      }
      var next = neighbors[Math.floor(Math.random() * neighbors.length)];
      var wallR = (cur.r + next.r) / 2;
      var wallC = (cur.c + next.c) / 2;
      gridType[wallR][wallC] = EMPTY;
      gridType[next.r][next.c] = EMPTY;
      visited.add(next.r + ',' + next.c);
      stack.push(next);
    }

    // make sure start and end are open
    gridType[startRow][startCol] = START;
    gridType[endRow][endCol]     = END;
    [-1,0,1].forEach(function(dr) {
      [-1,0,1].forEach(function(dc) {
        var nr = startRow + dr, nc = startCol + dc;
        if (nr >= 0 && nr < numRows && nc >= 0 && nc < numCols) gridType[nr][nc] = EMPTY;
        var nr2 = endRow + dr, nc2 = endCol + dc;
        if (nr2 >= 0 && nr2 < numRows && nc2 >= 0 && nc2 < numCols) gridType[nr2][nc2] = EMPTY;
      });
    });
    gridType[startRow][startCol] = START;
    gridType[endRow][endCol]     = END;
    gridState = [];
    for (var r = 0; r < numRows; r++) gridState.push(new Uint8Array(numCols));
    drawEverything();
  }

  function buildExtraButtons() {
    document.getElementById('extra-tools').innerHTML =
      '<button class="btn" onclick="mazeMod.maze()">Maze</button>' +
      '<button class="btn" onclick="mazeMod.randomWalls()">Random</button>';
  }

  // public API
  return {

    setTool: function(t) { drawTool = t; },

    resizeGrid: function(n) {
      stopEverything();
      numRows = n; numCols = n;
      calcCellSize();
      setupGrid();
      drawEverything();
    },

    maze: function() {
      stopEverything();
      clearVisualization();
      makeMaze();
      addLog('Maze generated using recursive backtracker', 'hi');
    },

    randomWalls: function() {
      stopEverything();
      clearVisualization();
      for (var r = 0; r < numRows; r++) {
        for (var c = 0; c < numCols; c++) {
          if (gridType[r][c] !== START && gridType[r][c] !== END && Math.random() < 0.30) {
            gridType[r][c] = WALL;
          }
        }
      }
      drawEverything();
      addLog('Random walls placed', 'hi');
    },

    init: function() {
      calcCellSize();
      setupGrid();
      drawEverything();
      buildExtraButtons();
      addLog('Draw walls then click Run', 'hi');
      setColorKey(0, 'Set');
      setColorKey(1, 'Set');
    },

    run: function() {
      clearVisualization();
      var algo = document.getElementById('algo-sel').value;
      addLog('Running ' + algo + ' from (' + startRow + ',' + startCol + ') to (' + endRow + ',' + endCol + ')', 'hi');
      setPhase('running', algo + ' searching...');
      highlightStep(0);

      var steps = buildAlgoSteps(algo);
      var vc = 0, fc = 0;

      runAnimation(steps, function(step) {
        if (step.type === 'frontier') {
          if (gridType[step.r][step.c] !== START && gridType[step.r][step.c] !== END) {
            gridState[step.r][step.c] = FRONT;
            drawOneCell(step.r, step.c);
          }
          onFrontierNode();
          setPhase('frontier', 'Adding (' + step.r + ',' + step.c + ') to frontier');
          highlightStep(0);
          playFrontierSound();

        } else if (step.type === 'visit') {
          if (gridType[step.r][step.c] !== START && gridType[step.r][step.c] !== END) {
            gridState[step.r][step.c] = VIS;
            drawOneCell(step.r, step.c);
          }
          onVisitedNode();
          setPhase('visited', 'Visiting (' + step.r + ',' + step.c + ')');
          highlightStep(1);
          if (visitedCount % 15 === 0) playStepSound();

        } else if (step.type === 'path') {
          highlightStep(2);
          var pathCells = step.path;
          pathCells.forEach(function(p, i) {
            var t = setTimeout(function() {
              if (gridType[p.r][p.c] !== START && gridType[p.r][p.c] !== END) {
                gridState[p.r][p.c] = PATH;
                drawOneCell(p.r, p.c);
              }
              if (i === pathCells.length - 1) {
                onPathFound(pathCells.length + ' steps');
                setPhase('done', 'Path found! ' + pathCells.length + ' steps, visited ' + visitedCount);
                addLog('PATH FOUND - ' + pathCells.length + ' steps, visited ' + visitedCount + ' nodes', 'ok');
                playSuccessSound();
                myCanvas.style.borderColor = '#10b981';
                myCanvas.style.boxShadow   = '0 0 24px rgba(16,185,129,.4)';
                setTimeout(function() {
                  myCanvas.style.borderColor = '';
                  myCanvas.style.boxShadow   = '';
                }, 1800);
              }
            }, i * 16);
            allTimers.push(t);
          });

        } else if (step.type === 'fail') {
          onPathFound('No path');
          setPhase('error', 'No path - walls block all routes');
          addLog('No path found', 'err');
          playFailSound();
        }
      });
    },

    reset: function() { clearVisualization(); drawEverything(); },
    clear: function() { setupGrid(); drawEverything(); },
  };

})();
