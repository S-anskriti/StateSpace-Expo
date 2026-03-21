'use strict';
// ══════════════════════════════════════════════════════════
//  STATESPACE EXPO — app.js
//  Color system: Frontier=Amber, Visited=Blue, Path=Emerald
// ══════════════════════════════════════════════════════════

const cv  = document.getElementById('cv');
const ctx = cv.getContext('2d');

// ── STATE ────────────────────────────────────────────────
let CUR    = 'maze';
let DELAY  = 30;
let TIMERS = [];
let BUSY   = false;
let STEPS  = 0;
let VIS_C  = 0;
let FRT_C  = 0;

// ── COLORS (matches CSS vars) ─────────────────────────────
const C = {
  bg:       '#07071a',
  empty:    '#0c0c22',
  wall:     '#1e1e4a',
  start:    '#2d1a5e',
  startDot: '#8b5cf6',
  end:      '#3a0a0a',
  endDot:   '#ef4444',
  frontier: '#f59e0b',
  visited:  '#3b82f6',
  path:     '#10b981',
  grid:     '#11112e',
};

// ── SPEED ────────────────────────────────────────────────
const SPD_LBL  = {1:'Slow',2:'Slow+',3:'Med',4:'Fast',5:'Instant'};
const SPD_DELAY= {1:150, 2:60,  3:28,  4:8,   5:1};
function setSpeed(v){ DELAY=SPD_DELAY[v]; document.getElementById('spd-lbl').textContent=SPD_LBL[v]; }

// ── STATUS BAR ───────────────────────────────────────────
function setPhase(phase, msg){
  const colors = { ready:'#5860a0', running:'#f59e0b', visited:'#3b82f6', path:'#10b981', done:'#10b981', error:'#ef4444' };
  const labels = { ready:'READY', running:'RUNNING', visited:'EXPLORING', path:'PATH FOUND', done:'DONE', error:'FAILED' };
  document.getElementById('phase-dot').style.background = colors[phase]||'#5860a0';
  document.getElementById('phase-txt').textContent       = labels[phase]||phase.toUpperCase();
  document.getElementById('phase-txt').style.color       = colors[phase]||'#5860a0';
  if(msg) document.getElementById('status-msg').textContent = msg;
}

function setSC(vis, frt, res, time){
  if(vis  !== undefined){ document.getElementById('sc-vis').textContent  = vis;  document.getElementById('ck-vis').textContent  = vis; }
  if(frt  !== undefined){ document.getElementById('sc-frt').textContent  = frt;  document.getElementById('ck-frt').textContent  = frt; }
  if(res  !== undefined){ document.getElementById('sc-res').textContent  = res;  document.getElementById('ck-path').textContent = res; }
  if(time !== undefined)  document.getElementById('sc-time').textContent = time;
}
function resetSC(){ setSC(0,0,'—','0ms'); VIS_C=0; FRT_C=0; }

// ── STEP LOG ─────────────────────────────────────────────
function addLog(msg, cls=''){
  const log=document.getElementById('step-log');
  const el=document.createElement('div');
  el.className='sle '+(cls||'');
  el.textContent=msg;
  log.appendChild(el);
  log.scrollTop=log.scrollHeight;
  if(log.children.length>120) log.removeChild(log.firstChild);
}
function clearLog(){ document.getElementById('step-log').innerHTML=''; }

// ── STEP COUNTER ─────────────────────────────────────────
function incStep(){ STEPS++; document.getElementById('step-pill').textContent='Step '+STEPS; }
function resetSteps(){ STEPS=0; document.getElementById('step-pill').textContent='Step 0'; }

// ── ANIMATION ENGINE ─────────────────────────────────────
function stopAll(){
  TIMERS.forEach(t=>clearTimeout(t)); TIMERS=[];
  BUSY=false;
  document.getElementById('run-btn').disabled=false;
}

function animate(steps, drawFn, doneFn){
  stopAll();
  if(!steps.length){ if(doneFn) doneFn(); return; }
  BUSY=true;
  document.getElementById('run-btn').disabled=true;
  const t0=performance.now();
  steps.forEach((s,i)=>{
    const t=setTimeout(()=>{
      drawFn(s,i);
      incStep();
      if(i===steps.length-1){
        setSC(undefined,undefined,undefined, Math.round(performance.now()-t0)+'ms');
        BUSY=false;
        document.getElementById('run-btn').disabled=false;
        if(doneFn) doneFn();
      }
    }, i*DELAY);
    TIMERS.push(t);
  });
}

// ── PROBLEM REGISTRY ─────────────────────────────────────
const PROBS = {
  maze:         { label:'Maze Pathfinding',    icon:'🧩', tag:'State Space',   group:'Unit 1 — Intro to AI' },
  missionaries: { label:'Missionaries & C.',   icon:'🚣', tag:'Real Problem',  group:'Unit 1 — Intro to AI' },
  tsp:          { label:'Traveling Salesman',  icon:'🗺️', tag:'Optimization',  group:'Unit 1 — Intro to AI' },
  tictactoe:    { label:'Tic-Tac-Toe',         icon:'❌', tag:'Toy Problem',   group:'Unit 1 — Intro to AI' },
  graphsearch:  { label:'Graph Search',        icon:'🕸️', tag:'Weighted Graph', group:'Unit 2 — Search Algos' },
  searchtree:   { label:'Search Tree',         icon:'🌲', tag:'Frontier Viz',  group:'Unit 2 — Search Algos' },
  nqueens:      { label:'N-Queens (CSP)',      icon:'♛',  tag:'CSP',           group:'Unit 3 — Adversarial' },
  mapcolor:     { label:'Map Coloring',        icon:'🗾', tag:'CSP / Rooms',   group:'Unit 3 — Adversarial' },
  minimax:      { label:'Minimax / α-β',       icon:'🎮', tag:'Adversarial',   group:'Unit 3 — Adversarial' },
};

const PROB_ALGOS = {
  maze:         ['BFS','DFS','A*','Greedy','UCS'],
  missionaries: ['BFS','DFS'],
  tsp:          ['Greedy Nearest'],
  tictactoe:    ['Minimax','Alpha-Beta'],
  graphsearch:  ['BFS','DFS','Dijkstra','A*','DLS','IDA*'],
  searchtree:   ['BFS','DFS','Best-First'],
  nqueens:      ['Backtracking','Forward Checking'],
  mapcolor:     ['Backtracking','Forward Checking'],
  minimax:      ['Minimax','Alpha-Beta'],
};

const PROB_DESC = {
  maze:        'Grid cells are states. Walls block transitions. Agent finds path from purple Start to red Goal. Draw walls by clicking/dragging. Right-click to erase.',
  missionaries:'3 missionaries + 3 cannibals cross a river. Boat holds 1–2. Cannibals must never outnumber missionaries. State = (M_left, C_left, boat_side).',
  tsp:         'Visit all cities once and return home with minimum distance. NP-Hard. Greedy picks nearest unvisited city each step. Drag cities to reposition.',
  tictactoe:   'Toy Problem from Unit 1. Click to play as X. AI plays O using Minimax (or Alpha-Beta). Watch node counts and pruning stats.',
  graphsearch: 'Weighted graph with 9 nodes. Click a node to set Source → then Destination. Compare how BFS, Dijkstra, and A* explore differently.',
  searchtree:  'Random branching tree. Watch how BFS fills level-by-level (wide frontier) vs DFS dives deep (thin frontier). Node G is the goal.',
  nqueens:     'Place N queens so none attack each other. Classic CSP. Compare Backtracking (brute-force) vs Forward Checking (domain pruning). Toggle board size.',
  mapcolor:    'Color 7 rooms so no adjacent rooms share a color. Direct from Unit 3 Room Colouring CSP. Watch constraint propagation in real time.',
  minimax:     'Full Minimax game tree for Tic-Tac-Toe. Play a move; see the AI search every outcome. Alpha-Beta prunes branches — same result, fewer nodes.',
};

const ALGO_INFO = {
  'BFS':              { name:'Breadth-First Search',    color:'#3b82f6', desc:'Uses a Queue (FIFO). Explores all nodes at depth d before d+1. Guarantees shortest path on unweighted graphs.',           tc:'O(V+E)',      sc:'O(V)',    opt:true,  comp:true  },
  'DFS':              { name:'Depth-First Search',      color:'#f59e0b', desc:'Uses a Stack (LIFO). Dives as deep as possible, then backtracks. Memory-efficient but may find suboptimal paths.',         tc:'O(V+E)',      sc:'O(V)',    opt:false, comp:true  },
  'A*':               { name:'A* Search',               color:'#10b981', desc:'f(n)=g(n)+h(n). Combines actual cost g with heuristic h (Manhattan distance). Optimal when h is admissible.',             tc:'O(b^d)',      sc:'O(b^d)', opt:true,  comp:true  },
  'Greedy':           { name:'Greedy Best-First',       color:'#f59e0b', desc:'Only uses heuristic h(n) — ignores cost. Rushes toward goal greedily. Fast but not guaranteed optimal.',                  tc:'O(b^m)',      sc:'O(b^m)', opt:false, comp:false },
  'UCS':              { name:'Uniform Cost Search',     color:'#8b5cf6', desc:'Priority queue on g(n). Expands cheapest path first. Optimal for non-negative costs. Equivalent to Dijkstra on graphs.',  tc:'O(V+E)',      sc:'O(V)',    opt:true,  comp:true  },
  'Dijkstra':         { name:"Dijkstra's Algorithm",   color:'#8b5cf6', desc:'Classic weighted shortest-path. Relaxes edges via a min-heap. Foundation of UCS. Handles any non-negative weights.',      tc:'O((V+E)logV)',sc:'O(V)',    opt:true,  comp:true  },
  'DLS':              { name:'Depth-Limited Search',    color:'#ef4444', desc:'DFS capped at depth limit L. Prevents infinite loops. Fails if solution is deeper than L. Base of Iterative Deepening.', tc:'O(b^L)',      sc:'O(bL)',   opt:false, comp:false },
  'IDA*':             { name:'Iterative Deepening A*', color:'#f59e0b', desc:'A* with DFS memory. Iterates over f-cost thresholds. Uses O(d) space vs A*\'s O(b^d). Best of both worlds.',             tc:'O(b^d)',      sc:'O(d)',    opt:true,  comp:true  },
  'Minimax':          { name:'Minimax Algorithm',       color:'#ef4444', desc:'MAX picks highest score, MIN picks lowest. Recursively evaluates the full game tree. Perfect play for small games.',       tc:'O(b^m)',      sc:'O(bm)',   opt:true,  comp:true  },
  'Alpha-Beta':       { name:'Alpha-Beta Pruning',      color:'#ef4444', desc:'Minimax + pruning. α=MAX guarantee, β=MIN guarantee. Prunes when α≥β. Reduces branching factor from b to ~√b.',         tc:'O(b^(m/2))', sc:'O(bm)',   opt:true,  comp:true  },
  'Backtracking':     { name:'Backtracking CSP',        color:'#ef4444', desc:'Assign values variable-by-variable. Check constraints after each assignment. Backtrack on conflict. No look-ahead.',      tc:'O(d^n)',      sc:'O(n)',    opt:true,  comp:true  },
  'Forward Checking': { name:'Forward Checking',        color:'#f59e0b', desc:'After each assignment, prune domains of future variables. Backtrack early if any domain becomes empty.',                  tc:'O(d^n)',      sc:'O(n²)',   opt:true,  comp:true  },
  'Greedy Nearest':   { name:'Greedy Nearest Neighbor', color:'#f59e0b', desc:'Always visit the nearest unvisited city. Simple O(n²) heuristic. Fast but rarely finds optimal tour.',                   tc:'O(n²)',       sc:'O(n)',    opt:false, comp:true  },
  'Best-First':       { name:'Best-First Search',       color:'#f59e0b', desc:'Priority queue on heuristic h(n) only. Greedy expansion toward goal. Shows wider frontier than DFS, narrower than BFS.', tc:'O(b^m)',      sc:'O(b^m)', opt:false, comp:false },
};

// ── SIDEBAR ───────────────────────────────────────────────
function buildSidebar(){
  const sb=document.getElementById('sidebar');
  sb.innerHTML='';
  const groups={};
  Object.entries(PROBS).forEach(([k,p])=>{ if(!groups[p.group]) groups[p.group]=[]; groups[p.group].push(k); });
  Object.entries(groups).forEach(([grp,keys])=>{
    const g=document.createElement('div'); g.className='sb-grp';
    const lbl=document.createElement('div'); lbl.className='sb-grp-label'; lbl.textContent=grp; g.appendChild(lbl);
    keys.forEach(k=>{
      const p=PROBS[k];
      const btn=document.createElement('button');
      btn.className='sb-item'+(k===CUR?' active':''); btn.id='sb-'+k;
      btn.onclick=()=>switchTo(k);
      btn.innerHTML=`<div class="sb-ico">${p.icon}</div><div class="sb-text"><div class="sb-name">${p.label}</div><div class="sb-tag">${p.tag}</div></div>`;
      g.appendChild(btn);
    });
    sb.appendChild(g);
  });
}

// ── SWITCH PROBLEM ────────────────────────────────────────
function switchTo(key){
  stopAll(); clearLog(); resetSteps(); resetSC();
  setPhase('ready','Select an algorithm and click Run');
  document.querySelectorAll('.sb-item').forEach(b=>b.classList.remove('active'));
  const sb=document.getElementById('sb-'+key); if(sb) sb.classList.add('active');
  CUR=key;
  document.getElementById('tb-title').textContent=PROBS[key].label;
  const sel=document.getElementById('algo-sel');
  sel.innerHTML=PROB_ALGOS[key].map(a=>`<option value="${a}">${a}</option>`).join('');
  updateRPanel();
  document.getElementById('extra-tools').innerHTML='';
  MODULES[key].init();
}

function onAlgoChange(){ updateRPanel(); stopAll(); MODULES[CUR].reset(); }

function updateRPanel(){
  const algo=document.getElementById('algo-sel').value;
  const info=ALGO_INFO[algo]||{name:algo,color:'#6c63ff',desc:'',tc:'—',sc:'—',opt:false,comp:false};
  document.getElementById('algo-mount').innerHTML=`
    <div class="acard">
      <div class="acard-name" style="color:${info.color}">${info.name}</div>
      <div class="acard-desc">${info.desc}</div>
      <div class="tags">
        <span class="tag y">⏱ ${info.tc}</span>
        <span class="tag b">💾 ${info.sc}</span>
        <span class="tag ${info.opt?'g':'r'}">${info.opt?'✓ Optimal':'✗ Optimal'}</span>
        <span class="tag ${info.comp?'g':'r'}">${info.comp?'✓ Complete':'✗ Complete'}</span>
      </div>
    </div>`;
  document.getElementById('prob-mount').innerHTML=`
    <div class="acard" style="background:var(--s3);border-color:rgba(108,99,255,.15)">
      <div style="font-size:10px;color:var(--mut);line-height:1.7">${PROB_DESC[CUR]}</div>
    </div>`;
}

function doRun(){  if(BUSY)return; resetSteps(); resetSC(); clearLog(); MODULES[CUR].run(); }
function doReset(){ stopAll(); resetSteps(); resetSC(); setPhase('ready','Cleared'); MODULES[CUR].reset(); }
function doClear(){ stopAll(); resetSteps(); resetSC(); clearLog(); setPhase('ready','Select an algorithm and click Run'); MODULES[CUR].clear(); }

// ════════════════════════════════════════════════════════
// ██ MAZE MODULE
// ════════════════════════════════════════════════════════
const MAZE = (()=>{
  let R=22, CC=22, SZ=0;
  let grid=[], cs=[];  // grid: cell type, cs: visual state
  let sR=0,sC=0,eR=0,eC=0;
  let tool='wall', md=false;
  const EMPTY=0,WALL=1,START=2,END=3;
  const UNVIS=0,FRONT=1,VIS=2,PATH=3;

  function resizeCanvas(){
    const area=document.getElementById('canvas-area');
    const mw=area.clientWidth-28, mh=area.clientHeight-28;
    SZ=Math.max(8,Math.floor(Math.min(mw/CC,mh/R)));
    cv.width=SZ*CC; cv.height=SZ*R;
  }

  function makeGrid(){
    grid=Array.from({length:R},()=>new Uint8Array(CC));
    cs  =Array.from({length:R},()=>new Uint8Array(CC));
    sR=Math.floor(R/2); sC=2; eR=Math.floor(R/2); eC=CC-3;
    grid[sR][sC]=START; grid[eR][eC]=END;
  }

  function drawCell(r,c){
    const x=c*SZ,y=r*SZ,g=grid[r][c],s=cs[r][c];
    // background
    let bg;
    if(g===WALL)  bg=C.wall;
    else if(g===START) bg=C.start;
    else if(g===END)   bg=C.end;
    else if(s===PATH)  bg='#052a1a';
    else if(s===VIS)   bg='#071428';
    else if(s===FRONT) bg='#1a1000';
    else               bg=C.empty;
    ctx.fillStyle=bg; ctx.fillRect(x+.5,y+.5,SZ-1,SZ-1);

    // colored overlay for states
    if(s===FRONT&&g!==START&&g!==END){
      ctx.fillStyle='rgba(245,158,11,0.55)';
      ctx.fillRect(x+1,y+1,SZ-2,SZ-2);
    }
    if(s===VIS&&g!==START&&g!==END){
      ctx.fillStyle='rgba(59,130,246,0.45)';
      ctx.fillRect(x+1,y+1,SZ-2,SZ-2);
    }
    if(s===PATH&&g!==START&&g!==END){
      ctx.fillStyle='rgba(16,185,129,0.7)';
      ctx.fillRect(x+SZ*.1,y+SZ*.1,SZ*.8,SZ*.8);
    }
    // start / end dots
    if(g===START){
      ctx.fillStyle=C.startDot;
      ctx.shadowColor=C.startDot; ctx.shadowBlur=SZ*.4;
      ctx.beginPath(); ctx.arc(x+SZ/2,y+SZ/2,SZ*.3,0,Math.PI*2); ctx.fill();
      ctx.shadowBlur=0;
    }
    if(g===END){
      ctx.fillStyle=C.endDot;
      ctx.shadowColor=C.endDot; ctx.shadowBlur=SZ*.4;
      ctx.beginPath(); ctx.arc(x+SZ/2,y+SZ/2,SZ*.3,0,Math.PI*2); ctx.fill();
      ctx.shadowBlur=0;
    }
  }

  function drawAll(){
    ctx.fillStyle=C.bg; ctx.fillRect(0,0,cv.width,cv.height);
    for(let r=0;r<R;r++) for(let c=0;c<CC;c++) drawCell(r,c);
  }

  function clearVis(){
    for(let r=0;r<R;r++) for(let c=0;c<CC;c++) if(cs[r][c]!==UNVIS){cs[r][c]=UNVIS;drawCell(r,c);}
  }

  function getRC(e){
    const b=cv.getBoundingClientRect(),sx=cv.width/b.width,sy=cv.height/b.height;
    const c=Math.floor(((e.clientX-b.left)*sx)/SZ),r=Math.floor(((e.clientY-b.top)*sy)/SZ);
    return(r>=0&&r<R&&c>=0&&c<CC)?{r,c}:null;
  }

  function applyTool(rc){
    if(!rc) return;
    const {r,c}=rc,g=grid[r][c];
    if(tool==='wall'&&g!==START&&g!==END){grid[r][c]=WALL;drawCell(r,c);}
    else if(tool==='erase'&&g!==START&&g!==END){grid[r][c]=EMPTY;cs[r][c]=UNVIS;drawCell(r,c);}
    else if(tool==='start'&&g!==END){grid[sR][sC]=EMPTY;drawCell(sR,sC);sR=r;sC=c;grid[r][c]=START;drawCell(r,c);}
    else if(tool==='end'&&g!==START){grid[eR][eC]=EMPTY;drawCell(eR,eC);eR=r;eC=c;grid[r][c]=END;drawCell(r,c);}
  }

  cv.addEventListener('mousedown',e=>{if(CUR!=='maze'||BUSY)return;md=true;applyTool(getRC(e));});
  cv.addEventListener('mousemove',e=>{if(!md||CUR!=='maze'||BUSY)return;applyTool(getRC(e));});
  cv.addEventListener('mouseup',  ()=>{md=false;});
  cv.addEventListener('mouseleave',()=>{md=false;});
  cv.addEventListener('contextmenu',e=>{e.preventDefault();if(CUR!=='maze'||BUSY)return;const old=tool;tool='erase';applyTool(getRC(e));tool=old;});

  function nbrs(r,c){
    return[[0,1],[1,0],[0,-1],[-1,0]].map(([dr,dc])=>({r:r+dr,c:c+dc}))
      .filter(n=>n.r>=0&&n.r<R&&n.c>=0&&n.c<CC&&grid[n.r][n.c]!==WALL);
  }
  function mh(r1,c1,r2,c2){return Math.abs(r1-r2)+Math.abs(c1-c2);}
  function traceBack(par,er,ec){
    const p=[];let k=`${er},${ec}`;
    while(k){const[r,c]=k.split(',').map(Number);p.unshift({r,c});k=par[k];}
    return p;
  }

  function buildSteps(algo){
    const sk=`${sR},${sC}`,ek=`${eR},${eC}`;
    const steps=[],par={[sk]:null};

    if(algo==='BFS'||algo==='UCS'){
      const q=[{r:sR,c:sC,g:0}],vis=new Set([sk]);
      while(q.length){
        if(algo==='UCS') q.sort((a,b)=>a.g-b.g);
        const {r,c,g}=q.shift();
        steps.push({t:'v',r,c,qlen:q.length});
        if(r===eR&&c===eC){steps.push({t:'p',path:traceBack(par,eR,eC)});return steps;}
        for(const n of nbrs(r,c)){
          const k=`${n.r},${n.c}`;
          if(!vis.has(k)){vis.add(k);par[k]=`${r},${c}`;q.push({...n,g:g+1});steps.push({t:'f',r:n.r,c:n.c,qlen:q.length});}
        }
      }
    } else if(algo==='DFS'){
      const stk=[{r:sR,c:sC}],vis=new Set([sk]);
      while(stk.length){
        const {r,c}=stk.pop();
        if(vis.has(`${r},${c}`)&&`${r},${c}`!==sk) continue;
        vis.add(`${r},${c}`);
        steps.push({t:'v',r,c,qlen:stk.length});
        if(r===eR&&c===eC){steps.push({t:'p',path:traceBack(par,eR,eC)});return steps;}
        for(const n of nbrs(r,c)){
          const k=`${n.r},${n.c}`;
          if(!vis.has(k)){par[k]=`${r},${c}`;stk.push(n);steps.push({t:'f',r:n.r,c:n.c,qlen:stk.length});}
        }
      }
    } else { // A*, Greedy
      const pq=[],gCost={[sk]:0},vis=new Set();
      const push=it=>{pq.push(it);pq.sort((a,b)=>a.f-b.f);};
      push({r:sR,c:sC,f:0,g:0});
      while(pq.length){
        const {r,c,g}=pq.shift();const k=`${r},${c}`;
        if(vis.has(k)) continue; vis.add(k);
        steps.push({t:'v',r,c,qlen:pq.length});
        if(r===eR&&c===eC){steps.push({t:'p',path:traceBack(par,eR,eC)});return steps;}
        for(const n of nbrs(r,c)){
          const nk=`${n.r},${n.c}`,ng=g+1;
          if(gCost[nk]===undefined||ng<gCost[nk]){
            gCost[nk]=ng;par[nk]=k;
            const h=mh(n.r,n.c,eR,eC);
            push({r:n.r,c:n.c,f:algo==='A*'?ng+h:h,g:ng});
            steps.push({t:'f',r:n.r,c:n.c,qlen:pq.length});
          }
        }
      }
    }
    steps.push({t:'x'});
    return steps;
  }

  function genMaze(){
    for(let r=0;r<R;r++) for(let c=0;c<CC;c++) if(grid[r][c]!==START&&grid[r][c]!==END) grid[r][c]=WALL;
    const vis=new Set(),stk=[{r:1,c:1}]; grid[1][1]=EMPTY; vis.add('1,1');
    while(stk.length){
      const {r,c}=stk[stk.length-1];
      const nb=[[-2,0],[2,0],[0,-2],[0,2]].map(([dr,dc])=>({r:r+dr,c:c+dc}))
        .filter(n=>n.r>0&&n.r<R-1&&n.c>0&&n.c<CC-1&&!vis.has(`${n.r},${n.c}`));
      if(!nb.length){stk.pop();continue;}
      const nx=nb[Math.floor(Math.random()*nb.length)];
      grid[(r+nx.r)/2][(c+nx.c)/2]=EMPTY; grid[nx.r][nx.c]=EMPTY;
      vis.add(`${nx.r},${nx.c}`); stk.push(nx);
    }
    grid[sR][sC]=START; grid[eR][eC]=END;
    [-1,0,1].forEach(dr=>[-1,0,1].forEach(dc=>{
      const nr=sR+dr,nc=sC+dc; if(nr>=0&&nr<R&&nc>=0&&nc<CC) grid[nr][nc]=EMPTY;
      const nr2=eR+dr,nc2=eC+dc; if(nr2>=0&&nr2<R&&nc2>=0&&nc2<CC) grid[nr2][nc2]=EMPTY;
    }));
    grid[sR][sC]=START; grid[eR][eC]=END;
    cs=Array.from({length:R},()=>new Uint8Array(CC));
    drawAll();
  }

  function buildExtras(){
    document.getElementById('extra-tools').innerHTML=`
      <select class="sel" id="draw-tool" onchange="MODULES.maze.setTool(this.value)">
        <option value="wall">🧱 Wall</option>
        <option value="erase">◻ Erase</option>
        <option value="start">🟢 Start</option>
        <option value="end">🔴 End</option>
      </select>
      <button class="btn" onclick="MODULES.maze.maze()">⚡ Maze</button>
      <button class="btn" onclick="MODULES.maze.rand()">🎲 Random</button>
      <select class="sel" onchange="MODULES.maze.setSize(parseInt(this.value))">
        <option value="16">16×16</option>
        <option value="22" selected>22×22</option>
        <option value="30">30×30</option>
      </select>`;
  }

  return {
    setTool(t){ tool=t; },
    setSize(n){ R=n;CC=n; resizeCanvas(); makeGrid(); drawAll(); },
    maze(){ stopAll(); clearVis(); genMaze(); addLog('Maze generated (Recursive Backtracker)','info'); },
    rand(){
      stopAll(); clearVis();
      for(let r=0;r<R;r++) for(let c=0;c<CC;c++) if(grid[r][c]!==START&&grid[r][c]!==END&&Math.random()<.30) grid[r][c]=WALL;
      drawAll(); addLog('Random walls placed (30% density)','info');
    },
    init(){ resizeCanvas(); makeGrid(); drawAll(); buildExtras(); addLog('Draw walls then click Run','info'); },
    run(){
      clearVis();
      const algo=document.getElementById('algo-sel').value;
      setPhase('running',`${algo} searching...`);
      addLog(`▶ ${algo} started from (${sR},${sC}) → (${eR},${eC})`,'info');
      const steps=buildSteps(algo);
      let vc=0,fc=0,peakF=0;
      animate(steps, s=>{
        if(s.t==='f'){
          if(grid[s.r][s.c]!==START&&grid[s.r][s.c]!==END){cs[s.r][s.c]=FRONT;drawCell(s.r,s.c);}
          fc++;peakF=Math.max(peakF,s.qlen);
          setSC(undefined,peakF);
          setPhase('running',`Frontier: ${s.qlen} nodes | Adding (${s.r},${s.c})`);
          document.getElementById('ck-frt').textContent=peakF;
        }
        else if(s.t==='v'){
          if(grid[s.r][s.c]!==START&&grid[s.r][s.c]!==END){cs[s.r][s.c]=VIS;drawCell(s.r,s.c);}
          vc++;setSC(vc);
          if(vc%10===0) addLog(`  Visited ${vc} nodes...`,'visited');
        }
        else if(s.t==='p'){
          setPhase('path',`Path found! Length: ${s.path.length} steps`);
          addLog(`✓ PATH FOUND — ${s.path.length} steps, visited ${vc} nodes`,'path');
          setSC(undefined,undefined,s.path.length+' steps');
          document.getElementById('ck-path').textContent=s.path.length+' steps';
          s.path.forEach((p,i)=>{
            const tt=setTimeout(()=>{
              if(grid[p.r][p.c]!==START&&grid[p.r][p.c]!==END){cs[p.r][p.c]=PATH;drawCell(p.r,p.c);}
              if(i===s.path.length-1) setPhase('done','Done! Green = optimal path');
            },i*15);
            TIMERS.push(tt);
          });
        }
        else if(s.t==='x'){
          setPhase('error','No path found — blocked!');
          addLog('✗ No path found. Try clearing some walls.','err');
          setSC(undefined,undefined,'No path');
        }
      });
    },
    reset(){ clearVis(); drawAll(); },
    clear(){ makeGrid(); drawAll(); }
  };
})();

// ════════════════════════════════════════════════════════
// ██ MISSIONARIES MODULE
// ════════════════════════════════════════════════════════
const MISSIONARIES = (()=>{
  let sol=[];

  function resize(){ cv.width=600; cv.height=400; }

  function valid(m,c){
    if(m<0||c<0||m>3||c>3) return false;
    if(m>0&&m<c) return false;
    const mr=3-m,cr=3-c;
    if(mr>0&&mr<cr) return false;
    return true;
  }

  function solve(useBFS){
    const start=[3,3,1],goalKey='0,0,0';
    const moves=[[2,0],[1,1],[1,0],[0,2],[0,1]];
    if(useBFS){
      const q=[[start,[start]]],vis=new Set([start.join(',')]);
      while(q.length){
        const [state,path]=q.shift();
        if(state.join(',')===goalKey) return path;
        const [m,c,b]=state;
        for(const [dm,dc] of moves){
          const nm=m+(b?-dm:dm),nc=c+(b?-dc:dc);
          if(valid(nm,nc)){const ns=[nm,nc,1-b],nk=ns.join(',');if(!vis.has(nk)){vis.add(nk);q.push([ns,[...path,ns]]);}}
        }
      }
    } else {
      const stk=[[start,[start]]],vis=new Set([start.join(',')]);
      while(stk.length){
        const [state,path]=stk.pop();
        if(state.join(',')===goalKey) return path;
        const [m,c,b]=state;
        for(const [dm,dc] of moves){
          const nm=m+(b?-dm:dm),nc=c+(b?-dc:dc);
          if(valid(nm,nc)){const ns=[nm,nc,1-b],nk=ns.join(',');if(!vis.has(nk)){vis.add(nk);stk.push([ns,[...path,ns]]);}}
        }
      }
    }
    return null;
  }

  function drawState(state,step,total){
    const [ml,cl,boat]=state,mr=3-ml,cr=3-cl;
    ctx.fillStyle='#07071a'; ctx.fillRect(0,0,600,400);
    // River
    ctx.fillStyle='#060e22'; ctx.fillRect(210,55,180,270);
    // Animated river lines
    const t=Date.now()/1000;
    for(let i=0;i<9;i++){
      const alpha=0.04+0.02*Math.sin(t+i*.5);
      ctx.strokeStyle=`rgba(59,130,246,${alpha})`; ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(210,75+i*28);ctx.lineTo(390,75+i*28);ctx.stroke();
    }
    // Banks
    ctx.fillStyle='#0c0c22'; ctx.fillRect(0,55,210,270);
    ctx.fillStyle='#0c0c22'; ctx.fillRect(390,55,210,270);
    ctx.strokeStyle='rgba(255,255,255,.06)'; ctx.lineWidth=1;
    ctx.strokeRect(0,55,210,270); ctx.strokeRect(390,55,210,270);
    // Labels
    ctx.fillStyle='#5860a0'; ctx.font='bold 10px JetBrains Mono'; ctx.textAlign='center';
    ctx.fillText('LEFT BANK',105,46); ctx.fillText('RIGHT BANK',495,46);
    // BOAT — amber colored (it's currently being considered!)
    const bx=boat?228:358;
    ctx.fillStyle='#1a1000'; ctx.fillRect(bx,218,64,32);
    ctx.strokeStyle='#f59e0b'; ctx.lineWidth=2; ctx.strokeRect(bx,218,64,32);
    ctx.shadowColor='#f59e0b'; ctx.shadowBlur=8;
    ctx.fillStyle='#f59e0b'; ctx.font='bold 9px JetBrains Mono'; ctx.textAlign='center';
    ctx.fillText('BOAT',bx+32,239); ctx.shadowBlur=0;
    // Figures
    function fig(x,y,type){
      const col=type==='M'?'#3b82f6':'#ef4444';
      ctx.shadowColor=col; ctx.shadowBlur=4;
      ctx.fillStyle=col;
      ctx.beginPath();ctx.arc(x,y,9,0,Math.PI*2);ctx.fill();
      ctx.shadowBlur=0;
      ctx.strokeStyle=col; ctx.lineWidth=2;
      ctx.beginPath();
      ctx.moveTo(x,y+9);ctx.lineTo(x,y+26);
      ctx.moveTo(x-10,y+16);ctx.lineTo(x+10,y+16);
      ctx.moveTo(x,y+26);ctx.lineTo(x-7,y+40);
      ctx.moveTo(x,y+26);ctx.lineTo(x+7,y+40);
      ctx.stroke();
    }
    for(let i=0;i<ml;i++) fig(28+i*38,120,'M');
    for(let i=0;i<cl;i++) fig(28+i*38,195,'C');
    for(let i=0;i<mr;i++) fig(402+i*38,120,'M');
    for(let i=0;i<cr;i++) fig(402+i*38,195,'C');
    // Counts with colors
    ctx.font='11px JetBrains Mono'; ctx.textAlign='left';
    ctx.shadowColor='#3b82f6'; ctx.shadowBlur=4;
    ctx.fillStyle='#3b82f6'; ctx.fillText(`M: ${ml}`,10,335);
    ctx.shadowBlur=0;
    ctx.shadowColor='#ef4444'; ctx.shadowBlur=4;
    ctx.fillStyle='#ef4444'; ctx.fillText(`C: ${cl}`,10,355);
    ctx.shadowBlur=0;
    ctx.textAlign='right';
    ctx.shadowColor='#3b82f6'; ctx.shadowBlur=4;
    ctx.fillStyle='#3b82f6'; ctx.fillText(`M: ${mr}`,590,335);
    ctx.shadowBlur=0;
    ctx.shadowColor='#ef4444'; ctx.shadowBlur=4;
    ctx.fillStyle='#ef4444'; ctx.fillText(`C: ${cr}`,590,355);
    ctx.shadowBlur=0;
    // Step
    ctx.fillStyle='#2e2e60'; ctx.textAlign='center'; ctx.font='10px JetBrains Mono';
    ctx.fillText(`State ${step+1} / ${total}`,300,378);
    // State valid indicator
    const isValid=(ml===0||ml>=cl)&&(mr===0||mr>=cr);
    ctx.fillStyle=isValid?'#10b981':'#ef4444';
    ctx.shadowColor=ctx.fillStyle; ctx.shadowBlur=6;
    ctx.fillText(isValid?'✓ Valid state':'⚠ Invalid',300,395);
    ctx.shadowBlur=0;
  }

  return {
    init(){
      resize(); document.getElementById('extra-tools').innerHTML='';
      drawState([3,3,1],0,1); addLog('Click Run to solve','info');
      document.getElementById('ck-start').textContent='(3M,3C,L)';
      document.getElementById('ck-end').textContent='(0M,0C,R)';
    },
    run(){
      const algo=document.getElementById('algo-sel').value;
      setPhase('running',`${algo} solving...`);
      addLog(`▶ ${algo} on Missionaries & Cannibals`,'info');
      const t0=performance.now();
      sol=solve(algo==='BFS');
      if(!sol){addLog('✗ No solution found','err');setPhase('error','No solution');return;}
      const elapsed=Math.round(performance.now()-t0);
      setSC(sol.length,0,sol.length-1+' moves',elapsed+'ms');
      addLog(`✓ Solution: ${sol.length-1} boat trips`,'path');
      sol.forEach((state,i)=>{
        const tt=setTimeout(()=>{
          drawState(state,i,sol.length);
          setSC(i+1,sol.length-1-i);
          incStep();
          setPhase(i===sol.length-1?'done':'running', i===sol.length-1?'All safely crossed! 🎉':`Step ${i+1}: boat on ${state[2]?'left':'right'}`);
          if(i===sol.length-1) addLog('✓ All missionaries & cannibals crossed safely!','path');
          else addLog(`  State ${i+1}: M_L=${state[0]}, C_L=${state[1]}, boat=${state[2]?'Left':'Right'}`, i%2===0?'visited':'frontier');
        },i*600);
        TIMERS.push(tt);
      });
    },
    reset(){ if(sol.length) drawState(sol[0],0,sol.length); else{resize();drawState([3,3,1],0,1);} },
    clear(){ sol=[]; resize(); drawState([3,3,1],0,1); }
  };
})();

// ════════════════════════════════════════════════════════
// ██ TSP MODULE
// ════════════════════════════════════════════════════════
const TSP = (()=>{
  let cities=[],tour=[],bestDist=0,drag=-1;
  function resize(){ const a=document.getElementById('canvas-area'); cv.width=a.clientWidth-28;cv.height=a.clientHeight-28; }
  function dist(a,b){ return Math.hypot(a.x-b.x,a.y-b.y); }
  function tourLen(t){ let d=0;for(let i=0;i<t.length;i++) d+=dist(cities[t[i]],cities[t[(i+1)%t.length]]);return d; }

  function randCities(n=8){
    cities=[];
    for(let i=0;i<n;i++) cities.push({x:80+Math.random()*(cv.width-160),y:70+Math.random()*(cv.height-140),l:String.fromCharCode(65+i)});
    tour=[]; bestDist=0;
  }

  function draw(hi=[]){
    ctx.fillStyle='#07071a'; ctx.fillRect(0,0,cv.width,cv.height);
    // Draw tour edges
    if(tour.length>=2){
      for(let i=0;i<tour.length;i++){
        const a=cities[tour[i]],b=cities[tour[(i+1)%tour.length]];
        ctx.strokeStyle=i<tour.length-1?'rgba(16,185,129,.6)':'rgba(16,185,129,.3)';
        ctx.lineWidth=2.5; ctx.setLineDash([]);
        ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
      }
    }
    // highlight current edge being considered (frontier)
    if(hi.length===2){
      const a=cities[hi[0]],b=cities[hi[1]];
      ctx.strokeStyle='rgba(245,158,11,.8)'; ctx.lineWidth=3;
      ctx.shadowColor='#f59e0b'; ctx.shadowBlur=8;
      ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
      ctx.shadowBlur=0;
    }
    // Cities
    cities.forEach((c,i)=>{
      const isHi=hi.includes(i),inTour=tour.includes(i);
      const col=isHi?'#f59e0b':inTour?'#10b981':'#3b82f6';
      ctx.shadowColor=col; ctx.shadowBlur=isHi?12:6;
      ctx.beginPath();ctx.arc(c.x,c.y,isHi?14:11,0,Math.PI*2);
      ctx.fillStyle=inTour&&!isHi?'#052a1a':'#0c0c22'; ctx.fill();
      ctx.strokeStyle=col; ctx.lineWidth=2; ctx.stroke();
      ctx.shadowBlur=0;
      ctx.fillStyle='#e8eaff'; ctx.font='bold 11px JetBrains Mono';
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(c.l,c.x,c.y);
    });
    ctx.textBaseline='alphabetic';
    if(bestDist>0){
      ctx.fillStyle='#10b981'; ctx.font='bold 12px JetBrains Mono'; ctx.textAlign='left';
      ctx.shadowColor='#10b981'; ctx.shadowBlur=6;
      ctx.fillText(`Tour: ${Math.round(bestDist)}px`,12,cv.height-10);
      ctx.shadowBlur=0;
    }
    ctx.fillStyle='#2e2e60'; ctx.font='10px JetBrains Mono'; ctx.textAlign='right';
    ctx.fillText('Click to add city | Drag to move',cv.width-10,cv.height-10);
  }

  cv.addEventListener('mousedown',e=>{
    if(CUR!=='tsp') return;
    const b=cv.getBoundingClientRect(),sx=cv.width/b.width,sy=cv.height/b.height;
    const mx=(e.clientX-b.left)*sx,my=(e.clientY-b.top)*sy;
    drag=cities.findIndex(c=>Math.hypot(c.x-mx,c.y-my)<16);
    if(drag===-1&&cities.length<12){cities.push({x:mx,y:my,l:String.fromCharCode(65+cities.length%26)});tour=[];bestDist=0;draw();}
  });
  cv.addEventListener('mousemove',e=>{
    if(CUR!=='tsp'||drag<0) return;
    const b=cv.getBoundingClientRect(),sx=cv.width/b.width,sy=cv.height/b.height;
    cities[drag].x=(e.clientX-b.left)*sx;cities[drag].y=(e.clientY-b.top)*sy;
    tour=[];bestDist=0;draw();
  });
  cv.addEventListener('mouseup',()=>{drag=-1;});

  return {
    init(){
      resize(); document.getElementById('extra-tools').innerHTML=`<button class="btn" onclick="MODULES.tsp.newCities()">🎲 New Cities</button>`;
      randCities(8); draw(); addLog('Drag cities, click to add. Then Run.','info');
    },
    newCities(){ randCities(8); draw(); addLog('New cities placed','info'); },
    run(){
      setPhase('running','Greedy nearest-neighbor TSP...');
      addLog(`▶ Greedy Nearest Neighbor on ${cities.length} cities`,'info');
      const steps=[]; const vis=new Set([0]); let t=[0];
      steps.push({t:'step',tour:[...t],hi:[0],msg:`Start at city ${cities[0].l}`});
      while(vis.size<cities.length){
        const last=t[t.length-1]; let best=-1,bd=Infinity;
        cities.forEach((_,i)=>{if(!vis.has(i)){const d=dist(cities[last],cities[i]);if(d<bd){bd=d;best=i;}}});
        const prev=t[t.length-1]; vis.add(best); t.push(best);
        steps.push({t:'step',tour:[...t],hi:[best,prev],msg:`→ ${cities[best].l} (dist: ${Math.round(bd)}px)`});
      }
      steps.push({t:'done',tour:[...t],msg:'Tour complete!'});
      animate(steps,s=>{
        tour=s.tour; bestDist=tourLen(tour); draw(s.hi||[]);
        setSC(s.tour.length,cities.length-s.tour.length,Math.round(bestDist)+'px');
        setPhase(s.t==='done'?'done':'running',s.msg);
        addLog(`  ${s.msg}`,s.t==='done'?'path':'frontier');
      });
    },
    reset(){ tour=[]; bestDist=0; draw(); },
    clear(){ randCities(8); draw(); }
  };
})();

// ════════════════════════════════════════════════════════
// ██ TIC-TAC-TOE MODULE
// ════════════════════════════════════════════════════════
const TICTACTOE = (()=>{
  let board=new Array(9).fill(null),over=false,nodes=0,pruned=0;
  const SZ=420,CELL=140;
  function resize(){ cv.width=SZ; cv.height=SZ+30; }

  function winner(b){
    const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for(const [a,x,y] of lines) if(b[a]&&b[a]===b[x]&&b[x]===b[y]) return b[a];
    return null;
  }

  function draw(){
    ctx.fillStyle='#07071a'; ctx.fillRect(0,0,SZ,SZ+30);
    // Grid lines
    ctx.strokeStyle='rgba(108,99,255,.3)'; ctx.lineWidth=2;
    [1,2].forEach(i=>{
      ctx.beginPath();ctx.moveTo(i*CELL,12);ctx.lineTo(i*CELL,SZ-12);ctx.stroke();
      ctx.beginPath();ctx.moveTo(12,i*CELL);ctx.lineTo(SZ-12,i*CELL);ctx.stroke();
    });
    // Cells
    board.forEach((v,i)=>{
      const r=Math.floor(i/3),c=i%3;
      const cx=c*CELL+CELL/2,cy=r*CELL+CELL/2;
      if(v==='X'){
        ctx.strokeStyle='#3b82f6'; ctx.lineWidth=9; ctx.lineCap='round';
        ctx.shadowColor='#3b82f6'; ctx.shadowBlur=12;
        const off=44;
        ctx.beginPath();ctx.moveTo(cx-off,cy-off);ctx.lineTo(cx+off,cy+off);ctx.stroke();
        ctx.beginPath();ctx.moveTo(cx+off,cy-off);ctx.lineTo(cx-off,cy+off);ctx.stroke();
        ctx.shadowBlur=0;
      } else if(v==='O'){
        ctx.strokeStyle='#ef4444'; ctx.lineWidth=9;
        ctx.shadowColor='#ef4444'; ctx.shadowBlur=12;
        ctx.beginPath();ctx.arc(cx,cy,44,0,Math.PI*2);ctx.stroke();
        ctx.shadowBlur=0;
      }
    });
    // Win highlight
    const w=winner(board);
    if(w){
      const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
      const wl=lines.find(l=>board[l[0]]&&board[l[0]]===board[l[1]]&&board[l[1]]===board[l[2]]);
      if(wl){ctx.fillStyle=`rgba(16,185,129,.12)`;wl.forEach(i=>{const r2=Math.floor(i/3),c2=i%3;ctx.fillRect(c2*CELL,r2*CELL,CELL,CELL);});}
    }
    // Status
    const msg=over?(w?`${w} wins!`:'Draw!'):'Your turn (X)';
    ctx.fillStyle=over?'#10b981':'#5860a0';
    ctx.shadowColor=over?'#10b981':'transparent'; ctx.shadowBlur=over?8:0;
    ctx.font='bold 15px Syne'; ctx.textAlign='center'; ctx.textBaseline='alphabetic';
    ctx.fillText(msg,SZ/2,SZ+22); ctx.shadowBlur=0;
    // Stats bar
    ctx.fillStyle='#2e2e60'; ctx.font='10px JetBrains Mono'; ctx.textAlign='left';
    ctx.fillText(`Nodes: ${nodes}  Pruned: ${pruned}`,10,SZ+22);
  }

  function minimax(b,isMax,alpha,beta,depth){
    nodes++;
    const w=winner(b);
    if(w==='O') return 10-depth;
    if(w==='X') return depth-10;
    if(b.every(v=>v)) return 0;
    const useAB=document.getElementById('algo-sel').value==='Alpha-Beta';
    if(isMax){
      let best=-Infinity;
      for(let i=0;i<9;i++){
        if(b[i]) continue;
        b[i]='O'; best=Math.max(best,minimax(b,false,alpha,beta,depth+1)); b[i]=null;
        if(useAB){alpha=Math.max(alpha,best);if(beta<=alpha){pruned++;break;}}
      }
      return best;
    } else {
      let best=Infinity;
      for(let i=0;i<9;i++){
        if(b[i]) continue;
        b[i]='X'; best=Math.min(best,minimax(b,true,alpha,beta,depth+1)); b[i]=null;
        if(useAB){beta=Math.min(beta,best);if(beta<=alpha){pruned++;break;}}
      }
      return best;
    }
  }

  function aiMove(){
    if(over) return;
    nodes=0; pruned=0;
    const t0=performance.now();
    let best=-Infinity,move=-1;
    for(let i=0;i<9;i++){
      if(board[i]) continue;
      board[i]='O'; const val=minimax(board,false,-Infinity,Infinity,0); board[i]=null;
      if(val>best){best=val;move=i;}
    }
    const elapsed=Math.round(performance.now()-t0);
    if(move>=0) board[move]='O';
    const w=winner(board);
    if(w||board.every(v=>v)) over=true;
    draw();
    setSC(nodes,pruned,best>0?'AI wins':best<0?'You win':'Draw',elapsed+'ms');
    setPhase(over?'done':'running',`AI played cell ${move+1} (score: ${best})`);
    addLog(`AI→cell ${move+1} | score:${best} | nodes:${nodes} | pruned:${pruned}`,'path');
  }

  cv.addEventListener('click',e=>{
    if(CUR!=='tictactoe'&&CUR!=='minimax') return;
    if(over) return;
    const b=cv.getBoundingClientRect(),sx=SZ/b.width,sy=(SZ+30)/b.height;
    const x=(e.clientX-b.left)*sx,y=(e.clientY-b.top)*sy;
    const idx=Math.floor(y/CELL)*3+Math.floor(x/CELL);
    if(idx<0||idx>=9||board[idx]) return;
    board[idx]='X';
    const w=winner(board);
    if(w||board.every(v=>v)){over=true;draw();setPhase('done',w?'You win!':'Draw!');addLog(w?'You win!':'Draw!','path');return;}
    draw(); setPhase('running','AI thinking...'); addLog(`You played cell ${idx+1}`,'visited');
    setTimeout(aiMove,120);
  });

  return {
    init(){
      resize(); board=new Array(9).fill(null); over=false; nodes=0; pruned=0;
      document.getElementById('extra-tools').innerHTML='';
      draw(); addLog('Click a cell to play as X. AI plays O.','info');
      document.getElementById('ck-start').textContent='X (You)';
      document.getElementById('ck-end').textContent='O (AI)';
    },
    run(){ addLog('Click a cell to make your move!','info'); setPhase('running','Waiting for your move...'); },
    reset(){ board=new Array(9).fill(null); over=false; nodes=0; pruned=0; draw(); resetSC(); },
    clear(){ board=new Array(9).fill(null); over=false; nodes=0; pruned=0; draw(); resetSC(); }
  };
})();

// ════════════════════════════════════════════════════════
// ██ GRAPH SEARCH MODULE
// ════════════════════════════════════════════════════════
const GRAPHSEARCH = (()=>{
  let nodes=[],edges=[],src=0,dst=5;
  let visSet=new Set(),frontSet=new Set(),pathEdges=new Set(),pathNodes=new Set();
  let clickMode=0;

  function resize(){ const a=document.getElementById('canvas-area');cv.width=a.clientWidth-28;cv.height=a.clientHeight-28; }

  function buildGraph(){
    const W=cv.width,H=cv.height;
    nodes=[
      {x:.17*W,y:.42*H,l:'A'},{x:.35*W,y:.18*H,l:'B'},{x:.35*W,y:.68*H,l:'C'},
      {x:.56*W,y:.28*H,l:'D'},{x:.56*W,y:.68*H,l:'E'},{x:.80*W,y:.42*H,l:'F'},
      {x:.24*W,y:.76*H,l:'G'},{x:.50*W,y:.86*H,l:'H'},{x:.72*W,y:.78*H,l:'I'},
    ];
    edges=[
      {a:0,b:1,w:4},{a:0,b:2,w:3},{a:0,b:6,w:7},
      {a:1,b:3,w:5},{a:1,b:2,w:2},
      {a:2,b:4,w:6},{a:2,b:6,w:4},
      {a:3,b:5,w:3},{a:3,b:4,w:2},
      {a:4,b:5,w:5},{a:4,b:7,w:4},
      {a:5,b:8,w:2},{a:6,b:7,w:5},{a:7,b:8,w:3},
    ];
    src=0;dst=5;visSet=new Set();frontSet=new Set();pathEdges=new Set();pathNodes=new Set();
  }

  function ep(a,b){ return `${Math.min(a,b)}-${Math.max(a,b)}`; }

  function draw(){
    ctx.fillStyle='#07071a'; ctx.fillRect(0,0,cv.width,cv.height);
    // Edges
    edges.forEach(e=>{
      const na=nodes[e.a],nb=nodes[e.b],key=ep(e.a,e.b);
      const isPth=pathEdges.has(key);
      ctx.strokeStyle=isPth?'#10b981':'rgba(255,255,255,.08)';
      ctx.lineWidth=isPth?3:1.5;
      if(isPth){ctx.shadowColor='#10b981';ctx.shadowBlur=8;}
      ctx.beginPath();ctx.moveTo(na.x,na.y);ctx.lineTo(nb.x,nb.y);ctx.stroke();
      ctx.shadowBlur=0;
      // Weight label
      const mx=(na.x+nb.x)/2,my=(na.y+nb.y)/2;
      ctx.fillStyle='#2e2e60'; ctx.font='9px JetBrains Mono'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(e.w,mx,my-7);
    });
    // Nodes
    nodes.forEach((n,i)=>{
      let fill='#0c0c22',stroke='rgba(255,255,255,.1)',r=18,glow='transparent';
      if(i===src){fill='#2d1a5e';stroke='#8b5cf6';glow='#8b5cf6';}
      else if(i===dst){fill='#3a0a0a';stroke='#ef4444';glow='#ef4444';}
      else if(pathNodes.has(i)){fill='#052a1a';stroke='#10b981';glow='#10b981';}
      else if(visSet.has(i)){fill='#071428';stroke='#3b82f6';glow='#3b82f6';}
      else if(frontSet.has(i)){fill='#1a1000';stroke='#f59e0b';glow='#f59e0b';r=20;}
      ctx.shadowColor=glow; ctx.shadowBlur=glow!=='transparent'?12:0;
      ctx.beginPath();ctx.arc(n.x,n.y,r,0,Math.PI*2);
      ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=stroke;ctx.lineWidth=2.5;ctx.stroke();
      ctx.shadowBlur=0;
      ctx.fillStyle='#e8eaff'; ctx.font='bold 12px JetBrains Mono'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(n.l,n.x,n.y);
    });
    ctx.textBaseline='alphabetic';
    ctx.fillStyle='#8b5cf6';ctx.font='10px JetBrains Mono';ctx.textAlign='left';
    ctx.fillText(`◉ Source: ${nodes[src].l}`,12,cv.height-22);
    ctx.fillStyle='#ef4444';ctx.fillText(`◉ Dest: ${nodes[dst].l}`,12,cv.height-8);
    ctx.fillStyle='#2e2e60';ctx.textAlign='right';
    ctx.fillText(`Click node: ${clickMode===0?'set Source':'set Destination'}`,cv.width-10,cv.height-8);
  }

  cv.addEventListener('click',e=>{
    if(CUR!=='graphsearch'||BUSY) return;
    const b=cv.getBoundingClientRect(),sx=cv.width/b.width,sy=cv.height/b.height;
    const mx=(e.clientX-b.left)*sx,my=(e.clientY-b.top)*sy;
    const ni=nodes.findIndex(n=>Math.hypot(n.x-mx,n.y-my)<22);
    if(ni<0) return;
    if(clickMode===0){src=ni;clickMode=1;addLog(`Source → ${nodes[ni].l}. Now click Destination.`,'info');}
    else{dst=ni;clickMode=0;addLog(`Destination → ${nodes[ni].l}. Click Run.`,'info');}
    visSet=new Set();frontSet=new Set();pathEdges=new Set();pathNodes=new Set();draw();
  });

  function adj(n){ return edges.flatMap(e=>e.a===n?[{n:e.b,w:e.w}]:e.b===n?[{n:e.a,w:e.w}]:[]); }
  function eu(a,b){ return Math.hypot(nodes[a].x-nodes[b].x,nodes[a].y-nodes[b].y)*.1; }
  function traceG(par,end){ const p=[];let c=end;while(c!==null){p.unshift(c);c=par[c];}return p; }
  function pqSort(arr,k){ arr.sort((a,b)=>a[k]-b[k]); }

  function runAlgo(){
    const algo=document.getElementById('algo-sel').value;
    const steps=[];

    if(algo==='BFS'){
      const q=[{n:src,path:[src]}],v=new Set([src]);
      while(q.length){
        const {n,path}=q.shift();steps.push({t:'v',n,fs:q.length});
        if(n===dst){steps.push({t:'p',path,cost:path.length-1});break;}
        for(const {n:nb} of adj(n)) if(!v.has(nb)){v.add(nb);q.push({n:nb,path:[...path,nb]});steps.push({t:'f',n:nb,fs:q.length});}
      }
    } else if(algo==='DFS'||algo==='DLS'){
      const limit=algo==='DLS'?4:999;
      const stk=[{n:src,path:[src],d:0}],v=new Set();
      while(stk.length){
        const {n,path,d}=stk.pop();if(v.has(n))continue;v.add(n);
        steps.push({t:'v',n,fs:stk.length});
        if(n===dst){steps.push({t:'p',path,cost:path.length-1});break;}
        if(d<limit) for(const {n:nb} of adj(n)) if(!v.has(nb)){stk.push({n:nb,path:[...path,nb],d:d+1});steps.push({t:'f',n:nb,fs:stk.length});}
      }
    } else if(algo==='Dijkstra'){
      const d={[src]:0},par={[src]:null},v=new Set(),pq=[{n:src,d:0}];
      while(pq.length){
        pqSort(pq,'d');const {n,d:dn}=pq.shift();if(v.has(n))continue;v.add(n);
        steps.push({t:'v',n,fs:pq.length,cost:dn});
        if(n===dst){const p=traceG(par,dst);steps.push({t:'p',path:p,cost:dn});break;}
        for(const {n:nb,w} of adj(n)){const nd=dn+w;if(d[nb]===undefined||nd<d[nb]){d[nb]=nd;par[nb]=n;pq.push({n:nb,d:nd});steps.push({t:'f',n:nb,fs:pq.length});}}
      }
    } else if(algo==='A*'){
      const g={[src]:0},par={[src]:null},v=new Set(),pq=[{n:src,f:eu(src,dst),g:0}];
      while(pq.length){
        pqSort(pq,'f');const {n,g:gn}=pq.shift();if(v.has(n))continue;v.add(n);
        steps.push({t:'v',n,fs:pq.length});
        if(n===dst){const p=traceG(par,dst);steps.push({t:'p',path:p,cost:gn});break;}
        for(const {n:nb,w} of adj(n)){const ng=gn+w;if(g[nb]===undefined||ng<g[nb]){g[nb]=ng;par[nb]=n;pq.push({n:nb,f:ng+eu(nb,dst),g:ng});steps.push({t:'f',n:nb,fs:pq.length});}}
      }
    } else if(algo==='IDA*'){
      let thr=eu(src,dst);
      for(let iter=0;iter<20;iter++){
        let minNext=Infinity,found=false;const v=new Set([src]);
        function search(n,gn,path){
          const f=gn+eu(n,dst);if(f>thr){minNext=Math.min(minNext,f);return;}
          steps.push({t:'v',n,fs:0});
          if(n===dst){steps.push({t:'p',path:[...path,n],cost:gn});found=true;return;}
          for(const {n:nb,w} of adj(n)){if(!v.has(nb)){v.add(nb);steps.push({t:'f',n:nb,fs:0});search(nb,gn+w,[...path,n]);if(found)return;v.delete(nb);}}
        }
        search(src,0,[]);
        if(found) break;
        if(minNext===Infinity){steps.push({t:'x'});break;}
        thr=minNext;
      }
    }
    if(!steps.some(s=>s.t==='p')&&!steps.some(s=>s.t==='x')) steps.push({t:'x'});
    return steps;
  }

  return {
    init(){
      resize();buildGraph();
      document.getElementById('extra-tools').innerHTML='';
      draw();clickMode=0;addLog('Click a node to set Source → then Destination → Run','info');
      document.getElementById('ck-start').textContent=nodes[src].l;
      document.getElementById('ck-end').textContent=nodes[dst].l;
    },
    run(){
      const algo=document.getElementById('algo-sel').value;
      setPhase('running',`${algo} searching from ${nodes[src].l} to ${nodes[dst].l}...`);
      addLog(`▶ ${algo}: ${nodes[src].l} → ${nodes[dst].l}`,'info');
      visSet=new Set();frontSet=new Set();pathEdges=new Set();pathNodes=new Set();
      const steps=runAlgo();
      let vc=0,pf=0;
      animate(steps,s=>{
        if(s.t==='v'){vc++;visSet.add(s.n);frontSet.delete(s.n);setSC(vc);setPhase('visited',`Visiting node ${nodes[s.n].l} | Queue: ${s.fs}`);}
        else if(s.t==='f'){frontSet.add(s.n);if(s.fs>pf){pf=s.fs;setSC(undefined,pf);}setPhase('running',`Adding ${nodes[s.n].l} to frontier | Frontier size: ${s.fs}`);}
        else if(s.t==='p'){
          s.path.forEach((n,i)=>{if(i<s.path.length-1)pathEdges.add(ep(n,s.path[i+1]));pathNodes.add(n);});
          setSC(undefined,undefined,'Cost '+Math.round(s.cost*10)/10);
          setPhase('path',`✓ Path: ${s.path.map(n=>nodes[n].l).join('→')} | Cost: ${Math.round(s.cost*10)/10}`);
          addLog(`✓ Path: ${s.path.map(n=>nodes[n].l).join('→')} | cost: ${Math.round(s.cost*10)/10}`,'path');
          document.getElementById('ck-start').textContent=nodes[src].l;
          document.getElementById('ck-end').textContent=nodes[dst].l;
        }
        else if(s.t==='x'){setPhase('error','No path found');addLog('✗ No path found','err');}
        draw();
      });
    },
    reset(){visSet=new Set();frontSet=new Set();pathEdges=new Set();pathNodes=new Set();draw();},
    clear(){buildGraph();draw();}
  };
})();

// ════════════════════════════════════════════════════════
// ██ SEARCH TREE MODULE
// ════════════════════════════════════════════════════════
const SEARCHTREE = (()=>{
  let tNodes=[],tEdges=[],goalId=0;
  let visSet=new Set(),frontSet=new Set();

  function resize(){ const a=document.getElementById('canvas-area');cv.width=a.clientWidth-28;cv.height=a.clientHeight-28; }

  function build(){
    tNodes=[];tEdges=[];let id=0;
    const W=cv.width;
    function add(depth,par,x,y,spread){
      const nid=id++;
      tNodes.push({id:nid,x,y,depth,l:String(nid)});
      if(par!==null) tEdges.push({a:par,b:nid});
      if(depth<4&&nid<22){const ch=depth<2?3:2;for(let i=0;i<ch;i++) add(depth+1,nid,x+(i-(ch-1)/2)*spread*.8,y+80,spread*.45);}
    }
    add(0,null,W/2,55,W*.46);
    goalId=Math.min(tNodes.length-1,Math.floor(tNodes.length*.7));
    tNodes[goalId].l='G';
    visSet=new Set();frontSet=new Set();
  }

  function children(n){ return tEdges.filter(e=>e.a===n).map(e=>e.b); }

  function draw(){
    ctx.fillStyle='#07071a';ctx.fillRect(0,0,cv.width,cv.height);
    tEdges.forEach(e=>{
      const a=tNodes[e.a],b=tNodes[e.b];
      const isVis=visSet.has(e.b);
      ctx.strokeStyle=isVis?'rgba(59,130,246,.3)':'rgba(255,255,255,.06)';
      ctx.lineWidth=isVis?2:1;
      ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
    });
    tNodes.forEach(n=>{
      let fill='#0c0c22',stroke='rgba(255,255,255,.1)',glow='transparent';
      if(n.id===0){fill='#2d1a5e';stroke='#8b5cf6';glow='#8b5cf6';}
      else if(n.id===goalId){fill='#3a0a0a';stroke='#ef4444';glow='#ef4444';}
      else if(visSet.has(n.id)){fill='#071428';stroke='#3b82f6';glow='#3b82f6';}
      else if(frontSet.has(n.id)){fill='#1a1000';stroke='#f59e0b';glow='#f59e0b';}
      ctx.shadowColor=glow;ctx.shadowBlur=glow!=='transparent'?10:0;
      ctx.beginPath();ctx.arc(n.x,n.y,14,0,Math.PI*2);
      ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();
      ctx.shadowBlur=0;
      ctx.fillStyle=n.id===goalId?'#ef4444':n.id===0?'#8b5cf6':'#e8eaff';
      ctx.font='bold 10px JetBrains Mono';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(n.l,n.x,n.y);
    });
    ctx.textBaseline='alphabetic';
    ctx.fillStyle='#2e2e60';ctx.font='10px JetBrains Mono';ctx.textAlign='left';
    ctx.fillText('🟣 Start | 🔴 G = Goal | 🟡 Frontier | 🔵 Visited',12,cv.height-8);
  }

  return {
    init(){
      resize();build();
      document.getElementById('extra-tools').innerHTML=`<button class="btn" onclick="MODULES.searchtree.rebuild()">🔀 New Tree</button>`;
      draw();addLog('Node "G" is the goal. Watch how frontier expands differently per algo.','info');
    },
    rebuild(){ build();draw();addLog('New tree built','info'); },
    run(){
      const algo=document.getElementById('algo-sel').value;
      visSet=new Set();frontSet=new Set();
      setPhase('running',`${algo} exploring tree...`);
      addLog(`▶ ${algo} on search tree (goal = G)`,'info');
      const steps=[];
      if(algo==='BFS'){
        const q=[0],v=new Set([0]);
        while(q.length){
          const n=q.shift();steps.push({t:'v',n,fs:q.length,msg:`BFS visits node ${n} (level ${tNodes[n].depth}). Queue size: ${q.length}`});
          if(n===goalId){steps.push({t:'p',n,msg:`✓ Goal G found at depth ${tNodes[n].depth}!`});break;}
          children(n).forEach(c=>{if(!v.has(c)){v.add(c);q.push(c);steps.push({t:'f',n:c,fs:q.length,msg:`Adding node ${c} to queue (depth ${tNodes[c].depth})`});}});
        }
      } else if(algo==='DFS'){
        const stk=[0],v=new Set();
        while(stk.length){
          const n=stk.pop();if(v.has(n))continue;v.add(n);
          steps.push({t:'v',n,fs:stk.length,msg:`DFS dives to node ${n} (depth ${tNodes[n].depth}). Stack: ${stk.length}`});
          if(n===goalId){steps.push({t:'p',n,msg:`✓ Goal G found at depth ${tNodes[n].depth}!`});break;}
          [...children(n)].reverse().forEach(c=>{if(!v.has(c)){stk.push(c);steps.push({t:'f',n:c,fs:stk.length,msg:`Stack: push node ${c}`});}});
        }
      } else {
        const pq=[{n:0,h:Math.abs(0-goalId)}],v=new Set();
        while(pq.length){
          pq.sort((a,b)=>a.h-b.h);const {n}=pq.shift();
          if(v.has(n))continue;v.add(n);
          steps.push({t:'v',n,fs:pq.length,msg:`Best-First visits node ${n} (h=${Math.abs(n-goalId)})`});
          if(n===goalId){steps.push({t:'p',n,msg:`✓ Goal G found!`});break;}
          children(n).forEach(c=>{if(!v.has(c)){pq.push({n:c,h:Math.abs(c-goalId)});steps.push({t:'f',n:c,fs:pq.length,msg:`Adding node ${c} with h=${Math.abs(c-goalId)}`});}});
        }
      }
      if(!steps.some(s=>s.t==='p')) steps.push({t:'x',msg:'Goal not found in this tree'});
      let vc=0,pf=0;
      animate(steps,s=>{
        if(s.t==='v'){vc++;visSet.add(s.n);frontSet.delete(s.n);setSC(vc);if(s.fs>pf)setSC(undefined,s.fs);setPhase('visited',s.msg);}
        else if(s.t==='f'){frontSet.add(s.n);if(s.fs>pf){pf=s.fs;setSC(undefined,pf);}setPhase('running',s.msg);}
        else if(s.t==='p'){setSC(undefined,undefined,'Depth '+tNodes[s.n].depth);setPhase('path',s.msg);addLog(s.msg,'path');}
        else if(s.t==='x'){setPhase('error',s.msg);addLog(s.msg,'err');}
        draw();
      });
    },
    reset(){ visSet=new Set();frontSet=new Set();draw(); },
    clear(){ build();draw(); }
  };
})();

// ════════════════════════════════════════════════════════
// ██ N-QUEENS MODULE
// ════════════════════════════════════════════════════════
const NQUEENS = (()=>{
  let N=8,snaps=[],explored=0,bts=0;

  function resize(){ const a=document.getElementById('canvas-area');const sz=Math.min(a.clientWidth-28,a.clientHeight-28);cv.width=sz;cv.height=sz; }

  function safe(b,row,col){ for(let r=0;r<row;r++) if(b[r]===col||Math.abs(b[r]-col)===Math.abs(r-row)) return false; return true; }

  function solve(useFwd){
    snaps=[];explored=0;bts=0;
    const b=new Array(N).fill(-1);
    const doms=Array.from({length:N},()=>new Set(Array.from({length:N},(_,i)=>i)));
    function bt(row){
      explored++;
      if(row===N){snaps.push({b:[...b],st:'sol'});return true;}
      const dom=useFwd?[...doms[row]].sort((a,c)=>a-c):Array.from({length:N},(_,i)=>i);
      for(const col of dom){
        if(safe(b,row,col)){
          b[row]=col;snaps.push({b:[...b],row,col,st:'place',msg:`Row ${row}: Queen at col ${col}`});
          let ok=true;const backup={};
          if(useFwd){
            for(let r2=row+1;r2<N;r2++){
              backup[r2]=new Set(doms[r2]);doms[r2].delete(col);
              for(let c2=0;c2<N;c2++) if(Math.abs(col-c2)===Math.abs(row-r2)) doms[r2].delete(c2);
              if(doms[r2].size===0){ok=false;break;}
            }
          }
          if(ok&&bt(row+1)) return true;
          b[row]=-1;bts++;snaps.push({b:[...b],row,col,st:'back',msg:`Backtrack from row ${row} col ${col}`});
          if(useFwd) Object.entries(backup).forEach(([r2,d])=>{doms[r2]=d;});
        }
      }
      return false;
    }
    bt(0);
  }

  function draw(snap){
    const SZ=cv.width,CELL=SZ/N;
    ctx.fillStyle='#07071a';ctx.fillRect(0,0,SZ,SZ);
    for(let r=0;r<N;r++) for(let c=0;c<N;c++){
      ctx.fillStyle=(r+c)%2===0?'#11112e':'#0c0c22';
      ctx.fillRect(c*CELL,r*CELL,CELL,CELL);
    }
    if(!snap) return;
    snap.b.forEach((col,row)=>{
      if(col<0) return;
      const isBack=snap.st==='back'&&snap.row===row;
      const isSol=snap.st==='sol';
      // Highlight the entire row+col being attacked
      ctx.fillStyle=isBack?'rgba(239,68,68,.12)':isSol?'rgba(16,185,129,.08)':'rgba(245,158,11,.08)';
      ctx.fillRect(col*CELL,row*CELL,CELL,CELL);
      // Queen
      const fs=Math.max(10,Math.round(CELL*.58));
      ctx.font=`${fs}px serif`;ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.shadowColor=isSol?'#10b981':isBack?'#ef4444':'#f59e0b';
      ctx.shadowBlur=10;
      ctx.fillStyle=isSol?'#10b981':isBack?'#ef4444':'#f59e0b';
      ctx.fillText('♛',col*CELL+CELL/2,row*CELL+CELL/2);
      ctx.shadowBlur=0;
    });
    ctx.textBaseline='alphabetic';
    ctx.fillStyle='#2e2e60';ctx.font='9px JetBrains Mono';ctx.textAlign='left';
    ctx.fillText(`N=${N}  explored=${explored}  backtracks=${bts}`,6,SZ-5);
  }

  return {
    setN(n){ N=n;snaps=[];explored=0;bts=0;resize();draw(null);addLog(`Board: ${N}×${N}`,'info'); },
    init(){
      resize();snaps=[];explored=0;bts=0;
      document.getElementById('extra-tools').innerHTML=`
        <select class="sel" onchange="MODULES.nqueens.setN(parseInt(this.value))">
          <option value="6">6×6</option><option value="8" selected>8×8</option>
          <option value="10">10×10</option><option value="12">12×12</option>
        </select>`;
      draw(null);addLog(`${N}-Queens CSP. Amber=placing, Red=backtrack, Green=solved.`,'info');
    },
    run(){
      const algo=document.getElementById('algo-sel').value;
      setPhase('running',`Solving ${N}-Queens with ${algo}...`);
      addLog(`▶ ${algo} on ${N}-Queens`,'info');
      const t0=performance.now();
      solve(algo==='Forward Checking');
      const elapsed=Math.round(performance.now()-t0);
      setSC(explored,bts,snaps.some(s=>s.st==='sol')?'Solved':'No sol',elapsed+'ms');
      addLog(`Done: explored=${explored}, backtracks=${bts}, ${elapsed}ms`,'path');
      animate(snaps,s=>{
        draw(s);
        const cls=s.st==='back'?'err':s.st==='sol'?'path':'frontier';
        if(s.msg) setPhase(s.st==='back'?'running':'running',s.msg);
        setSC(explored,bts);
      });
    },
    reset(){ snaps=[];explored=0;bts=0;draw(null); },
    clear(){ snaps=[];explored=0;bts=0;draw(null); }
  };
})();

// ════════════════════════════════════════════════════════
// ██ MAP COLORING MODULE
// ════════════════════════════════════════════════════════
const MAPCOLOR = (()=>{
  const PALLETE=['#ef4444','#3b82f6','#f59e0b','#10b981'];
  const CNAMES=['Red','Blue','Amber','Green'];
  let snaps=[],explored=0,bts=0;

  const ROOMS=[
    {id:'A',label:'Room A',cx:115,cy:110,poly:[{x:10,y:10},{x:220,y:10},{x:220,y:210},{x:10,y:210}]},
    {id:'B',label:'Room B',cx:320,cy:90, poly:[{x:220,y:10},{x:440,y:10},{x:440,y:170},{x:220,y:170}]},
    {id:'C',label:'Room C',cx:115,cy:290,poly:[{x:10,y:210},{x:220,y:210},{x:220,y:380},{x:10,y:380}]},
    {id:'D',label:'Room D',cx:320,cy:265,poly:[{x:220,y:170},{x:440,y:170},{x:440,y:380},{x:220,y:380}]},
    {id:'E',label:'Room E',cx:530,cy:160,poly:[{x:440,y:10},{x:620,y:10},{x:620,y:310},{x:440,y:310}]},
    {id:'F',label:'Corridor',cx:200,cy:450,poly:[{x:10,y:380},{x:320,y:380},{x:320,y:510},{x:10,y:510}]},
    {id:'G',label:'Lobby',  cx:475,cy:440,poly:[{x:320,y:380},{x:620,y:380},{x:620,y:510},{x:320,y:510}]},
  ];
  const ADJ={A:['B','C'],B:['A','D','E'],C:['A','D','F'],D:['B','C','E','F','G'],E:['B','D','G'],F:['C','D','G'],G:['D','E','F']};
  const IDS=ROOMS.map(r=>r.id);

  function resize(){const a=document.getElementById('canvas-area');cv.width=a.clientWidth-28;cv.height=a.clientHeight-28;}

  function solve(useFwd){
    snaps=[];explored=0;bts=0;
    const col={},doms={};
    IDS.forEach(id=>{doms[id]=new Set([0,1,2,3]);});
    function assign(i){
      explored++;
      if(i===IDS.length){snaps.push({col:{...col},st:'sol',msg:'✓ All rooms colored!'});return true;}
      const id=IDS[i];
      const dom=useFwd?[...doms[id]]:[0,1,2,3];
      for(const c of dom){
        const ok=(ADJ[id]||[]).every(nb=>col[nb]===undefined||col[nb]!==c);
        if(ok){
          col[id]=c;snaps.push({col:{...col},cur:id,st:'place',msg:`${id}=${CNAMES[c]} — checking neighbors`});
          let valid=true;const backup={};
          if(useFwd){
            (ADJ[id]||[]).forEach(nb=>{
              if(col[nb]===undefined){backup[nb]=new Set(doms[nb]);doms[nb].delete(c);if(doms[nb].size===0)valid=false;}
            });
          }
          if(valid&&assign(i+1)) return true;
          delete col[id];bts++;snaps.push({col:{...col},cur:id,conflict:id,st:'back',msg:`Backtrack: ${id} color ${CNAMES[c]} causes conflict`});
          if(useFwd) Object.entries(backup).forEach(([nb,d])=>{doms[nb]=d;});
        }
      }
      return false;
    }
    assign(0);
  }

  function draw(snap){
    const a=document.getElementById('canvas-area');
    const scX=(a.clientWidth-28)/640,scY=(a.clientHeight-28)/530;
    const sc=Math.min(scX,scY);
    cv.width=a.clientWidth-28;cv.height=a.clientHeight-28;
    const offX=(cv.width-640*sc)/2,offY=(cv.height-530*sc)/2;
    ctx.fillStyle='#07071a';ctx.fillRect(0,0,cv.width,cv.height);
    ctx.save();ctx.translate(offX,offY);ctx.scale(sc,sc);
    const col=snap?snap.col:{};
    // Adjacency dashes
    IDS.forEach(id=>{
      const r1=ROOMS.find(r=>r.id===id);
      (ADJ[id]||[]).forEach(nb=>{
        const r2=ROOMS.find(r=>r.id===nb);
        ctx.strokeStyle='rgba(255,255,255,.06)';ctx.lineWidth=1;ctx.setLineDash([4,4]);
        ctx.beginPath();ctx.moveTo(r1.cx,r1.cy);ctx.lineTo(r2.cx,r2.cy);ctx.stroke();
        ctx.setLineDash([]);
      });
    });
    // Rooms
    ROOMS.forEach(r=>{
      const ci=col[r.id];
      const isConflict=snap&&snap.conflict===r.id;
      const isCur=snap&&snap.cur===r.id;
      ctx.fillStyle=ci!==undefined?PALLETE[ci]+'22':'#10101f';
      let stroke='rgba(255,255,255,.1)';
      if(isConflict) stroke='#ef4444';
      else if(ci!==undefined) stroke=PALLETE[ci];
      else if(isCur) stroke='#f59e0b';
      ctx.strokeStyle=stroke;ctx.lineWidth=isConflict?3:ci!==undefined?2:1;
      if(isConflict||ci!==undefined){ctx.shadowColor=stroke;ctx.shadowBlur=12;}
      ctx.beginPath();ctx.moveTo(r.poly[0].x,r.poly[0].y);
      r.poly.forEach(p=>ctx.lineTo(p.x,p.y));ctx.closePath();ctx.fill();ctx.stroke();
      ctx.shadowBlur=0;
      ctx.fillStyle=ci!==undefined?PALLETE[ci]:'#5860a0';
      ctx.font='bold 13px Syne';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(r.label,r.cx,r.cy);
      if(ci!==undefined){ctx.font='10px JetBrains Mono';ctx.fillText(CNAMES[ci],r.cx,r.cy+18);}
    });
    ctx.restore();
    // Color swatches
    PALLETE.forEach((p,i)=>{
      ctx.fillStyle=p;ctx.shadowColor=p;ctx.shadowBlur=6;
      ctx.fillRect(10+i*75,cv.height-20,12,12);ctx.shadowBlur=0;
      ctx.fillStyle='#5860a0';ctx.font='10px JetBrains Mono';ctx.textAlign='left';ctx.textBaseline='alphabetic';
      ctx.fillText(CNAMES[i],26+i*75,cv.height-10);
    });
  }

  return {
    init(){resize();snaps=[];explored=0;bts=0;document.getElementById('extra-tools').innerHTML='';draw(null);addLog('Map Coloring CSP — 7 rooms, 4 colors. Click Run.','info');},
    run(){
      const algo=document.getElementById('algo-sel').value;
      setPhase('running',`${algo} coloring rooms...`);
      addLog(`▶ ${algo} on map coloring (7 rooms, 4 colors)`,'info');
      const t0=performance.now();
      solve(algo==='Forward Checking');
      const elapsed=Math.round(performance.now()-t0);
      setSC(explored,bts,snaps.some(s=>s.st==='sol')?'Solved':'No sol',elapsed+'ms');
      addLog(`Done: explored=${explored}, bt=${bts}, ${elapsed}ms`,'path');
      animate(snaps,s=>{
        draw(s);
        if(s.msg) setPhase(s.st==='back'?'running':s.st==='sol'?'done':'running',s.msg);
        if(s.msg) addLog(s.msg,s.st==='back'?'err':s.st==='sol'?'path':'frontier');
      });
    },
    reset(){snaps=[];explored=0;bts=0;draw(null);},
    clear(){snaps=[];explored=0;bts=0;draw(null);}
  };
})();

// ════════════════════════════════════════════════════════
// ██ MODULE MAP
// ════════════════════════════════════════════════════════
const MODULES = {
  maze:         MAZE,
  missionaries: MISSIONARIES,
  tsp:          TSP,
  tictactoe:    TICTACTOE,
  graphsearch:  GRAPHSEARCH,
  searchtree:   SEARCHTREE,
  nqueens:      NQUEENS,
  mapcolor:     MAPCOLOR,
  minimax:      TICTACTOE,
};

// ════════════════════════════════════════════════════════
// ██ BOOT
// ════════════════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', ()=>{
  buildSidebar();
  switchTo('maze');
});
window.addEventListener('resize', ()=>{
  if(MODULES[CUR]&&MODULES[CUR].init) MODULES[CUR].init();
});
