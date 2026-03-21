// graphsearch.js
// weighted graph search - BFS DFS Dijkstra A* DLS IDA*
// sanskriti

var graphMod = (function() {

  var nodeList   = [];
  var edgeList   = [];
  var srcNode    = 0;
  var dstNode    = 5;
  var visitedSet = new Set();
  var frontierSet= new Set();
  var pathEdges  = new Set();
  var pathNodes  = new Set();
  var clickMode  = 0; // 0=set source, 1=set dest

  function resizeCanvas() {
    var area = document.getElementById('canvas-area');
    myCanvas.width  = area.clientWidth  - 28;
    myCanvas.height = area.clientHeight - 28;
  }

  function loadDefaultGraph() {
    var W = myCanvas.width, H = myCanvas.height;
    nodeList = [
      {x:.17*W, y:.42*H, label:'A'},
      {x:.35*W, y:.18*H, label:'B'},
      {x:.35*W, y:.68*H, label:'C'},
      {x:.56*W, y:.28*H, label:'D'},
      {x:.56*W, y:.68*H, label:'E'},
      {x:.80*W, y:.42*H, label:'F'},
      {x:.24*W, y:.76*H, label:'G'},
      {x:.50*W, y:.86*H, label:'H'},
      {x:.72*W, y:.78*H, label:'I'},
    ];
    edgeList = [
      {a:0,b:1,w:4},{a:0,b:2,w:3},{a:0,b:6,w:7},
      {a:1,b:3,w:5},{a:1,b:2,w:2},
      {a:2,b:4,w:6},{a:2,b:6,w:4},
      {a:3,b:5,w:3},{a:3,b:4,w:2},
      {a:4,b:5,w:5},{a:4,b:7,w:4},
      {a:5,b:8,w:2},{a:6,b:7,w:5},{a:7,b:8,w:3}
    ];
    srcNode = 0; dstNode = nodeList.length - 1;
    clearSets();
  }

  function makeRandomGraph(n) {
    var W = myCanvas.width, H = myCanvas.height;
    var pad  = 80;
    nodeList = [];
    var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var cols = Math.ceil(Math.sqrt(n * 1.6));
    var rows = Math.ceil(n / cols);
    var cw   = (W - pad*2) / cols;
    var ch   = (H - pad*2) / rows;
    var placed = 0;

    for (var r = 0; r < rows && placed < n; r++) {
      for (var c = 0; c < cols && placed < n; c++) {
        var x = pad + c*cw + cw/2 + (Math.random()-.5)*cw*.55;
        var y = pad + r*ch + ch/2 + (Math.random()-.5)*ch*.55;
        nodeList.push({
          x: Math.max(pad, Math.min(W-pad, x)),
          y: Math.max(pad, Math.min(H-pad, y)),
          label: letters[placed]
        });
        placed++;
      }
    }

    // build edges: spanning path first then extras
    edgeList = [];
    var added = new Set();
    var order = Array.from({length:n}, function(_,i){return i;}).sort(function(){return Math.random()-.5;});

    for (var i = 0; i < order.length - 1; i++) {
      var a = order[i], b = order[i+1];
      var key = Math.min(a,b) + '-' + Math.max(a,b);
      var w   = Math.round(Math.hypot(nodeList[a].x-nodeList[b].x, nodeList[a].y-nodeList[b].y) / 50) + 1;
      edgeList.push({a:a, b:b, w:w});
      added.add(key);
    }
    // add extra random short edges
    for (var attempt = 0; attempt < n*6; attempt++) {
      var a = Math.floor(Math.random() * n);
      var sorted = Array.from({length:n}, function(_,i){return i;})
        .filter(function(i) {
          return i !== a && !added.has(Math.min(a,i)+'-'+Math.max(a,i));
        })
        .sort(function(x, y) {
          return Math.hypot(nodeList[a].x-nodeList[x].x, nodeList[a].y-nodeList[x].y) -
                 Math.hypot(nodeList[a].x-nodeList[y].x, nodeList[a].y-nodeList[y].y);
        });
      if (!sorted.length) continue;
      var b   = sorted[0];
      var key = Math.min(a,b) + '-' + Math.max(a,b);
      var w   = Math.round(Math.hypot(nodeList[a].x-nodeList[b].x, nodeList[a].y-nodeList[b].y) / 50) + 1;
      edgeList.push({a:a, b:b, w:w});
      added.add(key);
      if (edgeList.length >= n*2) break;
    }

    srcNode = 0; dstNode = n - 1;
    clearSets();
  }

  function clearSets() {
    visitedSet  = new Set();
    frontierSet = new Set();
    pathEdges   = new Set();
    pathNodes   = new Set();
  }

  function edgePair(a, b) { return Math.min(a,b) + '-' + Math.max(a,b); }

  function drawGraph() {
    myCtx.fillStyle = '#06060f';
    myCtx.fillRect(0, 0, myCanvas.width, myCanvas.height);

    // edges
    edgeList.forEach(function(e) {
      var na   = nodeList[e.a], nb = nodeList[e.b];
      var key  = edgePair(e.a, e.b);
      var isPth= pathEdges.has(key);
      myCtx.strokeStyle = isPth ? '#10b981' : 'rgba(255,255,255,.08)';
      myCtx.lineWidth   = isPth ? 3 : 1.5;
      if (isPth) { myCtx.shadowColor = '#10b981'; myCtx.shadowBlur = 8; }
      myCtx.beginPath(); myCtx.moveTo(na.x, na.y); myCtx.lineTo(nb.x, nb.y); myCtx.stroke();
      myCtx.shadowBlur = 0;
      // weight label
      var mx = (na.x + nb.x)/2, my = (na.y + nb.y)/2;
      myCtx.fillStyle    = '#2e2e58';
      myCtx.font         = '9px JetBrains Mono';
      myCtx.textAlign    = 'center';
      myCtx.textBaseline = 'middle';
      myCtx.fillText(e.w, mx, my - 7);
    });

    // nodes
    nodeList.forEach(function(n, i) {
      var fill  = '#0c0c22', stroke = 'rgba(255,255,255,.1)', glow = 'transparent', r = 18;
      if      (i === srcNode)         { fill='#1a0a3a'; stroke='#8b5cf6'; glow='#8b5cf6'; }
      else if (i === dstNode)         { fill='#3a0a0a'; stroke='#ef4444'; glow='#ef4444'; }
      else if (pathNodes.has(i))      { fill='#052a18'; stroke='#10b981'; glow='#10b981'; }
      else if (visitedSet.has(i))     { fill='#071428'; stroke='#3b82f6'; glow='#3b82f6'; }
      else if (frontierSet.has(i))    { fill='#1a1200'; stroke='#f59e0b'; glow='#f59e0b'; r=20; }

      myCtx.shadowColor = glow; myCtx.shadowBlur = glow !== 'transparent' ? 12 : 0;
      myCtx.beginPath(); myCtx.arc(n.x, n.y, r, 0, Math.PI*2);
      myCtx.fillStyle = fill; myCtx.fill();
      myCtx.strokeStyle = stroke; myCtx.lineWidth = 2.5; myCtx.stroke();
      myCtx.shadowBlur = 0;

      myCtx.fillStyle    = '#dde0f5';
      myCtx.font         = 'bold 12px JetBrains Mono';
      myCtx.textAlign    = 'center';
      myCtx.textBaseline = 'middle';
      myCtx.fillText(n.label, n.x, n.y);
    });

    myCtx.textBaseline = 'alphabetic';
    myCtx.fillStyle = '#8b5cf6'; myCtx.font = '10px JetBrains Mono'; myCtx.textAlign = 'left';
    myCtx.fillText('Source: ' + nodeList[srcNode].label + ' | Click node to change', 12, myCanvas.height-22);
    myCtx.fillStyle = '#ef4444';
    myCtx.fillText('Dest: ' + nodeList[dstNode].label + ' | ' + (clickMode===0 ? 'next click = Source' : 'next click = Dest'), 12, myCanvas.height-8);
  }

  myCanvas.addEventListener('click', function(e) {
    if (currentProb !== 'graphsearch' || isRunning) return;
    var rect = myCanvas.getBoundingClientRect();
    var sx = myCanvas.width / rect.width, sy = myCanvas.height / rect.height;
    var mx = (e.clientX-rect.left)*sx, my = (e.clientY-rect.top)*sy;
    var ni = nodeList.findIndex(function(n) { return Math.hypot(n.x-mx, n.y-my) < 22; });
    if (ni < 0) return;
    if (clickMode === 0) {
      srcNode = ni; clickMode = 1;
      addLog('Source: ' + nodeList[ni].label + ' - now click Destination', 'hi');
    } else {
      dstNode = ni; clickMode = 0;
      addLog('Destination: ' + nodeList[ni].label + ' - click Run', 'hi');
    }
    clearSets();
    drawGraph();
    setColorKey(0, nodeList[srcNode].label);
    setColorKey(1, nodeList[dstNode].label);
  });

  function getAdjacentNodes(n) {
    var result = [];
    edgeList.forEach(function(e) {
      if (e.a === n) result.push({ n: e.b, w: e.w });
      if (e.b === n) result.push({ n: e.a, w: e.w });
    });
    return result;
  }

  function euclidDist(a, b) {
    return Math.hypot(nodeList[a].x - nodeList[b].x, nodeList[a].y - nodeList[b].y) * 0.1;
  }

  function traceParents(parents, endNode) {
    var path = [], cur = endNode;
    while (cur !== null) { path.unshift(cur); cur = parents[cur]; }
    return path;
  }

  function buildSearchSteps() {
    var algo  = document.getElementById('algo-sel').value;
    var steps = [];

    if (algo === 'BFS') {
      var q = [{n: srcNode, path: [srcNode]}];
      var v = new Set([srcNode]);
      while (q.length) {
        var item = q.shift(); var n = item.n, path = item.path;
        steps.push({type:'v', n:n});
        if (n === dstNode) { steps.push({type:'p', path:path, cost:path.length-1}); break; }
        getAdjacentNodes(n).forEach(function(nb) {
          if (!v.has(nb.n)) { v.add(nb.n); q.push({n:nb.n, path:path.concat([nb.n])}); steps.push({type:'f', n:nb.n}); }
        });
      }

    } else if (algo === 'DFS' || algo === 'DLS') {
      var limit = algo === 'DLS' ? 4 : 999;
      var stk   = [{n:srcNode, path:[srcNode], depth:0}];
      var v     = new Set();
      while (stk.length) {
        var item = stk.pop(); var n = item.n, path = item.path, d = item.depth;
        if (v.has(n)) continue;
        v.add(n);
        steps.push({type:'v', n:n});
        if (n === dstNode) { steps.push({type:'p', path:path, cost:path.length-1}); break; }
        if (d < limit) {
          getAdjacentNodes(n).forEach(function(nb) {
            if (!v.has(nb.n)) { stk.push({n:nb.n, path:path.concat([nb.n]), depth:d+1}); steps.push({type:'f', n:nb.n}); }
          });
        }
      }

    } else if (algo === 'Dijkstra') {
      var dist = {}, parents = {}, v = new Set(), pq = [{n:srcNode, d:0}];
      dist[srcNode] = 0; parents[srcNode] = null;
      while (pq.length) {
        pq.sort(function(a,b){return a.d-b.d;});
        var item = pq.shift(); var n = item.n, dn = item.d;
        if (v.has(n)) continue;
        v.add(n);
        steps.push({type:'v', n:n, cost:dn});
        if (n === dstNode) { steps.push({type:'p', path:traceParents(parents,dstNode), cost:dn}); break; }
        getAdjacentNodes(n).forEach(function(nb) {
          var nd = dn + nb.w;
          if (dist[nb.n] === undefined || nd < dist[nb.n]) {
            dist[nb.n] = nd; parents[nb.n] = n;
            pq.push({n:nb.n, d:nd});
            steps.push({type:'f', n:nb.n});
          }
        });
      }

    } else if (algo === 'A*') {
      var g = {}, parents = {}, v = new Set(), pq = [{n:srcNode, f:euclidDist(srcNode,dstNode), g:0}];
      g[srcNode] = 0; parents[srcNode] = null;
      while (pq.length) {
        pq.sort(function(a,b){return a.f-b.f;});
        var item = pq.shift(); var n = item.n, gn = item.g;
        if (v.has(n)) continue;
        v.add(n);
        steps.push({type:'v', n:n});
        if (n === dstNode) { steps.push({type:'p', path:traceParents(parents,dstNode), cost:gn}); break; }
        getAdjacentNodes(n).forEach(function(nb) {
          var ng = gn + nb.w;
          if (g[nb.n] === undefined || ng < g[nb.n]) {
            g[nb.n] = ng; parents[nb.n] = n;
            pq.push({n:nb.n, f:ng+euclidDist(nb.n,dstNode), g:ng});
            steps.push({type:'f', n:nb.n});
          }
        });
      }

    } else if (algo === 'IDA*') {
      var threshold = euclidDist(srcNode, dstNode);
      for (var iter = 0; iter < 20; iter++) {
        var minNext = Infinity, found = false;
        var vis2 = new Set([srcNode]);
        function searchIDA(n, gn, path) {
          var f = gn + euclidDist(n, dstNode);
          if (f > threshold) { minNext = Math.min(minNext, f); return; }
          steps.push({type:'v', n:n});
          if (n === dstNode) { steps.push({type:'p', path:path.concat([n]), cost:gn}); found=true; return; }
          getAdjacentNodes(n).forEach(function(nb) {
            if (!vis2.has(nb.n)) {
              vis2.add(nb.n);
              steps.push({type:'f', n:nb.n});
              searchIDA(nb.n, gn+nb.w, path.concat([n]));
              if (found) return;
              vis2.delete(nb.n);
            }
          });
        }
        searchIDA(srcNode, 0, []);
        if (found) break;
        if (minNext === Infinity) { steps.push({type:'x'}); break; }
        threshold = minNext;
      }
    }

    if (!steps.some(function(s){return s.type==='p'||s.type==='x';})) {
      steps.push({type:'x'});
    }
    return steps;
  }

  function buildExtraButtons() {
    document.getElementById('extra-tools').innerHTML =
      '<button class="btn" onclick="graphMod.makeRandom(8)">Random 8</button>' +
      '<button class="btn" onclick="graphMod.makeRandom(12)">Random 12</button>' +
      '<button class="btn" onclick="graphMod.loadDefault()">Default</button>';
  }

  return {
    makeRandom: function(n) {
      stopEverything();
      resizeCanvas();
      makeRandomGraph(n);
      drawGraph();
      clickMode = 0;
      addLog('Random graph with ' + n + ' nodes. Click a node to set Source.', 'hi');
      setColorKey(0, nodeList[srcNode].label);
      setColorKey(1, nodeList[dstNode].label);
    },
    loadDefault: function() {
      stopEverything();
      resizeCanvas();
      loadDefaultGraph();
      drawGraph();
      clickMode = 0;
      addLog('Default graph loaded.', 'hi');
      setColorKey(0, nodeList[srcNode].label);
      setColorKey(1, nodeList[dstNode].label);
    },
    init: function() {
      resizeCanvas();
      loadDefaultGraph();
      buildExtraButtons();
      drawGraph();
      clickMode = 0;
      addLog('Click a node = Source, click another = Destination, then Run', 'hi');
      setColorKey(0, nodeList[srcNode].label);
      setColorKey(1, nodeList[dstNode].label);
    },
    run: function() {
      var algo = document.getElementById('algo-sel').value;
      addLog('Running ' + algo + ': ' + nodeList[srcNode].label + ' to ' + nodeList[dstNode].label, 'hi');
      setPhase('running', algo + ' exploring graph...');
      highlightStep(0);
      clearSets();

      var steps = buildSearchSteps();
      var vc = 0;

      runAnimation(steps, function(step) {
        if (step.type === 'v') {
          vc++;
          visitedSet.add(step.n);
          frontierSet.delete(step.n);
          onVisitedNode();
          highlightStep(1);
          setPhase('visited', 'Visiting node ' + nodeList[step.n].label);
          playStepSound();
        } else if (step.type === 'f') {
          frontierSet.add(step.n);
          onFrontierNode();
          highlightStep(3);
          setPhase('frontier', 'Adding ' + nodeList[step.n].label + ' to frontier');
          playFrontierSound();
        } else if (step.type === 'p') {
          step.path.forEach(function(n, i) {
            if (i < step.path.length - 1) pathEdges.add(edgePair(n, step.path[i+1]));
            pathNodes.add(n);
          });
          var costRounded = Math.round(step.cost * 10) / 10;
          onPathFound('Cost ' + costRounded);
          highlightStep(2);
          setPhase('path', 'Path: ' + step.path.map(function(n){return nodeList[n].label;}).join('->') + ' | Cost: ' + costRounded);
          addLog('PATH: ' + step.path.map(function(n){return nodeList[n].label;}).join('->') + ' | cost: ' + costRounded, 'ok');
          playSuccessSound();
        } else if (step.type === 'x') {
          setPhase('error', 'No path found');
          addLog('No path found', 'err');
          playFailSound();
        }
        drawGraph();
      });
    },
    reset: function() { clearSets(); drawGraph(); },
    clear: function() { resizeCanvas(); loadDefaultGraph(); drawGraph(); },
  };

})();
