// mapcolor.js
// map coloring CSP - room colouring from unit 3
// sanskriti

var mapMod = (function() {

  // 4 colors for the rooms
  var colorOptions = ['#ef4444', '#3b82f6', '#f59e0b', '#10b981'];
  var colorNames   = ['Red', 'Blue', 'Amber', 'Green'];

  var snapshots = [];
  var explored  = 0;
  var backtracks= 0;

  // room definitions - positions and polygon shapes
  var rooms = [
    { id:'A', label:'Room A',   cx:115, cy:110, poly:[{x:10,y:10},{x:220,y:10},{x:220,y:210},{x:10,y:210}] },
    { id:'B', label:'Room B',   cx:320, cy:90,  poly:[{x:220,y:10},{x:440,y:10},{x:440,y:170},{x:220,y:170}] },
    { id:'C', label:'Room C',   cx:115, cy:290, poly:[{x:10,y:210},{x:220,y:210},{x:220,y:380},{x:10,y:380}] },
    { id:'D', label:'Room D',   cx:320, cy:265, poly:[{x:220,y:170},{x:440,y:170},{x:440,y:380},{x:220,y:380}] },
    { id:'E', label:'Room E',   cx:530, cy:160, poly:[{x:440,y:10},{x:620,y:10},{x:620,y:310},{x:440,y:310}] },
    { id:'F', label:'Corridor', cx:200, cy:450, poly:[{x:10,y:380},{x:320,y:380},{x:320,y:510},{x:10,y:510}] },
    { id:'G', label:'Lobby',    cx:475, cy:440, poly:[{x:320,y:380},{x:620,y:380},{x:620,y:510},{x:320,y:510}] },
  ];

  // which rooms are adjacent (share a wall)
  var adjacency = {
    A: ['B','C'],
    B: ['A','D','E'],
    C: ['A','D','F'],
    D: ['B','C','E','F','G'],
    E: ['B','D','G'],
    F: ['C','D','G'],
    G: ['D','E','F'],
  };

  var roomIds = rooms.map(function(r) { return r.id; });

  function resizeCanvas() {
    var area = document.getElementById('canvas-area');
    myCanvas.width  = area.clientWidth  - 28;
    myCanvas.height = area.clientHeight - 28;
  }

  function solveProblem(useFwdCheck) {
    snapshots  = [];
    explored   = 0;
    backtracks = 0;

    var coloring = {};
    var domains  = {};
    roomIds.forEach(function(id) {
      domains[id] = new Set([0, 1, 2, 3]);
    });

    function assignColors(idx) {
      explored++;
      if (idx === roomIds.length) {
        snapshots.push({ col: Object.assign({}, coloring), st: 'sol', msg: 'All rooms colored!' });
        return true;
      }

      var roomId   = roomIds[idx];
      var domToTry = useFwdCheck ? Array.from(domains[roomId]) : [0, 1, 2, 3];

      for (var i = 0; i < domToTry.length; i++) {
        var c = domToTry[i];
        // check no neighbor has same color
        var ok = (adjacency[roomId] || []).every(function(nb) {
          return coloring[nb] === undefined || coloring[nb] !== c;
        });

        if (!ok) continue;

        coloring[roomId] = c;
        snapshots.push({ col: Object.assign({}, coloring), cur: roomId, st: 'place', msg: roomId + ' = ' + colorNames[c] });

        var valid  = true;
        var backup = {};

        if (useFwdCheck) {
          (adjacency[roomId] || []).forEach(function(nb) {
            if (coloring[nb] === undefined) {
              backup[nb] = new Set(domains[nb]);
              domains[nb].delete(c);
              if (domains[nb].size === 0) valid = false;
            }
          });
        }

        if (valid && assignColors(idx + 1)) return true;

        delete coloring[roomId];
        backtracks++;
        snapshots.push({ col: Object.assign({}, coloring), cur: roomId, conflict: roomId, st: 'back', msg: 'Backtrack: ' + roomId + ' color ' + colorNames[c] + ' causes conflict' });

        if (useFwdCheck) {
          Object.keys(backup).forEach(function(nb) {
            domains[nb] = backup[nb];
          });
        }
      }
      return false;
    }

    assignColors(0);
  }

  function drawMap(snap) {
    var area  = document.getElementById('canvas-area');
    var scaleX = (myCanvas.width)  / 640;
    var scaleY = (myCanvas.height) / 530;
    var scale  = Math.min(scaleX, scaleY);
    var offX   = (myCanvas.width  - 640 * scale) / 2;
    var offY   = (myCanvas.height - 530 * scale) / 2;

    myCtx.fillStyle = '#06060f';
    myCtx.fillRect(0, 0, myCanvas.width, myCanvas.height);

    myCtx.save();
    myCtx.translate(offX, offY);
    myCtx.scale(scale, scale);

    var coloring = snap ? snap.col : {};

    // dashed lines between adjacent rooms
    roomIds.forEach(function(id) {
      var r1 = rooms.find(function(r) { return r.id === id; });
      (adjacency[id] || []).forEach(function(nb) {
        var r2 = rooms.find(function(r) { return r.id === nb; });
        myCtx.strokeStyle = 'rgba(255,255,255,.05)';
        myCtx.lineWidth   = 1;
        myCtx.setLineDash([4, 4]);
        myCtx.beginPath();
        myCtx.moveTo(r1.cx, r1.cy);
        myCtx.lineTo(r2.cx, r2.cy);
        myCtx.stroke();
        myCtx.setLineDash([]);
      });
    });

    // draw each room
    rooms.forEach(function(room) {
      var ci         = coloring[room.id];
      var isConflict = snap && snap.conflict === room.id;
      var isCur      = snap && snap.cur === room.id;

      myCtx.fillStyle = ci !== undefined ? colorOptions[ci] + '30' : '#10101f';

      var stroke = 'rgba(255,255,255,.1)';
      if      (isConflict)          stroke = '#ef4444';
      else if (ci !== undefined)    stroke = colorOptions[ci];
      else if (isCur)               stroke = '#f59e0b';

      myCtx.strokeStyle = stroke;
      myCtx.lineWidth   = isConflict ? 3 : ci !== undefined ? 2 : 1;

      if (ci !== undefined || isConflict) {
        myCtx.shadowColor = stroke;
        myCtx.shadowBlur  = isConflict ? 16 : 10;
      }

      myCtx.beginPath();
      myCtx.moveTo(room.poly[0].x, room.poly[0].y);
      room.poly.forEach(function(pt) { myCtx.lineTo(pt.x, pt.y); });
      myCtx.closePath();
      myCtx.fill();
      myCtx.stroke();
      myCtx.shadowBlur = 0;

      myCtx.fillStyle    = ci !== undefined ? colorOptions[ci] : '#5a5a8a';
      myCtx.font         = 'bold 13px Outfit';
      myCtx.textAlign    = 'center';
      myCtx.textBaseline = 'middle';
      myCtx.fillText(room.label, room.cx, room.cy);

      if (ci !== undefined) {
        myCtx.font = '10px JetBrains Mono';
        myCtx.fillText(colorNames[ci], room.cx, room.cy + 18);
      }
    });

    myCtx.restore();

    // color swatches at bottom
    colorOptions.forEach(function(c, i) {
      myCtx.fillStyle   = c;
      myCtx.shadowColor = c;
      myCtx.shadowBlur  = 5;
      myCtx.fillRect(10 + i*75, myCanvas.height - 20, 12, 12);
      myCtx.shadowBlur  = 0;
      myCtx.fillStyle   = '#5a5a8a';
      myCtx.font        = '10px JetBrains Mono';
      myCtx.textAlign   = 'left';
      myCtx.textBaseline= 'alphabetic';
      myCtx.fillText(colorNames[i], 26 + i*75, myCanvas.height - 10);
    });
  }

  return {

    init: function() {
      resizeCanvas();
      snapshots = []; explored = 0; backtracks = 0;
      document.getElementById('extra-tools').innerHTML = '';
      drawMap(null);
      addLog('Map Coloring CSP - 7 rooms, 4 colors. Click Run.', 'hi');
      setColorKey(0, '7 rooms');
      setColorKey(1, '4 colors');
    },

    run: function() {
      var algo = document.getElementById('algo-sel').value;
      setPhase('running', algo + ' coloring rooms...');
      highlightStep(0);
      addLog('Running ' + algo + ' on map coloring (7 rooms, 4 colors)', 'hi');

      var t0 = performance.now();
      solveProblem(algo === 'Fwd Checking');
      var elapsed = Math.round(performance.now() - t0);

      setStat(0, explored);
      setStat(1, backtracks);
      setStat(3, elapsed + 'ms');
      var solved = snapshots.some(function(s) { return s.st === 'sol'; });
      onPathFound(solved ? 'Solved' : 'No solution');
      addLog('Done: explored=' + explored + ', bt=' + backtracks + ', ' + elapsed + 'ms', 'ok');

      runAnimation(snapshots, function(snap) {
        drawMap(snap);
        if (snap.st === 'back') {
          highlightStep(2);
          setPhase('running', snap.msg || 'Backtrack');
          addLog('  ' + (snap.msg || 'Backtrack'), 'err');
        } else if (snap.st === 'sol') {
          highlightStep(4);
          setPhase('done', 'All rooms colored!');
          addLog('All rooms colored - no conflicts!', 'ok');
          playSuccessSound();
        } else {
          highlightStep(0);
          setPhase('frontier', snap.msg || 'Assigning...');
          addLog('  ' + (snap.msg || ''), 'fr');
          playFrontierSound();
        }
      });
    },

    reset: function() { snapshots = []; explored = 0; backtracks = 0; drawMap(null); },
    clear: function() { snapshots = []; explored = 0; backtracks = 0; drawMap(null); },
  };

})();
