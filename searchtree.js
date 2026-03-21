// searchtree.js
// search tree visualizer - BFS DFS Best-First
// click node to set goal, use toolbar to change depth/branching
// sanskriti

var treeMod = (function() {

  var treeNodes  = [];
  var treeEdges  = [];
  var goalNodeId = 0;
  var visitedSet = new Set();
  var frontierSet= new Set();
  var treeDepth  = 4;
  var treeBranch = 3;

  function resizeCanvas() {
    var area = document.getElementById('canvas-area');
    myCanvas.width  = area.clientWidth  - 28;
    myCanvas.height = area.clientHeight - 28;
  }

  function buildTree() {
    treeNodes = [];
    treeEdges = [];
    var W  = myCanvas.width;
    var H  = myCanvas.height;
    var id = 0;
    var levelH = Math.min(90, (H - 80) / treeDepth);

    function addNode(depth, parentId, x, y, spread) {
      var nid = id++;
      treeNodes.push({ id: nid, x: x, y: y, depth: depth, label: String(nid) });
      if (parentId !== null) treeEdges.push({ a: parentId, b: nid });

      if (depth < treeDepth) {
        var numChildren = (depth === 0) ? treeBranch : (Math.random() < 0.4 ? 2 : treeBranch - 1);
        var actualSpread = Math.max(spread * 0.7, 60);
        for (var i = 0; i < numChildren; i++) {
          var ox = (i - (numChildren - 1) / 2) * actualSpread;
          addNode(depth + 1, nid, x + ox, y + levelH, actualSpread / numChildren * 1.6);
        }
      }
    }

    addNode(0, null, W / 2, 55, W * 0.42);

    // pick a random goal node in deeper half
    var deepNodes = treeNodes.filter(function(n) {
      return n.depth >= Math.floor(treeDepth * 0.6);
    });
    var pick = deepNodes[Math.floor(Math.random() * deepNodes.length)];
    goalNodeId = pick ? pick.id : treeNodes[treeNodes.length - 1].id;
    treeNodes[goalNodeId].label = 'G';

    visitedSet  = new Set();
    frontierSet = new Set();
  }

  function getChildNodes(nodeId) {
    return treeEdges
      .filter(function(e) { return e.a === nodeId; })
      .map(function(e)    { return e.b; });
  }

  function drawTree() {
    myCtx.fillStyle = '#06060f';
    myCtx.fillRect(0, 0, myCanvas.width, myCanvas.height);

    // edges
    treeEdges.forEach(function(e) {
      var a = treeNodes[e.a], b = treeNodes[e.b];
      myCtx.strokeStyle = visitedSet.has(e.b) ? 'rgba(59,130,246,.3)' : 'rgba(255,255,255,.06)';
      myCtx.lineWidth   = visitedSet.has(e.b) ? 2 : 1;
      myCtx.beginPath();
      myCtx.moveTo(a.x, a.y);
      myCtx.lineTo(b.x, b.y);
      myCtx.stroke();
    });

    // nodes
    treeNodes.forEach(function(n) {
      var fill  = '#0c0c22', stroke = 'rgba(255,255,255,.1)', glow = 'transparent';
      if      (n.id === 0)              { fill='#1a0a3a'; stroke='#8b5cf6'; glow='#8b5cf6'; }
      else if (n.id === goalNodeId)     { fill='#3a0a0a'; stroke='#ef4444'; glow='#ef4444'; }
      else if (visitedSet.has(n.id))    { fill='#071428'; stroke='#3b82f6'; glow='#3b82f6'; }
      else if (frontierSet.has(n.id))   { fill='#1a1200'; stroke='#f59e0b'; glow='#f59e0b'; }

      myCtx.shadowColor = glow;
      myCtx.shadowBlur  = glow !== 'transparent' ? 10 : 0;
      myCtx.beginPath();
      myCtx.arc(n.x, n.y, 14, 0, Math.PI * 2);
      myCtx.fillStyle = fill; myCtx.fill();
      myCtx.strokeStyle = stroke; myCtx.lineWidth = 2; myCtx.stroke();
      myCtx.shadowBlur = 0;

      myCtx.fillStyle    = n.id === goalNodeId ? '#ef4444' : n.id === 0 ? '#8b5cf6' : '#dde0f5';
      myCtx.font         = 'bold 10px JetBrains Mono';
      myCtx.textAlign    = 'center';
      myCtx.textBaseline = 'middle';
      myCtx.fillText(n.label, n.x, n.y);
    });

    myCtx.textBaseline = 'alphabetic';
    myCtx.fillStyle    = '#2e2e58';
    myCtx.font         = '10px JetBrains Mono';
    myCtx.textAlign    = 'left';
    myCtx.fillText('Start | G = Goal | Frontier | Visited  (' + treeNodes.length + ' nodes)', 12, myCanvas.height - 8);
  }

  // click node to set as new goal
  myCanvas.addEventListener('click', function(e) {
    if (currentProb !== 'searchtree' || isRunning) return;
    var rect = myCanvas.getBoundingClientRect();
    var sx = myCanvas.width  / rect.width;
    var sy = myCanvas.height / rect.height;
    var mx = (e.clientX - rect.left) * sx;
    var my = (e.clientY - rect.top)  * sy;

    var hit = treeNodes.findIndex(function(n) {
      return Math.hypot(n.x - mx, n.y - my) < 18;
    });
    if (hit < 0 || hit === 0) return; // can't set root as goal

    // restore old goal label
    if (treeNodes[goalNodeId]) treeNodes[goalNodeId].label = String(goalNodeId);
    goalNodeId = hit;
    treeNodes[goalNodeId].label = 'G';

    visitedSet  = new Set();
    frontierSet = new Set();
    drawTree();
    addLog('Goal moved to node ' + goalNodeId + ' (depth ' + treeNodes[goalNodeId].depth + ')', 'hi');
    setColorKey(1, 'Node ' + goalNodeId);
  });

  function buildSearchSteps() {
    var algo  = document.getElementById('algo-sel').value;
    var steps = [];

    if (algo === 'BFS') {
      var q = [0], v = new Set([0]);
      while (q.length) {
        var n = q.shift();
        steps.push({ type:'v', n:n, depth:treeNodes[n].depth });
        if (n === goalNodeId) { steps.push({ type:'p', n:n }); break; }
        getChildNodes(n).forEach(function(c) {
          if (!v.has(c)) { v.add(c); q.push(c); steps.push({ type:'f', n:c }); }
        });
      }
    } else if (algo === 'DFS') {
      var stk = [0], v = new Set();
      while (stk.length) {
        var n = stk.pop();
        if (v.has(n)) continue;
        v.add(n);
        steps.push({ type:'v', n:n, depth:treeNodes[n].depth });
        if (n === goalNodeId) { steps.push({ type:'p', n:n }); break; }
        var kids = getChildNodes(n).slice().reverse();
        kids.forEach(function(c) {
          if (!v.has(c)) { stk.push(c); steps.push({ type:'f', n:c }); }
        });
      }
    } else {
      // Greedy/Best-First - use node id distance to goal as heuristic
      var pq = [{ n:0, h:Math.abs(0 - goalNodeId) }];
      var v  = new Set();
      while (pq.length) {
        pq.sort(function(a,b) { return a.h - b.h; });
        var item = pq.shift(); var n = item.n;
        if (v.has(n)) continue;
        v.add(n);
        steps.push({ type:'v', n:n, depth:treeNodes[n].depth });
        if (n === goalNodeId) { steps.push({ type:'p', n:n }); break; }
        getChildNodes(n).forEach(function(c) {
          if (!v.has(c)) {
            pq.push({ n:c, h:Math.abs(c - goalNodeId) });
            steps.push({ type:'f', n:c });
          }
        });
      }
    }

    if (!steps.some(function(s) { return s.type === 'p'; })) {
      steps.push({ type:'x' });
    }
    return steps;
  }

  function buildExtraButtons() {
    document.getElementById('extra-tools').innerHTML =
      '<button class="btn" onclick="treeMod.rebuild()">New Tree</button>' +
      '<select class="sel" onchange="treeMod.setDepth(parseInt(this.value))">' +
        '<option value="3">Depth 3</option>' +
        '<option value="4" selected>Depth 4</option>' +
        '<option value="5">Depth 5</option>' +
      '</select>' +
      '<select class="sel" onchange="treeMod.setBranch(parseInt(this.value))">' +
        '<option value="2">Branch 2</option>' +
        '<option value="3" selected>Branch 3</option>' +
        '<option value="4">Branch 4</option>' +
      '</select>';
  }

  return {

    setDepth: function(d) {
      treeDepth = d;
      buildTree();
      drawTree();
      addLog('Depth set to ' + d + '. Tree rebuilt.', 'hi');
    },

    setBranch: function(b) {
      treeBranch = b;
      buildTree();
      drawTree();
      addLog('Branching factor set to ' + b + '. Tree rebuilt.', 'hi');
    },

    rebuild: function() {
      buildTree();
      drawTree();
      visitedSet  = new Set();
      frontierSet = new Set();
      addLog('New random tree - ' + treeNodes.length + ' nodes, goal = G', 'hi');
      setColorKey(0, 'Root(0)');
      setColorKey(1, 'G');
    },

    init: function() {
      resizeCanvas();
      buildTree();
      buildExtraButtons();
      drawTree();
      addLog('Click any node to set it as Goal. Click New Tree to randomize.', 'hi');
      setColorKey(0, 'Root(0)');
      setColorKey(1, 'G');
    },

    run: function() {
      var algo = document.getElementById('algo-sel').value;
      visitedSet  = new Set();
      frontierSet = new Set();
      setPhase('running', algo + ' exploring tree...');
      highlightStep(0);
      addLog('Running ' + algo + ' on tree (goal = G)', 'hi');

      var steps = buildSearchSteps();
      var vc = 0;

      runAnimation(steps, function(step) {
        if (step.type === 'v') {
          vc++;
          visitedSet.add(step.n);
          frontierSet.delete(step.n);
          onVisitedNode();
          highlightStep(1);
          setPhase('visited', 'Visiting node ' + step.n + ' at depth ' + step.depth);
          playStepSound();
        } else if (step.type === 'f') {
          frontierSet.add(step.n);
          onFrontierNode();
          highlightStep(3);
          setPhase('frontier', 'Adding node ' + step.n + ' to frontier');
          playFrontierSound();
        } else if (step.type === 'p') {
          onPathFound('Depth ' + treeNodes[step.n].depth);
          highlightStep(2);
          setPhase('path', 'Goal G found after visiting ' + vc + ' nodes!');
          addLog('Goal found! Visited ' + vc + ' nodes', 'ok');
          playSuccessSound();
        } else if (step.type === 'x') {
          setPhase('error', 'Goal not reachable');
          addLog('Goal not found in this tree', 'err');
          playFailSound();
        }
        drawTree();
      });
    },

    reset: function() { visitedSet = new Set(); frontierSet = new Set(); drawTree(); },
    clear: function() { buildTree(); drawTree(); addLog('Tree rebuilt', 'hi'); },
  };

})();
