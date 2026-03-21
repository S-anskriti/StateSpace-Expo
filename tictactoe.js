// tictactoe.js
// tic tac toe with minimax and alpha beta
// sanskriti

var tttMod = (function() {

  var board      = new Array(9).fill(null);
  var gameOver   = false;
  var nodesCount = 0;
  var prunedCount= 0;
  var BOARD_SIZE = 420;
  var CELL_SIZE  = 140;

  function resizeCanvas() {
    myCanvas.width  = BOARD_SIZE;
    myCanvas.height = BOARD_SIZE + 32;
  }

  function checkWinner(b) {
    var lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (var i = 0; i < lines.length; i++) {
      var a = lines[i][0], x = lines[i][1], y = lines[i][2];
      if (b[a] && b[a] === b[x] && b[x] === b[y]) return b[a];
    }
    return null;
  }

  function drawBoard() {
    myCtx.fillStyle = '#06060f';
    myCtx.fillRect(0, 0, BOARD_SIZE, BOARD_SIZE + 32);

    // grid lines
    myCtx.strokeStyle = 'rgba(108,99,255,.25)';
    myCtx.lineWidth   = 2;
    for (var i = 1; i <= 2; i++) {
      myCtx.beginPath();
      myCtx.moveTo(i * CELL_SIZE, 12);
      myCtx.lineTo(i * CELL_SIZE, BOARD_SIZE - 12);
      myCtx.stroke();
      myCtx.beginPath();
      myCtx.moveTo(12, i * CELL_SIZE);
      myCtx.lineTo(BOARD_SIZE - 12, i * CELL_SIZE);
      myCtx.stroke();
    }

    // draw X and O
    board.forEach(function(val, i) {
      var row = Math.floor(i / 3), col = i % 3;
      var cx  = col * CELL_SIZE + CELL_SIZE / 2;
      var cy  = row * CELL_SIZE + CELL_SIZE / 2;

      if (val === 'X') {
        myCtx.shadowColor = '#3b82f6'; myCtx.shadowBlur = 14;
        myCtx.strokeStyle = '#3b82f6'; myCtx.lineWidth  = 9; myCtx.lineCap = 'round';
        var off = 44;
        myCtx.beginPath(); myCtx.moveTo(cx-off, cy-off); myCtx.lineTo(cx+off, cy+off); myCtx.stroke();
        myCtx.beginPath(); myCtx.moveTo(cx+off, cy-off); myCtx.lineTo(cx-off, cy+off); myCtx.stroke();
        myCtx.shadowBlur = 0;
      } else if (val === 'O') {
        myCtx.shadowColor = '#ef4444'; myCtx.shadowBlur = 14;
        myCtx.strokeStyle = '#ef4444'; myCtx.lineWidth  = 9;
        myCtx.beginPath(); myCtx.arc(cx, cy, 44, 0, Math.PI * 2); myCtx.stroke();
        myCtx.shadowBlur = 0;
      }
    });

    // highlight winning line
    var w = checkWinner(board);
    if (w) {
      var lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
      var winLine = lines.find(function(l) {
        return board[l[0]] && board[l[0]] === board[l[1]] && board[l[1]] === board[l[2]];
      });
      if (winLine) {
        myCtx.fillStyle = 'rgba(16,185,129,.1)';
        winLine.forEach(function(i) {
          var r = Math.floor(i/3), c = i%3;
          myCtx.fillRect(c*CELL_SIZE, r*CELL_SIZE, CELL_SIZE, CELL_SIZE);
        });
      }
    }

    // status text
    var msg = gameOver ? (w ? w + ' wins!' : 'Draw!') : 'Your turn (X)';
    myCtx.fillStyle   = gameOver ? '#10b981' : '#5a5a8a';
    myCtx.shadowColor = gameOver ? '#10b981' : 'transparent';
    myCtx.shadowBlur  = gameOver ? 10 : 0;
    myCtx.font = 'bold 15px Outfit';
    myCtx.textAlign = 'center'; myCtx.textBaseline = 'alphabetic';
    myCtx.fillText(msg, BOARD_SIZE/2, BOARD_SIZE + 20);
    myCtx.shadowBlur = 0;

    // show node/pruned counts
    myCtx.fillStyle = '#2e2e58'; myCtx.font = '10px JetBrains Mono'; myCtx.textAlign = 'left';
    myCtx.fillText('Nodes: ' + nodesCount + '  Pruned: ' + prunedCount, 10, BOARD_SIZE + 20);
  }

  function minimax(b, isMax, alpha, beta, depth) {
    nodesCount++;
    var w = checkWinner(b);
    if (w === 'O') return 10 - depth;
    if (w === 'X') return depth - 10;
    if (b.every(function(v) { return v; })) return 0;

    var useAB = document.getElementById('algo-sel').value === 'Alpha-Beta';

    if (isMax) {
      var best = -Infinity;
      for (var i = 0; i < 9; i++) {
        if (b[i]) continue;
        b[i] = 'O';
        best = Math.max(best, minimax(b, false, alpha, beta, depth + 1));
        b[i] = null;
        if (useAB) {
          alpha = Math.max(alpha, best);
          if (beta <= alpha) { prunedCount++; break; }
        }
      }
      return best;
    } else {
      var best = Infinity;
      for (var i = 0; i < 9; i++) {
        if (b[i]) continue;
        b[i] = 'X';
        best = Math.min(best, minimax(b, true, alpha, beta, depth + 1));
        b[i] = null;
        if (useAB) {
          beta = Math.min(beta, best);
          if (beta <= alpha) { prunedCount++; break; }
        }
      }
      return best;
    }
  }

  function doAIMove() {
    if (gameOver) return;
    nodesCount = 0; prunedCount = 0;
    var t0   = performance.now();
    var best = -Infinity, move = -1;

    for (var i = 0; i < 9; i++) {
      if (board[i]) continue;
      board[i] = 'O';
      var val  = minimax(board, false, -Infinity, Infinity, 0);
      board[i] = null;
      if (val > best) { best = val; move = i; }
    }
    var elapsed = Math.round(performance.now() - t0);
    if (move >= 0) board[move] = 'O';

    var w = checkWinner(board);
    if (w || board.every(function(v) { return v; })) gameOver = true;

    drawBoard();
    setStat(0, nodesCount);
    setStat(1, prunedCount);
    setStat(3, elapsed + 'ms');
    setStat(2, best > 0 ? 'AI wins' : best < 0 ? 'You win' : 'Draw');
    setPhase(gameOver ? 'done' : 'running', 'AI played cell ' + (move+1) + ' | score:' + best + ' nodes:' + nodesCount);
    addLog('AI cell ' + (move+1) + ' | score:' + best + ' | nodes:' + nodesCount + ' | pruned:' + prunedCount, 'ok');
    highlightStep(4);
    if (gameOver) playSuccessSound();
  }

  myCanvas.addEventListener('click', function(e) {
    if (currentProb !== 'tictactoe' && currentProb !== 'tictactoe3') return;
    if (gameOver) return;
    var rect = myCanvas.getBoundingClientRect();
    var sx = BOARD_SIZE / rect.width, sy = (BOARD_SIZE+32) / rect.height;
    var x  = (e.clientX - rect.left) * sx;
    var y  = (e.clientY - rect.top)  * sy;
    var idx = Math.floor(y / CELL_SIZE) * 3 + Math.floor(x / CELL_SIZE);
    if (idx < 0 || idx >= 9 || board[idx]) return;

    board[idx] = 'X';
    var w = checkWinner(board);
    if (w || board.every(function(v) { return v; })) {
      gameOver = true;
      drawBoard();
      setPhase('done', w ? 'You win!' : 'Draw!');
      addLog(w ? 'You win!' : 'Draw!', 'ok');
      if (w) playSuccessSound();
      return;
    }
    drawBoard();
    setPhase('running', 'AI thinking...');
    addLog('You played cell ' + (idx+1), 'vis');
    highlightStep(0);
    setTimeout(doAIMove, 120);
  });

  return {
    init: function() {
      resizeCanvas();
      board = new Array(9).fill(null);
      gameOver = false; nodesCount = 0; prunedCount = 0;
      document.getElementById('extra-tools').innerHTML = '';
      drawBoard();
      addLog('Click a cell to play as X. AI plays O.', 'hi');
      setColorKey(0, 'X (You)');
      setColorKey(1, 'O (AI)');
    },
    run: function() {
      addLog('Click a cell to make your move!', 'hi');
      setPhase('running', 'Waiting for your move...');
    },
    reset: function() {
      board = new Array(9).fill(null);
      gameOver = false; nodesCount = 0; prunedCount = 0;
      drawBoard(); resetAllStats();
    },
    clear: function() {
      board = new Array(9).fill(null);
      gameOver = false; nodesCount = 0; prunedCount = 0;
      drawBoard(); resetAllStats();
    },
  };

})();
