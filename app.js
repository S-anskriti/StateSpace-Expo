// app.js
// main controller - builds sidebar, handles switching between problems
// ties everything together
// sanskriti - ai project

// build the sidebar from problemList
function buildSidebar() {
  var sb = document.getElementById('sidebar');
  sb.innerHTML = '';

  var groupNames = {
    1: 'Unit 1 — Intro to AI',
    2: 'Unit 2 — Search Algorithms',
    3: 'Unit 3 — Adversarial & CSP'
  };

  // group problems by unit
  var groups = { 1: [], 2: [], 3: [] };
  Object.keys(problemList).forEach(function(key) {
    var u = problemList[key].unit;
    groups[u].push(key);
  });

  [1, 2, 3].forEach(function(u) {
    // unit label
    var lbl = document.createElement('div');
    lbl.className = 'sb-label';
    lbl.textContent = groupNames[u];
    sb.appendChild(lbl);

    groups[u].forEach(function(key) {
      var p = problemList[key];
      var btn = document.createElement('button');
      btn.className = 'sb-btn' + (key === currentProb ? ' active' : '');
      btn.id = 'sb-' + key;
      btn.onclick = function() { switchProblem(key); };
      btn.innerHTML =
        '<div class="sb-icon">' + p.icon + '</div>' +
        '<div class="sb-meta">' +
          '<div class="sb-name">' + p.label + '</div>' +
          '<div class="sb-tag">'  + p.tag   + '</div>' +
        '</div>';
      sb.appendChild(btn);
    });
  });
}

// switch to a different problem
function switchProblem(key) {
  stopEverything();
  clearLog();
  resetStepCount();
  resetAllStats();
  resetStepHighlight();
  setPhase('ready', 'Select an algorithm and click Run');

  // update sidebar active state
  document.querySelectorAll('.sb-btn').forEach(function(b) {
    b.classList.remove('active');
  });
  var btn = document.getElementById('sb-' + key);
  if (btn) btn.classList.add('active');

  currentProb = key;
  document.getElementById('tb-title').textContent = problemList[key].label;

  // populate algo dropdown
  var sel = document.getElementById('algo-sel');
  sel.innerHTML = problemAlgos[key].map(function(a) {
    return '<option value="' + a + '">' + a + '</option>';
  }).join('');

  // clear extra toolbar buttons
  document.getElementById('extra-tools').innerHTML = '';

  updateInfoPanel();

  // init the problem module
  var mod = allModules[key];
  if (mod && mod.init) mod.init();
}

// when user picks a different algorithm
function onAlgoChange() {
  updateInfoPanel();
  stopEverything();
  var mod = allModules[currentProb];
  if (mod && mod.reset) mod.reset();
}

// refresh the right info panel
function updateInfoPanel() {
  var algo = document.getElementById('algo-sel').value;
  var info = algoInfo[algo];
  if (!info) return;

  // algo card
  var optTag   = info.isOptimal  ? '<span class="tag g">Optimal &#10003;</span>'   : '<span class="tag r">Not Optimal</span>';
  var compTag  = info.isComplete ? '<span class="tag g">Complete &#10003;</span>'  : '<span class="tag r">Incomplete</span>';
  document.getElementById('algo-mount').innerHTML =
    '<div class="acard">' +
      '<div class="acard-name" style="color:' + info.color + '">' + info.name + '</div>' +
      '<div class="acard-desc">' + info.desc + '</div>' +
      '<div class="tags">' +
        '<span class="tag y">Time: ' + info.tc + '</span>' +
        '<span class="tag b">Space: ' + info.sc + '</span>' +
        optTag + compTag +
      '</div>' +
    '</div>';

  // step by step explanation
  var steps = algoStepsList[algo] || [];
  document.getElementById('algo-steps').innerHTML = steps.map(function(s, i) {
    return '<div class="algo-step"><span class="step-num">' + (i+1) + '</span>' + s + '</div>';
  }).join('');

  // problem description
  document.getElementById('prob-mount').innerHTML =
    '<div class="acard" style="background:var(--s3);border-color:rgba(108,99,255,.15)">' +
      '<div style="font-size:10px;color:var(--mut);line-height:1.7">' + problemDesc[currentProb] + '</div>' +
    '</div>';

  // edit inputs panel
  buildEditPanel(currentProb);
}

// build the editable inputs section per problem
function buildEditPanel(prob) {
  var m = document.getElementById('edit-mount');

  if (prob === 'maze') {
    m.innerHTML =
      '<div class="edit-panel">' +
        '<div class="edit-row"><span class="edit-lbl">Grid size</span>' +
          '<select class="edit-inp" style="width:auto" onchange="mazeMod.resizeGrid(parseInt(this.value))">' +
            '<option value="16">16x16</option>' +
            '<option value="22" selected>22x22</option>' +
            '<option value="30">30x30</option>' +
            '<option value="40">40x40</option>' +
          '</select>' +
        '</div>' +
        '<div class="edit-row"><span class="edit-lbl">Draw mode</span>' +
          '<select class="edit-inp" style="width:auto" id="draw-tool" onchange="mazeMod.setTool(this.value)">' +
            '<option value="wall">Wall</option>' +
            '<option value="erase">Erase</option>' +
            '<option value="start">Start</option>' +
            '<option value="end">End</option>' +
          '</select>' +
        '</div>' +
      '</div>';

  } else if (prob === 'tsp') {
    m.innerHTML =
      '<div class="edit-panel">' +
        '<div class="edit-row"><span class="edit-lbl">City count</span>' +
          '<select class="edit-inp" style="width:auto" onchange="tspMod.setCityCount(parseInt(this.value))">' +
            '<option value="5">5 cities</option>' +
            '<option value="8" selected>8 cities</option>' +
            '<option value="10">10 cities</option>' +
            '<option value="12">12 cities</option>' +
          '</select>' +
        '</div>' +
        '<div class="edit-row" style="font:400 9px var(--mono);color:var(--mut)">Drag cities to move them</div>' +
      '</div>';

  } else if (prob === 'nqueens') {
    m.innerHTML =
      '<div class="edit-panel">' +
        '<div class="edit-row"><span class="edit-lbl">Board size</span>' +
          '<select class="edit-inp" style="width:auto" onchange="nqMod.setN(parseInt(this.value))">' +
            '<option value="6">6x6</option>' +
            '<option value="8" selected>8x8</option>' +
            '<option value="10">10x10</option>' +
            '<option value="12">12x12</option>' +
          '</select>' +
        '</div>' +
      '</div>';

  } else if (prob === 'graphsearch') {
    m.innerHTML =
      '<div class="edit-panel">' +
        '<div class="edit-row" style="font:400 9px var(--mono);color:var(--mut)">Click node = Source, then click another = Destination</div>' +
        '<div class="edit-row"><span class="edit-lbl">New graph</span>' +
          '<button class="btn" style="font-size:10px;padding:2px 8px" onclick="graphMod.makeRandom(8)">8 nodes</button>' +
          '<button class="btn" style="font-size:10px;padding:2px 8px" onclick="graphMod.makeRandom(12)">12 nodes</button>' +
        '</div>' +
      '</div>';

  } else if (prob === 'searchtree') {
    m.innerHTML =
      '<div class="edit-panel">' +
        '<div class="edit-row"><span class="edit-lbl">Regenerate</span>' +
          '<button class="btn" style="font-size:10px;padding:2px 8px" onclick="treeMod.rebuild()">New Tree</button>' +
        '</div>' +
        '<div class="edit-row" style="font:400 9px var(--mono);color:var(--mut)">Click a node to move the Goal</div>' +
      '</div>';

  } else {
    m.innerHTML =
      '<div class="edit-panel">' +
        '<div style="font:400 9px var(--mono);color:var(--mut)">Controls appear in toolbar above.</div>' +
      '</div>';
  }
}

// toolbar button handlers
function doRun() {
  if (isRunning) return;
  resetStepCount();
  resetAllStats();
  resetStepHighlight();
  clearLog();
  var mod = allModules[currentProb];
  if (mod && mod.run) mod.run();
}
function doReset() {
  stopEverything();
  resetStepCount();
  resetAllStats();
  resetStepHighlight();
  setPhase('ready', 'Cleared');
  var mod = allModules[currentProb];
  if (mod && mod.reset) mod.reset();
}
function doClear() {
  stopEverything();
  resetStepCount();
  resetAllStats();
  resetStepHighlight();
  clearLog();
  setPhase('ready', 'Select an algorithm and click Run');
  var mod = allModules[currentProb];
  if (mod && mod.clear) mod.clear();
}

// map of all modules - each module file sets these globals
var allModules = {};

// boot everything when page loads
window.addEventListener('DOMContentLoaded', function() {
  // register all modules
  allModules = {
    maze:         mazeMod,
    missionaries: missionMod,
    tsp:          tspMod,
    tictactoe:    tttMod,
    graphsearch:  graphMod,
    searchtree:   treeMod,
    nqueens:      nqMod,
    mapcolor:     mapMod,
    tictactoe3:   tttMod,
  };

  buildSidebar();
  switchProblem('maze');

  // unlock audio on first click (browser requires user gesture)
  document.addEventListener('click', function() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
  }, { once: true });
});

// resize canvas when window resizes
window.addEventListener('resize', function() {
  var mod = allModules[currentProb];
  if (mod && mod.init) mod.init();
});
