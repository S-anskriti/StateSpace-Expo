// nqueens.js
// n queens CSP problem - backtracking and forward checking
// sanskriti

var nqMod = (function() {

  var N         = 8;
  var snapshots = [];
  var explored  = 0;
  var backtracks= 0;

  function resizeCanvas() {
    var area = document.getElementById('canvas-area');
    var sz   = Math.min(area.clientWidth - 28, area.clientHeight - 28);
    myCanvas.width  = sz;
    myCanvas.height = sz;
  }

  function isSafe(boardState, row, col) {
    for (var r = 0; r < row; r++) {
      if (boardState[r] === col) return false;
      if (Math.abs(boardState[r] - col) === Math.abs(r - row)) return false;
    }
    return true;
  }

  function solveProblem(useFwdCheck) {
    snapshots  = [];
    explored   = 0;
    backtracks = 0;

    var boardState = new Array(N).fill(-1);
    // domains for each row
    var domains = [];
    for (var i = 0; i < N; i++) {
      var d = new Set();
      for (var j = 0; j < N; j++) d.add(j);
      domains.push(d);
    }

    function backtrack(row) {
      explored++;
      if (row === N) {
        snapshots.push({ b: boardState.slice(), st: 'sol' });
        return true;
      }

      var domainToTry = useFwdCheck
        ? Array.from(domains[row]).sort(function(a,b){return a-b;})
        : Array.from({length:N}, function(_,i){return i;});

      for (var i = 0; i < domainToTry.length; i++) {
        var col = domainToTry[i];
        if (!isSafe(boardState, row, col)) continue;

        boardState[row] = col;
        snapshots.push({ b: boardState.slice(), row: row, col: col, st: 'place' });

        var valid = true;
        var backupDomains = {};

        if (useFwdCheck) {
          for (var r2 = row + 1; r2 < N; r2++) {
            backupDomains[r2] = new Set(domains[r2]);
            domains[r2].delete(col);
            for (var c2 = 0; c2 < N; c2++) {
              if (Math.abs(col - c2) === Math.abs(row - r2)) {
                domains[r2].delete(c2);
              }
            }
            if (domains[r2].size === 0) { valid = false; break; }
          }
        }

        if (valid && backtrack(row + 1)) return true;

        boardState[row] = -1;
        backtracks++;
        snapshots.push({ b: boardState.slice(), row: row, col: col, st: 'back' });

        if (useFwdCheck) {
          Object.keys(backupDomains).forEach(function(r2) {
            domains[r2] = backupDomains[r2];
          });
        }
      }
      return false;
    }

    backtrack(0);
  }

  function drawSnapshot(snap) {
    var SZ   = myCanvas.width;
    var CELL = SZ / N;

    myCtx.fillStyle = '#06060f';
    myCtx.fillRect(0, 0, SZ, SZ);

    // draw board squares
    for (var r = 0; r < N; r++) {
      for (var c = 0; c < N; c++) {
        myCtx.fillStyle = (r + c) % 2 === 0 ? '#11112e' : '#0c0c22';
        myCtx.fillRect(c*CELL, r*CELL, CELL, CELL);
      }
    }

    if (!snap) return;

    snap.b.forEach(function(col, row) {
      if (col < 0) return;

      var isBacktrack = snap.st === 'back' && snap.row === row;
      var isSolution  = snap.st === 'sol';

      // highlight square
      myCtx.fillStyle = isBacktrack ? 'rgba(239,68,68,.2)' : isSolution ? 'rgba(16,185,129,.12)' : 'rgba(245,158,11,.15)';
      myCtx.fillRect(col*CELL, row*CELL, CELL, CELL);

      // show attacked squares faintly (for teaching purposes)
      if (!isBacktrack && !isSolution) {
        myCtx.fillStyle = 'rgba(245,158,11,.04)';
        for (var c2 = 0; c2 < N; c2++) {
          if (c2 !== col) myCtx.fillRect(c2*CELL, row*CELL, CELL, CELL);
        }
        for (var r2 = row + 1; r2 < N; r2++) {
          var dc = Math.abs(r2 - row);
          if (col - dc >= 0) myCtx.fillRect((col-dc)*CELL, r2*CELL, CELL, CELL);
          if (col + dc < N)  myCtx.fillRect((col+dc)*CELL, r2*CELL, CELL, CELL);
        }
      }

      // queen
      var fs = Math.max(10, Math.round(CELL * 0.58));
      myCtx.font         = fs + 'px serif';
      myCtx.textAlign    = 'center';
      myCtx.textBaseline = 'middle';
      myCtx.shadowColor  = isSolution ? '#10b981' : isBacktrack ? '#ef4444' : '#f59e0b';
      myCtx.shadowBlur   = 10;
      myCtx.fillStyle    = isSolution ? '#10b981' : isBacktrack ? '#ef4444' : '#f59e0b';
      myCtx.fillText('♛', col*CELL + CELL/2, row*CELL + CELL/2);
      myCtx.shadowBlur   = 0;
    });

    myCtx.textBaseline = 'alphabetic';
    myCtx.fillStyle    = '#2e2e58';
    myCtx.font         = '9px JetBrains Mono';
    myCtx.textAlign    = 'left';
    myCtx.fillText('N=' + N + '  explored=' + explored + '  backtracks=' + backtracks, 6, SZ - 5);
  }

  return {

    setN: function(n) {
      N = n;
      snapshots = []; explored = 0; backtracks = 0;
      resizeCanvas();
      drawSnapshot(null);
      addLog('Board size: ' + N + 'x' + N, 'hi');
    },

    init: function() {
      resizeCanvas();
      snapshots = []; explored = 0; backtracks = 0;
      document.getElementById('extra-tools').innerHTML = '';
      drawSnapshot(null);
      addLog(N + '-Queens CSP. Amber=placing, Red=backtrack, Green=solved.', 'hi');
      setColorKey(0, '--');
      setColorKey(1, '--');
    },

    run: function() {
      var algo = document.getElementById('algo-sel').value;
      setPhase('running', 'Solving ' + N + '-Queens with ' + algo + '...');
      highlightStep(0);
      addLog('Running ' + algo + ' on ' + N + '-Queens', 'hi');

      var t0 = performance.now();
      solveProblem(algo === 'Fwd Checking');
      var elapsed = Math.round(performance.now() - t0);

      setStat(0, explored);
      setStat(1, backtracks);
      setStat(3, elapsed + 'ms');
      var solved = snapshots.some(function(s) { return s.st === 'sol'; });
      onPathFound(solved ? 'Solved' : 'No solution');
      addLog('Done: explored=' + explored + ', bt=' + backtracks + ', ' + elapsed + 'ms', 'ok');

      var stepIdx = 0;
      runAnimation(snapshots, function(snap) {
        drawSnapshot(snap);
        stepIdx++;
        if (snap.st === 'back') {
          highlightStep(2);
          setPhase('running', 'Backtrack row ' + snap.row);
          if (stepIdx % 5 === 0) addLog('  Backtrack at row ' + snap.row, 'err');
        } else if (snap.st === 'sol') {
          highlightStep(4);
          setPhase('done', 'Solved! All queens placed.');
          addLog('All queens placed - no conflicts!', 'ok');
          playSuccessSound();
        } else {
          highlightStep(0);
          setPhase('frontier', 'Row ' + snap.row + ': Queen at col ' + snap.col);
          if (stepIdx % 8 === 0) playFrontierSound();
        }
      });
    },

    reset: function() { snapshots = []; explored = 0; backtracks = 0; drawSnapshot(null); },
    clear: function() { snapshots = []; explored = 0; backtracks = 0; drawSnapshot(null); },
  };

})();
