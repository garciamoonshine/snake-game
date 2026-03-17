// Snake Game - Enhanced Phase 2
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GRID_SIZE = 20;
const TILE_COUNT = canvas.width / GRID_SIZE;

const SKINS = {
  classic:  { head: '#4ecca3', body: 'rgba(78,204,163,{a})', food: '#e84393', glow: 'rgba(232,67,147,0.3)' },
  fire:     { head: '#ff6b35', body: 'rgba(255,107,53,{a})',  food: '#ffd700', glow: 'rgba(255,215,0,0.3)' },
  ice:      { head: '#00d4ff', body: 'rgba(0,212,255,{a})',   food: '#ffffff', glow: 'rgba(255,255,255,0.3)' },
  neon:     { head: '#ff00ff', body: 'rgba(255,0,255,{a})',   food: '#00ff00', glow: 'rgba(0,255,0,0.3)' },
  gold:     { head: '#ffd700', body: 'rgba(255,215,0,{a})',   food: '#ff4500', glow: 'rgba(255,69,0,0.3)' }
};

let activeSkin = 'classic';
let snake, food, goldenFood, direction, score, highScore, level, speed, gameLoop, isPaused, isGameOver;
let goldenFoodTimer = null;
let combo = 0;
let lastFoodTime = 0;

function initGame() {
  snake = [{ x: 10, y: 10 }];
  food = generateFood();
  goldenFood = null;
  direction = { x: 1, y: 0 };
  score = 0;
  level = 1;
  speed = 150;
  isPaused = false;
  isGameOver = false;
  combo = 0;
  highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
  clearTimeout(goldenFoodTimer);
  spawnGoldenFoodDelayed();
  updateScoreBoard();
}

function spawnGoldenFoodDelayed() {
  const delay = 8000 + Math.random() * 12000;
  goldenFoodTimer = setTimeout(() => {
    if (!isGameOver && !isPaused) {
      goldenFood = generateFood(true);
      setTimeout(() => { goldenFood = null; spawnGoldenFoodDelayed(); }, 5000);
    } else {
      spawnGoldenFoodDelayed();
    }
  }, delay);
}

function generateFood(isGolden = false) {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * TILE_COUNT),
      y: Math.floor(Math.random() * TILE_COUNT)
    };
  } while (
    snake.some(s => s.x === pos.x && s.y === pos.y) ||
    (food && pos.x === food.x && pos.y === food.y)
  );
  return pos;
}

function updateScoreBoard() {
  document.getElementById('score').textContent = score;
  document.getElementById('high-score').textContent = highScore;
  document.getElementById('level').textContent = level;
  const comboEl = document.getElementById('combo');
  if (comboEl) comboEl.textContent = combo > 1 ? `x${combo} COMBO!` : '';
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawFood();
  if (goldenFood) drawGoldenFood();
  drawSnake();
}

function drawGrid() {
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  for (let i = 0; i <= TILE_COUNT; i++) {
    ctx.beginPath(); ctx.moveTo(i * GRID_SIZE, 0); ctx.lineTo(i * GRID_SIZE, canvas.height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * GRID_SIZE); ctx.lineTo(canvas.width, i * GRID_SIZE); ctx.stroke();
  }
}

function drawSnake() {
  const skin = SKINS[activeSkin];
  snake.forEach((seg, i) => {
    const alpha = 1 - (i / snake.length) * 0.5;
    ctx.fillStyle = i === 0 ? skin.head : skin.body.replace('{a}', alpha);
    ctx.beginPath();
    ctx.roundRect(seg.x * GRID_SIZE + 1, seg.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2, 4);
    ctx.fill();
  });
}

function drawFood() {
  const skin = SKINS[activeSkin];
  ctx.fillStyle = skin.food;
  ctx.beginPath();
  ctx.arc(food.x * GRID_SIZE + GRID_SIZE/2, food.y * GRID_SIZE + GRID_SIZE/2, GRID_SIZE/2 - 2, 0, Math.PI*2);
  ctx.fill();
  ctx.fillStyle = skin.glow;
  ctx.beginPath();
  ctx.arc(food.x * GRID_SIZE + GRID_SIZE/2, food.y * GRID_SIZE + GRID_SIZE/2, GRID_SIZE/2 + 2, 0, Math.PI*2);
  ctx.fill();
}

function drawGoldenFood() {
  const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 200);
  ctx.fillStyle = `rgba(255,215,0,${0.7 + 0.3 * pulse})`;
  ctx.beginPath();
  ctx.arc(goldenFood.x * GRID_SIZE + GRID_SIZE/2, goldenFood.y * GRID_SIZE + GRID_SIZE/2, GRID_SIZE/2 - 1, 0, Math.PI*2);
  ctx.fill();
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(goldenFood.x * GRID_SIZE + GRID_SIZE/2, goldenFood.y * GRID_SIZE + GRID_SIZE/2, GRID_SIZE/2 + 3, 0, Math.PI*2);
  ctx.stroke();
  // Star symbol
  ctx.fillStyle = '#fff';
  ctx.font = `${GRID_SIZE - 6}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('★', goldenFood.x * GRID_SIZE + GRID_SIZE/2, goldenFood.y * GRID_SIZE + GRID_SIZE/2);
}

function update() {
  if (isPaused || isGameOver) return;
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
  if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) return endGame();
  if (snake.some(s => s.x === head.x && s.y === head.y)) return endGame();
  snake.unshift(head);
  const now = Date.now();
  let ate = false;
  if (head.x === food.x && head.y === food.y) {
    const timeDiff = now - lastFoodTime;
    if (lastFoodTime > 0 && timeDiff < 3000) combo++; else combo = 1;
    lastFoodTime = now;
    score += 10 * level * combo;
    if (score > highScore) { highScore = score; localStorage.setItem('snakeHighScore', highScore); }
    if (score % 100 === 0) { level++; speed = Math.max(60, speed - 15); restartLoop(); }
    food = generateFood();
    ate = true;
  } else if (goldenFood && head.x === goldenFood.x && head.y === goldenFood.y) {
    score += 50 * level;
    if (score > highScore) { highScore = score; localStorage.setItem('snakeHighScore', highScore); }
    goldenFood = null;
    spawnGoldenFoodDelayed();
    ate = true;
    showFloatingText('⭐ +' + (50 * level), head.x * GRID_SIZE, head.y * GRID_SIZE);
  }
  if (!ate) snake.pop();
  updateScoreBoard();
  draw();
}

function showFloatingText(text, x, y) {
  const el = document.createElement('div');
  el.textContent = text;
  el.style.cssText = `position:absolute;left:${x + canvas.offsetLeft}px;top:${y + canvas.offsetTop}px;color:#ffd700;font-weight:bold;font-size:14px;pointer-events:none;animation:floatUp 1s ease-out forwards;z-index:100;`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

function endGame() {
  isGameOver = true;
  clearInterval(gameLoop);
  clearTimeout(goldenFoodTimer);
  document.getElementById('final-score').textContent = score;
  document.getElementById('game-over-modal').classList.remove('hidden');
  document.getElementById('restartBtn').disabled = false;
  document.getElementById('pauseBtn').disabled = true;
}

function restartLoop() {
  clearInterval(gameLoop);
  gameLoop = setInterval(update, speed);
}

// Skin selector
document.querySelectorAll('.skin-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    activeSkin = btn.dataset.skin;
    document.querySelectorAll('.skin-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    localStorage.setItem('snakeSkin', activeSkin);
    draw();
  });
});

const savedSkin = localStorage.getItem('snakeSkin');
if (savedSkin && SKINS[savedSkin]) {
  activeSkin = savedSkin;
  document.querySelector(`[data-skin="${savedSkin}"]`)?.classList.add('active');
}

document.getElementById('startBtn').addEventListener('click', () => {
  initGame(); draw();
  gameLoop = setInterval(update, speed);
  document.getElementById('startBtn').disabled = true;
  document.getElementById('pauseBtn').disabled = false;
  document.getElementById('restartBtn').disabled = false;
});

document.getElementById('pauseBtn').addEventListener('click', () => {
  isPaused = !isPaused;
  document.getElementById('pauseBtn').textContent = isPaused ? 'Resume' : 'Pause';
});

document.getElementById('restartBtn').addEventListener('click', () => {
  clearInterval(gameLoop);
  document.getElementById('game-over-modal').classList.add('hidden');
  initGame(); draw();
  gameLoop = setInterval(update, speed);
  document.getElementById('pauseBtn').disabled = false;
  document.getElementById('pauseBtn').textContent = 'Pause';
});

document.getElementById('playAgainBtn').addEventListener('click', () => {
  document.getElementById('restartBtn').click();
});

document.addEventListener('keydown', (e) => {
  const keys = {
    ArrowUp:{x:0,y:-1}, ArrowDown:{x:0,y:1},
    ArrowLeft:{x:-1,y:0}, ArrowRight:{x:1,y:0},
    w:{x:0,y:-1}, s:{x:0,y:1}, a:{x:-1,y:0}, d:{x:1,y:0}
  };
  if (keys[e.key]) {
    const d = keys[e.key];
    if (d.x !== -direction.x || d.y !== -direction.y) direction = d;
    e.preventDefault();
  }
});

initGame();
draw();
