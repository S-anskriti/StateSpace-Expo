// utils.js - helper functions used everywhere
// written by sanskriti

var myCanvas = document.getElementById('cv');
var myCtx    = myCanvas.getContext('2d');

// which problem is open rn
var currentProb = 'maze';

// animation speed delay in ms
var animDelay = 30;

// step counter
var totalSteps = 0;

// list of all pending timeouts so we can cancel
var allTimers = [];

// is animation running
var isRunning = false;

// sound on or off
var soundOn = true;

// audio context for sound effects
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// visited and frontier counters
var visitedCount  = 0;
var frontierCount = 0;

// speed options
var speedNames  = { 1:'Slow', 2:'Slow+', 3:'Med', 4:'Fast', 5:'Instant' };
var speedDelays = { 1:180,    2:70,      3:28,    4:8,      5:1 };

function setSpeed(val) {
  animDelay = speedDelays[val];
  document.getElementById('spd-lbl').textContent = speedNames[val];
}

// play a beep tone
function playBeep(freq, dur, type, vol) {
  if (!soundOn) return;
  try {
    var osc  = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(vol || 0.18, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    osc.start();
    osc.stop(audioCtx.currentTime + dur);
  } catch(e) {}
}

// different sounds for different events
function playSuccessSound() {
  if (!soundOn) return;
  var notes = [523, 659, 784, 1047];
  notes.forEach(function(f, i) {
    setTimeout(function() { playBeep(f, 0.18, 'sine', 0.2); }, i * 90);
  });
}
function playStepSound()     { playBeep(440, 0.04, 'sine', 0.04); }
function playFrontierSound() { playBeep(330, 0.03, 'sine', 0.03); }
function playFailSound()     { playBeep(200, 0.4, 'sawtooth', 0.12); }

function toggleSound() {
  soundOn = !soundOn;
  document.getElementById('sound-btn').textContent = soundOn ? '🔊' : '🔇';
  if (soundOn) audioCtx.resume();
}

// update the live status bar
var phaseColors = {
  ready:'#5a5a8a', running:'#f59e0b', frontier:'#f59e0b',
  visited:'#3b82f6', path:'#10b981', done:'#10b981', error:'#ef4444'
};
var phaseLabels = {
  ready:'READY', running:'RUNNING', frontier:'FRONTIER',
  visited:'EXPLORING', path:'PATH FOUND', done:'DONE', error:'FAILED'
};

function setPhase(ph, msg) {
  var col = phaseColors[ph] || '#5a5a8a';
  var lbl = phaseLabels[ph]  || ph.toUpperCase();
  var dot = document.getElementById('phase-dot');
  var txt = document.getElementById('phase-txt');
  dot.style.background  = col;
  dot.style.boxShadow   = '0 0 8px ' + col;
  txt.textContent        = lbl;
  txt.style.color        = col;
  if (msg) document.getElementById('status-msg').textContent = msg;
}

// update the stat boxes at bottom
function setStat(i, val) {
  document.getElementById('sc' + i).textContent = val;
}
function setColorKey(i, val) {
  document.getElementById('ck' + i).textContent = val;
}
function resetAllStats() {
  setStat(0, 0); setStat(1, 0); setStat(2, '--'); setStat(3, '0ms');
  visitedCount = 0; frontierCount = 0;
  setColorKey(2, 0); setColorKey(3, 0); setColorKey(4, '--');
}

// when we find a frontier node
function onFrontierNode() {
  frontierCount++;
  setStat(1, frontierCount);
  setColorKey(2, frontierCount);
}
// when we visit a node
function onVisitedNode() {
  visitedCount++;
  setStat(0, visitedCount);
  setColorKey(3, visitedCount);
}
// when path is found
function onPathFound(val) {
  setStat(2, val);
  setColorKey(4, val);
}

// add a line to the log
function addLog(msg, cls) {
  var logDiv = document.getElementById('log');
  var el = document.createElement('div');
  el.className = 'le ' + (cls || '');
  el.textContent = msg;
  logDiv.appendChild(el);
  logDiv.scrollTop = logDiv.scrollHeight;
  // keep max 100 entries
  while (logDiv.children.length > 100) {
    logDiv.removeChild(logDiv.firstChild);
  }
}
function clearLog() {
  document.getElementById('log').innerHTML = '';
}

// step counter
function bumpStep() {
  totalSteps++;
  document.getElementById('step-pill').textContent = 'Steps: ' + totalSteps;
}
function resetStepCount() {
  totalSteps = 0;
  document.getElementById('step-pill').textContent = 'Steps: 0';
}

// stop all running animations
function stopEverything() {
  allTimers.forEach(function(t) { clearTimeout(t); });
  allTimers = [];
  isRunning = false;
  document.getElementById('run-btn').disabled = false;
}

// run an array of steps with delay
function runAnimation(steps, drawFunc, doneFunc) {
  stopEverything();
  if (!steps.length) {
    if (doneFunc) doneFunc();
    return;
  }
  isRunning = true;
  document.getElementById('run-btn').disabled = true;
  var t0 = performance.now();

  steps.forEach(function(step, idx) {
    var t = setTimeout(function() {
      drawFunc(step, idx);
      bumpStep();
      if (idx === steps.length - 1) {
        setStat(3, Math.round(performance.now() - t0) + 'ms');
        isRunning = false;
        document.getElementById('run-btn').disabled = false;
        if (doneFunc) doneFunc();
      }
    }, idx * animDelay);
    allTimers.push(t);
  });
}

// update the algo explanation steps highlight
var currentAlgoStep = -1;
function highlightStep(i) {
  if (i === currentAlgoStep) return;
  currentAlgoStep = i;
  var allSteps = document.querySelectorAll('.algo-step');
  allSteps.forEach(function(el, j) {
    el.classList.remove('active', 'done');
    if (j < i)      el.classList.add('done');
    else if (j === i) el.classList.add('active');
  });
}
function resetStepHighlight() {
  currentAlgoStep = -1;
  document.querySelectorAll('.algo-step').forEach(function(el) {
    el.classList.remove('active', 'done');
  });
}
