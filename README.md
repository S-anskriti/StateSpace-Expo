# StateSpace Expo

> AI Search Algorithm Visualizer — Interactive web app covering Units 1, 2, 3 of your AI course.

## 🚀 Deploy to Vercel (Step-by-Step)

### Step 1 — Create a GitHub Repository

1. Go to **https://github.com/new**
2. Name it `statespace-expo`
3. Set it to **Public**
4. Click **Create repository**
5. Copy the repo URL (e.g. `https://github.com/YOUR_USERNAME/statespace-expo.git`)

---

### Step 2 — Push your code

Open your terminal and run these commands one by one:

```bash
# Go into your project folder
cd statespace-expo

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - StateSpace Expo"

# Connect to GitHub (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/statespace-expo.git

# Push
git branch -M main
git push -u origin main
```

---

### Step 3 — Deploy on Vercel

1. Go to **https://vercel.com** and sign in with GitHub
2. Click **"Add New Project"**
3. Find `statespace-expo` in your repo list and click **Import**
4. Leave all settings as default
5. Click **Deploy**
6. ✅ Done! Vercel gives you a live URL like `statespace-expo.vercel.app`

---

### Step 4 — Auto-deploy on every push

From now on, every time you push to GitHub, Vercel automatically redeploys:

```bash
git add .
git commit -m "Update"
git push
```

---

## 🗂 File Structure

```
statespace-expo/
├── index.html      ← Main HTML + layout + CSS
├── app.js          ← All algorithm logic + canvas rendering
├── vercel.json     ← Vercel deployment config
└── README.md       ← This file
```

## 🎨 Color System

| Color | Hex | Meaning |
|-------|-----|---------|
| 🟣 Purple | `#8b5cf6` | Start node |
| 🔴 Red | `#ef4444` | Goal node |
| 🟡 Amber | `#f59e0b` | Frontier (currently considering) |
| 🔵 Blue | `#3b82f6` | Visited (already explored) |
| 🟢 Emerald | `#10b981` | Path (solution found) |

## 📚 Algorithms Covered

### Unit 1 — Intro to AI
- **Maze**: BFS, DFS, A\*, Greedy, UCS
- **Missionaries & Cannibals**: BFS, DFS
- **Traveling Salesman**: Greedy Nearest Neighbor
- **Tic-Tac-Toe**: Minimax, Alpha-Beta

### Unit 2 — Search Algorithms
- **Graph Search**: BFS, DFS, Dijkstra, A\*, DLS, IDA\*
- **Search Tree**: BFS, DFS, Best-First

### Unit 3 — Adversarial & CSP
- **N-Queens**: Backtracking, Forward Checking
- **Map Coloring**: Backtracking, Forward Checking
- **Minimax / Alpha-Beta**: Full game tree visualization
