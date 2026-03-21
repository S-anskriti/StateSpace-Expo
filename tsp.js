// tsp.js - traveling salesman problem
// sanskriti

var tspMod = (function() {

  var cities    = [];
  var tour      = [];
  var bestDist  = 0;
  var dragging  = -1;
  var cityCount = 8;

  function resizeCanvas() {
    var area = document.getElementById('canvas-area');
    myCanvas.width  = area.clientWidth  - 28;
    myCanvas.height = area.clientHeight - 28;
  }

  function getDist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function getTourLength(t) {
    var d = 0;
    for (var i = 0; i < t.length; i++) {
      d += getDist(cities[t[i]], cities[t[(i+1) % t.length]]);
    }
    return d;
  }

  function placeCities(n) {
    cities = [];
    for (var i = 0; i < n; i++) {
      cities.push({
        x: 80 + Math.random() * (myCanvas.width  - 160),
        y: 70 + Math.random() * (myCanvas.height - 140),
        label: String.fromCharCode(65 + i)
      });
    }
    tour = []; bestDist = 0;
  }

  function drawCanvas(highlightCities) {
    highlightCities = highlightCities || [];
    myCtx.fillStyle = '#06060f';
    myCtx.fillRect(0, 0, myCanvas.width, myCanvas.height);

    // draw completed tour edges in green
    if (tour.length >= 2) {
      myCtx.strokeStyle = 'rgba(16,185,129,.55)';
      myCtx.lineWidth   = 2;
      myCtx.setLineDash([]);
      myCtx.beginPath();
      myCtx.moveTo(cities[tour[0]].x, cities[tour[0]].y);
      for (var i = 1; i < tour.length; i++) {
        myCtx.lineTo(cities[tour[i]].x, cities[tour[i]].y);
      }
      if (tour.length === cities.length) myCtx.closePath();
      myCtx.stroke();
    }

    // show current edge being evaluated - amber = frontier
    if (highlightCities.length === 2) {
      myCtx.strokeStyle = 'rgba(245,158,11,.8)';
      myCtx.lineWidth   = 3;
      myCtx.setLineDash([6, 3]);
      myCtx.shadowColor = '#f59e0b';
      myCtx.shadowBlur  = 8;
      myCtx.beginPath();
      myCtx.moveTo(cities[highlightCities[0]].x, cities[highlightCities[0]].y);
      myCtx.lineTo(cities[highlightCities[1]].x, cities[highlightCities[1]].y);
      myCtx.stroke();
      myCtx.shadowBlur  = 0;
      myCtx.setLineDash([]);
    }

    cities.forEach(function(c, i) {
      var isHi   = highlightCities.includes(i);
      var inTour = tour.includes(i) && !isHi;
      var col    = isHi ? '#f59e0b' : inTour ? '#10b981' : '#3b82f6';

      myCtx.shadowColor = col;
      myCtx.shadowBlur  = isHi ? 14 : 7;
      myCtx.beginPath();
      myCtx.arc(c.x, c.y, isHi ? 13 : 10, 0, Math.PI * 2);
      myCtx.fillStyle   = inTour && !isHi ? '#052a18' : '#0c0c22';
      myCtx.fill();
      myCtx.strokeStyle = col;
      myCtx.lineWidth   = 2.5;
      myCtx.stroke();
      myCtx.shadowBlur  = 0;

      myCtx.fillStyle     = '#dde0f5';
      myCtx.font          = 'bold 11px JetBrains Mono';
      myCtx.textAlign     = 'center';
      myCtx.textBaseline  = 'middle';
      myCtx.fillText(c.label, c.x, c.y);
    });

    myCtx.textBaseline = 'alphabetic';
    if (bestDist > 0) {
      myCtx.fillStyle   = '#10b981';
      myCtx.font        = 'bold 11px JetBrains Mono';
      myCtx.textAlign   = 'left';
      myCtx.shadowColor = '#10b981';
      myCtx.shadowBlur  = 6;
      myCtx.fillText('Tour: ' + Math.round(bestDist) + 'px', 12, myCanvas.height - 10);
      myCtx.shadowBlur  = 0;
    }
    myCtx.fillStyle = '#2e2e58';
    myCtx.font = '10px JetBrains Mono';
    myCtx.textAlign = 'right';
    myCtx.fillText('Drag to move | Click to add city', myCanvas.width - 10, myCanvas.height - 10);
  }

  myCanvas.addEventListener('mousedown', function(e) {
    if (currentProb !== 'tsp') return;
    var rect = myCanvas.getBoundingClientRect();
    var sx = myCanvas.width / rect.width, sy = myCanvas.height / rect.height;
    var mx = (e.clientX - rect.left) * sx, my = (e.clientY - rect.top) * sy;
    dragging = cities.findIndex(function(c) { return Math.hypot(c.x-mx, c.y-my) < 16; });
    if (dragging === -1 && cities.length < 12) {
      cities.push({ x: mx, y: my, label: String.fromCharCode(65 + cities.length % 26) });
      tour = []; bestDist = 0;
      drawCanvas();
    }
  });
  myCanvas.addEventListener('mousemove', function(e) {
    if (currentProb !== 'tsp' || dragging < 0) return;
    var rect = myCanvas.getBoundingClientRect();
    var sx = myCanvas.width / rect.width, sy = myCanvas.height / rect.height;
    cities[dragging].x = (e.clientX - rect.left) * sx;
    cities[dragging].y = (e.clientY - rect.top)  * sy;
    tour = []; bestDist = 0;
    drawCanvas();
  });
  myCanvas.addEventListener('mouseup', function() { dragging = -1; });

  return {
    setCityCount: function(n) {
      cityCount = n;
      resizeCanvas();
      placeCities(n);
      drawCanvas();
      addLog(n + ' cities placed', 'hi');
    },
    init: function() {
      resizeCanvas();
      document.getElementById('extra-tools').innerHTML =
        '<button class="btn" onclick="tspMod.newCities()">New Cities</button>';
      placeCities(cityCount);
      drawCanvas();
      addLog('Drag cities or click to add. Then Run.', 'hi');
    },
    newCities: function() {
      placeCities(cityCount);
      drawCanvas();
      addLog('New cities placed', 'hi');
    },
    run: function() {
      addLog('Greedy nearest-neighbor on ' + cities.length + ' cities', 'hi');
      setPhase('running', 'Finding nearest city...');
      highlightStep(0);

      var steps   = [];
      var visited = new Set([0]);
      var t       = [0];
      steps.push({ type: 'step', tour: t.slice(), hi: [0], msg: 'Start at ' + cities[0].label });

      while (visited.size < cities.length) {
        var last = t[t.length - 1];
        var best = -1, bd = Infinity;
        cities.forEach(function(_, i) {
          if (!visited.has(i)) {
            var d = getDist(cities[last], cities[i]);
            if (d < bd) { bd = d; best = i; }
          }
        });
        var prev = t[t.length - 1];
        visited.add(best);
        t.push(best);
        steps.push({ type: 'step', tour: t.slice(), hi: [best, prev], msg: 'Go to ' + cities[best].label + ' (' + Math.round(bd) + 'px)' });
      }
      steps.push({ type: 'done', tour: t.slice(), hi: [], msg: 'Tour complete!' });

      runAnimation(steps, function(step) {
        tour     = step.tour;
        bestDist = getTourLength(tour);
        drawCanvas(step.hi || []);
        setStat(0, step.tour.length);
        setStat(2, Math.round(bestDist) + 'px');
        onFrontierNode();
        highlightStep(Math.min(step.tour.length - 1, 3));
        setPhase(step.type === 'done' ? 'done' : 'frontier', step.msg);
        addLog('  ' + step.msg, step.type === 'done' ? 'ok' : 'fr');
        if (step.type === 'done') {
          onPathFound(Math.round(bestDist) + 'px');
          playSuccessSound();
        } else {
          playFrontierSound();
        }
      });
    },
    reset: function() { tour = []; bestDist = 0; drawCanvas(); },
    clear: function() { placeCities(cityCount); drawCanvas(); },
  };

})();
