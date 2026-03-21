// mapcolor.js
// map coloring CSP - room colouring from unit 3
// now with editable room count, draggable layout, add/remove edges
// sanskriti

var mapMod = (function() {

  var colorOptions = ['#ef4444', '#3b82f6', '#f59e0b', '#10b981', '#c084fc', '#fb923c'];
  var colorNames   = ['Red', 'Blue', 'Amber', 'Green', 'Purple', 'Orange'];

  var snapshots  = [];
  var explored   = 0;
  var backtracks = 0;

  // nodes = rooms with x,y positions
  var nodes = [];
  // edges = pairs [i, j] meaning rooms i and j are adjacent
  var edges = [];

  // interaction state
  var draggingNode  = -1;
  var addingEdge    = false;
  var edgeStartNode = -1;
  var numColors     = 4;
  var lastMouseX    = 0;
  var lastMouseY    = 0;

  function resizeCanvas() {
    var area = document.getElementById('canvas-area');
    myCanvas.width  = area.clientWidth  - 28;
    myCanvas.height = area.clientHeight - 28;
  }

  // ── LAYOUT PRESETS ──────────────────────────────
  function buildDefault7() {
    var W = myCanvas.width, H = myCanvas.height;
    var cx = W / 2, cy = H / 2;
    nodes = [
      { label:'A', x:cx-220, y:cy-130 },
      { label:'B', x:cx,     y:cy-160 },
      { label:'C', x:cx-220, y:cy+50  },
      { label:'D', x:cx,     y:cy+20  },
      { label:'E', x:cx+200, y:cy-120 },
      { label:'F', x:cx-100, y:cy+170 },
      { label:'G', x:cx+160, y:cy+160 },
    ];
    edges = [[0,1],[0,2],[1,3],[1,4],[2,3],[2,5],[3,4],[3,5],[3,6],[4,6],[5,6]];
  }

  function buildRandom(n) {
    var W = myCanvas.width, H = myCanvas.height;
    var pad = 80;
    var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    nodes = [];
    for (var i = 0; i < n; i++) {
      nodes.push({
        label: letters[i % 26],
        x: pad + Math.random() * (W - pad * 2),
        y: pad + Math.random() * (H - pad * 2),
      });
    }
    // connect each node to nearest 2-3 neighbours
    edges = [];
    var added = new Set();
    for (var i = 0; i < n; i++) {
      var others = [];
      for (var j = 0; j < n; j++) {
        if (i === j) continue;
        others.push({ j:j, d:Math.hypot(nodes[i].x-nodes[j].x, nodes[i].y-nodes[j].y) });
      }
      others.sort(function(a,b){return a.d-b.d;});
      var howMany = 2 + Math.floor(Math.random() * 2);
      for (var k = 0; k < Math.min(howMany, others.length); k++) {
        var a = Math.min(i, others[k].j), b = Math.max(i, others[k].j);
        var key = a + '-' + b;
        if (!added.has(key)) { edges.push([a,b]); added.add(key); }
      }
    }
  }

  function buildGrid(cols, rows) {
    var W = myCanvas.width, H = myCanvas.height;
    var pad = 70;
    var cw = (W - pad*2) / Math.max(cols-1, 1);
    var ch = (H - pad*2) / Math.max(rows-1, 1);
    var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    nodes = []; edges = [];
    var id = 0;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        nodes.push({ label:letters[id%26], x:pad+c*cw, y:pad+r*ch });
        if (c < cols-1) edges.push([id, id+1]);
        if (r < rows-1) edges.push([id, id+cols]);
        id++;
      }
    }
  }

  // ── ADJACENCY HELPERS ────────────────────────────
  function getNeighbors(i) {
    var result = [];
    edges.forEach(function(e) {
      if (e[0] === i) result.push(e[1]);
      if (e[1] === i) result.push(e[0]);
    });
    return result;
  }

  function hasEdge(a, b) {
    return edges.some(function(e) {
      return (e[0]===a&&e[1]===b)||(e[0]===b&&e[1]===a);
    });
  }

  function removeEdge(a, b) {
    edges = edges.filter(function(e) {
      return !((e[0]===a&&e[1]===b)||(e[0]===b&&e[1]===a));
    });
  }

  // ── CSP SOLVER ───────────────────────────────────
  function solveProblem(useFwdCheck) {
    snapshots = []; explored = 0; backtracks = 0;
    var n = nodes.length;
    var coloring = {};
    var domains  = {};
    for (var i = 0; i < n; i++) {
      domains[i] = new Set(Array.from({length:numColors}, function(_,k){return k;}));
    }

    function go(idx) {
      explored++;
      if (idx === n) {
        snapshots.push({ col:Object.assign({},coloring), st:'sol', msg:'All rooms colored!' });
        return true;
      }
      var dom = useFwdCheck
        ? Array.from(domains[idx]).sort(function(a,b){return a-b;})
        : Array.from({length:numColors}, function(_,k){return k;});

      for (var ci = 0; ci < dom.length; ci++) {
        var c   = dom[ci];
        var nbs = getNeighbors(idx);
        var ok  = nbs.every(function(nb){ return coloring[nb]===undefined||coloring[nb]!==c; });
        if (!ok) continue;

        coloring[idx] = c;
        snapshots.push({ col:Object.assign({},coloring), cur:idx, st:'place', msg:nodes[idx].label+' = '+colorNames[c] });

        var valid = true, backup = {};
        if (useFwdCheck) {
          nbs.forEach(function(nb) {
            if (coloring[nb]===undefined) {
              backup[nb] = new Set(domains[nb]);
              domains[nb].delete(c);
              if (domains[nb].size===0) valid=false;
            }
          });
        }

        if (valid && go(idx+1)) return true;

        delete coloring[idx];
        backtracks++;
        snapshots.push({ col:Object.assign({},coloring), cur:idx, conflict:idx, st:'back', msg:'Backtrack: '+nodes[idx].label+' = '+colorNames[c]+' conflicts' });
        if (useFwdCheck) Object.keys(backup).forEach(function(nb){domains[nb]=backup[nb];});
      }
      return false;
    }
    go(0);
  }

  // ── DRAW ─────────────────────────────────────────
  function drawMap(snap) {
    myCtx.fillStyle = '#06060f';
    myCtx.fillRect(0, 0, myCanvas.width, myCanvas.height);

    var coloring = snap ? snap.col : {};

    // edges
    edges.forEach(function(e) {
      var a = nodes[e[0]], b = nodes[e[1]];
      myCtx.strokeStyle = 'rgba(255,255,255,.18)';
      myCtx.lineWidth   = 2;
      myCtx.beginPath();
      myCtx.moveTo(a.x, a.y);
      myCtx.lineTo(b.x, b.y);
      myCtx.stroke();
    });

    // dashed line while adding edge
    if (addingEdge && edgeStartNode >= 0) {
      var sn = nodes[edgeStartNode];
      myCtx.strokeStyle = 'rgba(245,158,11,.6)';
      myCtx.lineWidth   = 2;
      myCtx.setLineDash([5,5]);
      myCtx.beginPath();
      myCtx.moveTo(sn.x, sn.y);
      myCtx.lineTo(lastMouseX, lastMouseY);
      myCtx.stroke();
      myCtx.setLineDash([]);
    }

    // nodes
    nodes.forEach(function(n, i) {
      var ci         = coloring[i];
      var isConflict = snap && snap.conflict === i;
      var isCur      = snap && snap.cur === i;
      var isESrc     = addingEdge && edgeStartNode === i;

      var fill   = ci !== undefined ? colorOptions[ci]+'30' : '#10101f';
      var stroke = 'rgba(255,255,255,.2)';
      var glow   = 'transparent';

      if      (isConflict)       { stroke='#ef4444'; glow='#ef4444'; }
      else if (ci !== undefined) { stroke=colorOptions[ci]; glow=colorOptions[ci]; }
      else if (isCur || isESrc)  { stroke='#f59e0b'; glow='#f59e0b'; }

      myCtx.shadowColor = glow;
      myCtx.shadowBlur  = glow!=='transparent' ? 14 : 0;
      myCtx.beginPath();
      myCtx.arc(n.x, n.y, 28, 0, Math.PI*2);
      myCtx.fillStyle   = fill;   myCtx.fill();
      myCtx.strokeStyle = stroke; myCtx.lineWidth = 2.5; myCtx.stroke();
      myCtx.shadowBlur  = 0;

      myCtx.fillStyle    = ci!==undefined ? colorOptions[ci] : '#dde0f5';
      myCtx.font         = 'bold 12px JetBrains Mono';
      myCtx.textAlign    = 'center';
      myCtx.textBaseline = 'middle';
      myCtx.fillText(n.label, n.x, n.y - (ci!==undefined ? 6 : 0));

      if (ci !== undefined) {
        myCtx.font      = '9px JetBrains Mono';
        myCtx.fillStyle = colorOptions[ci];
        myCtx.fillText(colorNames[ci], n.x, n.y + 8);
      }
    });

    myCtx.textBaseline = 'alphabetic';

    // status hint at bottom left
    myCtx.fillStyle = addingEdge ? '#f59e0b' : '#2e2e58';
    myCtx.font      = '10px JetBrains Mono';
    myCtx.textAlign = 'left';
    myCtx.fillText(
      addingEdge
        ? 'EDGE MODE: click 2 nodes to add/remove edge | right-click = cancel'
        : 'Drag nodes to move | toolbar: add rooms, add/remove edges',
      12, myCanvas.height - 10
    );

    // color legend bottom right
    var lx = myCanvas.width - numColors * 72 - 10;
    for (var i = 0; i < numColors; i++) {
      myCtx.fillStyle   = colorOptions[i];
      myCtx.shadowColor = colorOptions[i];
      myCtx.shadowBlur  = 4;
      myCtx.fillRect(lx + i*72, myCanvas.height-20, 12, 12);
      myCtx.shadowBlur  = 0;
      myCtx.fillStyle   = '#5a5a8a';
      myCtx.font        = '9px JetBrains Mono';
      myCtx.textAlign   = 'left';
      myCtx.fillText(colorNames[i], lx + i*72 + 16, myCanvas.height-10);
    }
  }

  // ── MOUSE EVENTS ─────────────────────────────────
  function getMousePos(e) {
    var rect = myCanvas.getBoundingClientRect();
    return {
      x: (e.clientX-rect.left) * (myCanvas.width  / rect.width),
      y: (e.clientY-rect.top)  * (myCanvas.height / rect.height),
    };
  }

  function getNodeAt(mx, my) {
    return nodes.findIndex(function(n) { return Math.hypot(n.x-mx, n.y-my) < 30; });
  }

  myCanvas.addEventListener('mousedown', function(e) {
    if (currentProb !== 'mapcolor') return;
    var pos = getMousePos(e);
    var ni  = getNodeAt(pos.x, pos.y);

    if (addingEdge) {
      if (ni < 0) return;
      if (edgeStartNode < 0) {
        edgeStartNode = ni;
        addLog('Edge from ' + nodes[ni].label + '... now click another node', 'hi');
        drawMap(null);
      } else if (ni !== edgeStartNode) {
        if (hasEdge(edgeStartNode, ni)) {
          removeEdge(edgeStartNode, ni);
          addLog('Removed edge: ' + nodes[edgeStartNode].label + '-' + nodes[ni].label, 'hi');
        } else {
          edges.push([edgeStartNode, ni]);
          addLog('Added edge: ' + nodes[edgeStartNode].label + '-' + nodes[ni].label, 'hi');
        }
        addingEdge = false; edgeStartNode = -1;
        refreshEdgeBtn();
        updateEditPanel();
        drawMap(null);
      }
      return;
    }

    if (ni >= 0 && !isRunning) draggingNode = ni;
  });

  myCanvas.addEventListener('mousemove', function(e) {
    if (currentProb !== 'mapcolor') return;
    var pos = getMousePos(e);
    lastMouseX = pos.x; lastMouseY = pos.y;
    if (draggingNode >= 0 && !isRunning) {
      nodes[draggingNode].x = pos.x;
      nodes[draggingNode].y = pos.y;
    }
    drawMap(null);
  });

  myCanvas.addEventListener('mouseup', function() { draggingNode = -1; });

  myCanvas.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    if (currentProb !== 'mapcolor' || !addingEdge) return;
    addingEdge = false; edgeStartNode = -1;
    refreshEdgeBtn();
    drawMap(null);
    addLog('Edge mode cancelled', 'hi');
  });

  // ── TOOLBAR / EDIT ────────────────────────────────
  function refreshEdgeBtn() {
    var btn = document.getElementById('map-edge-btn');
    if (!btn) return;
    if (addingEdge) {
      btn.textContent = '✕ Cancel Edge';
      btn.style.color = '#f59e0b';
      btn.style.borderColor = 'rgba(245,158,11,.4)';
    } else {
      btn.textContent = '+ Edge';
      btn.style.color = '';
      btn.style.borderColor = '';
    }
  }

  function buildExtraButtons() {
    document.getElementById('extra-tools').innerHTML =
      '<button class="btn" onclick="mapMod.addRoom()">+ Room</button>' +
      '<button class="btn" onclick="mapMod.removeRoom()">- Room</button>' +
      '<button class="btn" id="map-edge-btn" onclick="mapMod.toggleEdgeMode()">+ Edge</button>' +
      '<button class="btn" onclick="mapMod.randomLayout()">🎲 Random</button>';
  }

  function updateEditPanel() {
    var m = document.getElementById('edit-mount');
    if (!m) return;
    m.innerHTML =
      '<div class="edit-panel">' +
        '<div class="edit-row"><span class="edit-lbl">Preset</span>' +
          '<select class="edit-inp" style="width:auto" onchange="mapMod.setPreset(this.value)">' +
            '<option value="default7">Default 7</option>' +
            '<option value="rand5">Random 5</option>' +
            '<option value="rand8">Random 8</option>' +
            '<option value="rand10">Random 10</option>' +
            '<option value="grid6">Grid 2x3</option>' +
            '<option value="grid9">Grid 3x3</option>' +
          '</select>' +
        '</div>' +
        '<div class="edit-row"><span class="edit-lbl">Colors</span>' +
          '<select class="edit-inp" style="width:auto" onchange="mapMod.setColors(parseInt(this.value))">' +
            '<option value="3">3 colors</option>' +
            '<option value="4"' + (numColors===4?' selected':'') + '>4 colors</option>' +
            '<option value="5"' + (numColors===5?' selected':'') + '>5 colors</option>' +
            '<option value="6"' + (numColors===6?' selected':'') + '>6 colors</option>' +
          '</select>' +
        '</div>' +
        '<div class="edit-row" style="font:400 9px var(--mono);color:var(--mut)">' +
          nodes.length + ' rooms · ' + edges.length + ' edges | drag to reposition' +
        '</div>' +
      '</div>';
  }

  return {

    setPreset: function(val) {
      stopEverything(); resizeCanvas();
      snapshots=[]; explored=0; backtracks=0; addingEdge=false; edgeStartNode=-1;
      if      (val==='default7') buildDefault7();
      else if (val==='rand5')    buildRandom(5);
      else if (val==='rand8')    buildRandom(8);
      else if (val==='rand10')   buildRandom(10);
      else if (val==='grid6')    buildGrid(3,2);
      else if (val==='grid9')    buildGrid(3,3);
      drawMap(null); updateEditPanel(); refreshEdgeBtn();
      addLog(val + ': ' + nodes.length + ' rooms, ' + edges.length + ' edges', 'hi');
      setColorKey(0, nodes.length + ' rooms');
    },

    setColors: function(n) {
      numColors=n; snapshots=[]; explored=0; backtracks=0;
      drawMap(null);
      addLog('Using ' + n + ' colors for CSP', 'hi');
      setColorKey(1, n + ' colors');
    },

    addRoom: function() {
      if (isRunning) return;
      var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      nodes.push({
        label: letters[nodes.length % 26],
        x: 80 + Math.random() * (myCanvas.width  - 160),
        y: 80 + Math.random() * (myCanvas.height - 160),
      });
      snapshots=[]; explored=0; backtracks=0;
      drawMap(null); updateEditPanel();
      addLog('Added room ' + nodes[nodes.length-1].label + '. Drag it + add edges.', 'hi');
    },

    removeRoom: function() {
      if (isRunning || nodes.length <= 2) return;
      var removed = nodes.length - 1;
      nodes.pop();
      edges = edges.filter(function(e){return e[0]!==removed&&e[1]!==removed;});
      snapshots=[]; explored=0; backtracks=0;
      drawMap(null); updateEditPanel();
      addLog('Removed last room. ' + nodes.length + ' rooms left.', 'hi');
    },

    toggleEdgeMode: function() {
      addingEdge    = !addingEdge;
      edgeStartNode = -1;
      refreshEdgeBtn();
      drawMap(null);
      addLog(addingEdge
        ? 'Edge mode ON. Click node A then node B to add/remove edge. Right-click to cancel.'
        : 'Edge mode OFF.', 'hi');
    },

    randomLayout: function() {
      if (isRunning) return;
      var n = nodes.length;
      buildRandom(n);
      snapshots=[]; explored=0; backtracks=0;
      drawMap(null); updateEditPanel();
      addLog('Randomized layout: ' + n + ' rooms', 'hi');
    },

    init: function() {
      resizeCanvas(); snapshots=[]; explored=0; backtracks=0;
      addingEdge=false; edgeStartNode=-1; numColors=4;
      buildDefault7();
      buildExtraButtons();
      drawMap(null);
      updateEditPanel();
      addLog('Map Coloring CSP. Drag rooms. Use toolbar: + Room, - Room, + Edge, Random.', 'hi');
      setColorKey(0, nodes.length + ' rooms');
      setColorKey(1, numColors + ' colors');
    },

    run: function() {
      var algo = document.getElementById('algo-sel').value;
      setPhase('running', algo + ' coloring ' + nodes.length + ' rooms with ' + numColors + ' colors...');
      highlightStep(0);
      addLog('Running ' + algo + ' | ' + nodes.length + ' rooms, ' + numColors + ' colors', 'hi');

      var t0 = performance.now();
      solveProblem(algo === 'Fwd Checking');
      var elapsed = Math.round(performance.now() - t0);

      setStat(0, explored); setStat(1, backtracks); setStat(3, elapsed + 'ms');
      var solved = snapshots.some(function(s){return s.st==='sol';});
      onPathFound(solved ? 'Solved' : 'No solution');
      addLog('Done: explored=' + explored + ', bt=' + backtracks + ', ' + elapsed + 'ms', 'ok');

      runAnimation(snapshots, function(snap) {
        drawMap(snap);
        if (snap.st === 'back') {
          highlightStep(2);
          setPhase('running', snap.msg);
          addLog('  ' + snap.msg, 'err');
        } else if (snap.st === 'sol') {
          highlightStep(4);
          setPhase('done', 'All rooms colored! No conflicts.');
          addLog('Solved! All rooms colored with no adjacent conflicts.', 'ok');
          playSuccessSound();
        } else {
          highlightStep(0);
          setPhase('frontier', snap.msg);
          playFrontierSound();
        }
      });
    },

    reset: function() {
      snapshots=[]; explored=0; backtracks=0;
      addingEdge=false; edgeStartNode=-1;
      drawMap(null);
    },

    clear: function() {
      snapshots=[]; explored=0; backtracks=0;
      addingEdge=false; edgeStartNode=-1;
      buildDefault7(); drawMap(null); updateEditPanel();
    },
  };

})();
