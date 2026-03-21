// missionaries.js
// missionaries and cannibals river crossing problem
// sanskriti

var missionMod = (function() {

  var solution = [];
  var W = 600, H = 400;

  function isValidState(m, c) {
    if (m < 0 || c < 0 || m > 3 || c > 3) return false;
    if (m > 0 && m < c) return false;
    var mr = 3 - m, cr = 3 - c;
    if (mr > 0 && mr < cr) return false;
    return true;
  }

  function solveIt(useBFS) {
    var startState = [3, 3, 1];
    var goalKey    = '0,0,0';
    var moves      = [[2,0],[1,1],[1,0],[0,2],[0,1]];

    if (useBFS) {
      var queue   = [[startState, [startState]]];
      var visited = new Set([startState.join(',')]);
      while (queue.length > 0) {
        var item  = queue.shift();
        var state = item[0], path = item[1];
        if (state.join(',') === goalKey) return path;
        var m = state[0], c = state[1], b = state[2];
        moves.forEach(function(mv) {
          var nm = m + (b ? -mv[0] : mv[0]);
          var nc = c + (b ? -mv[1] : mv[1]);
          if (isValidState(nm, nc)) {
            var ns  = [nm, nc, 1 - b];
            var nk  = ns.join(',');
            if (!visited.has(nk)) {
              visited.add(nk);
              queue.push([ns, path.concat([ns])]);
            }
          }
        });
      }
    } else {
      // DFS
      var stack   = [[startState, [startState]]];
      var visited = new Set([startState.join(',')]);
      while (stack.length > 0) {
        var item  = stack.pop();
        var state = item[0], path = item[1];
        if (state.join(',') === goalKey) return path;
        var m = state[0], c = state[1], b = state[2];
        moves.forEach(function(mv) {
          var nm = m + (b ? -mv[0] : mv[0]);
          var nc = c + (b ? -mv[1] : mv[1]);
          if (isValidState(nm, nc)) {
            var ns = [nm, nc, 1 - b];
            var nk = ns.join(',');
            if (!visited.has(nk)) {
              visited.add(nk);
              stack.push([ns, path.concat([ns])]);
            }
          }
        });
      }
    }
    return null;
  }

  function drawStep(state, stepNum, total) {
    var ml   = state[0], cl = state[1], boat = state[2];
    var mr   = 3 - ml,   cr = 3 - cl;

    myCtx.fillStyle = '#06060f';
    myCtx.fillRect(0, 0, W, H);

    // river
    myCtx.fillStyle = '#060e22';
    myCtx.fillRect(210, 55, 180, 270);
    for (var i = 0; i < 9; i++) {
      myCtx.strokeStyle = 'rgba(59,130,246,' + (0.04 + i * 0.008) + ')';
      myCtx.lineWidth = 1;
      myCtx.beginPath();
      myCtx.moveTo(210, 75 + i * 26);
      myCtx.lineTo(390, 75 + i * 26);
      myCtx.stroke();
    }

    // banks
    myCtx.fillStyle = '#0d1a2e';
    myCtx.fillRect(0, 55, 210, 270);
    myCtx.fillRect(380, 55, 210, 270);
    myCtx.strokeStyle = 'rgba(255,255,255,.07)';
    myCtx.lineWidth = 1;
    myCtx.strokeRect(0, 55, 210, 270);
    myCtx.strokeRect(380, 55, 210, 270);

    myCtx.fillStyle = '#5a5a8a';
    myCtx.font = 'bold 10px JetBrains Mono';
    myCtx.textAlign = 'center';
    myCtx.fillText('LEFT BANK',  105, 46);
    myCtx.fillText('RIGHT BANK', 490, 46);

    // boat - amber since its the current action
    var bx = boat ? 228 : 358;
    myCtx.fillStyle = '#1a1200';
    myCtx.fillRect(bx, 215, 64, 30);
    myCtx.shadowColor = '#f59e0b';
    myCtx.shadowBlur  = 8;
    myCtx.strokeStyle = '#f59e0b';
    myCtx.lineWidth   = 2;
    myCtx.strokeRect(bx, 215, 64, 30);
    myCtx.shadowBlur  = 0;
    myCtx.fillStyle   = '#f59e0b';
    myCtx.font = 'bold 9px JetBrains Mono';
    myCtx.fillText('BOAT', bx + 32, 235);

    // draw person figure
    function drawFigure(x, y, type) {
      var col = type === 'M' ? '#3b82f6' : '#ef4444';
      myCtx.shadowColor = col;
      myCtx.shadowBlur  = 5;
      myCtx.fillStyle   = col;
      myCtx.beginPath();
      myCtx.arc(x, y, 9, 0, Math.PI * 2);
      myCtx.fill();
      myCtx.shadowBlur  = 0;
      myCtx.strokeStyle = col;
      myCtx.lineWidth   = 2;
      myCtx.beginPath();
      myCtx.moveTo(x, y+9);  myCtx.lineTo(x, y+26);
      myCtx.moveTo(x-10, y+16); myCtx.lineTo(x+10, y+16);
      myCtx.moveTo(x, y+26); myCtx.lineTo(x-7, y+40);
      myCtx.moveTo(x, y+26); myCtx.lineTo(x+7, y+40);
      myCtx.stroke();
    }

    for (var i = 0; i < ml; i++) drawFigure(28 + i*38, 115, 'M');
    for (var i = 0; i < cl; i++) drawFigure(28 + i*38, 188, 'C');
    for (var i = 0; i < mr; i++) drawFigure(402 + i*38, 115, 'M');
    for (var i = 0; i < cr; i++) drawFigure(402 + i*38, 188, 'C');

    myCtx.font = '11px JetBrains Mono';
    myCtx.fillStyle   = '#3b82f6'; myCtx.textAlign = 'left';
    myCtx.fillText('M: ' + ml, 10, 335);
    myCtx.fillStyle   = '#ef4444';
    myCtx.fillText('C: ' + cl, 10, 355);
    myCtx.fillStyle   = '#3b82f6'; myCtx.textAlign = 'right';
    myCtx.fillText('M: ' + mr, 590, 335);
    myCtx.fillStyle   = '#ef4444';
    myCtx.fillText('C: ' + cr, 590, 355);

    myCtx.fillStyle = '#2e2e58';
    myCtx.textAlign = 'center';
    myCtx.font = '10px JetBrains Mono';
    myCtx.fillText('Step ' + stepNum + ' / ' + (total - 1), 300, 380);

    var valid = (ml === 0 || ml >= cl) && (mr === 0 || mr >= cr);
    myCtx.fillStyle   = valid ? '#10b981' : '#ef4444';
    myCtx.shadowColor = myCtx.fillStyle;
    myCtx.shadowBlur  = 6;
    myCtx.fillText(valid ? 'Valid state' : 'Invalid - cannibals outnumber!', 300, 396);
    myCtx.shadowBlur  = 0;
  }

  return {
    init: function() {
      myCanvas.width  = W;
      myCanvas.height = H;
      document.getElementById('extra-tools').innerHTML = '';
      drawStep([3,3,1], 0, 1);
      addLog('Click Run to solve Missionaries & Cannibals', 'hi');
      setColorKey(0, '(3M,3C,L)');
      setColorKey(1, '(0M,0C,R)');
    },

    run: function() {
      var algo  = document.getElementById('algo-sel').value;
      var useBFS = (algo === 'BFS');
      setPhase('running', algo + ' solving...');
      addLog('Running ' + algo + ' on Missionaries & Cannibals', 'hi');
      highlightStep(0);

      var t0 = performance.now();
      solution = solveIt(useBFS);
      if (!solution) {
        addLog('No solution found', 'err');
        setPhase('error', 'No solution');
        return;
      }
      var elapsed = Math.round(performance.now() - t0);
      setStat(2, (solution.length - 1) + ' moves');
      setStat(3, elapsed + 'ms');
      addLog('Solution: ' + (solution.length - 1) + ' boat trips', 'ok');

      solution.forEach(function(state, i) {
        var t = setTimeout(function() {
          drawStep(state, i, solution.length);
          setStat(0, i + 1);
          setStat(1, solution.length - 1 - i);
          bumpStep();
          highlightStep(Math.min(i, 4));
          if (i === solution.length - 1) {
            setPhase('done', 'All crossed safely!');
            addLog('All missionaries and cannibals crossed safely!', 'ok');
            playSuccessSound();
          } else {
            setPhase('running', 'Step ' + (i+1) + ': boat on ' + (state[2] ? 'left' : 'right'));
            addLog('State ' + (i+1) + ': M_L=' + state[0] + ', C_L=' + state[1] + ', boat=' + (state[2] ? 'Left' : 'Right'), i%2===0 ? 'vis' : 'fr');
            playStepSound();
          }
        }, i * 600);
        allTimers.push(t);
      });
    },

    reset: function() {
      if (solution.length > 0) drawStep(solution[0], 0, solution.length);
      else { myCanvas.width = W; myCanvas.height = H; drawStep([3,3,1], 0, 1); }
    },
    clear: function() {
      solution = [];
      myCanvas.width = W; myCanvas.height = H;
      drawStep([3,3,1], 0, 1);
    },
  };

})();
