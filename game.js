// Snake Game - Main Logic
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GRID_SIZE = 20;
const TILE_COUNT = canvas.width / GRID_SIZE;

let snake, food, direction, score, highScore, level, speed, gameLoop, isPaused, isGameOver;

function initGame() {
  snake = [{ x: 10, y: 10 }];
  food = generateFood();
  direction = { x: 1, y: 0 };
  score = 0;
  level = 1;
  speed = 150;
  isPaused = false;
  isGameOver = false;
  highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
  updateScoreBoard();
}

function generateFood() {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * TILE_COUNT),
      y: Math.floor(Math.random() * TILE_COUNT)
    };
  } while (snake.some(s => s.x === pos.x && s.y === pos.y));
  return pos;
}

function updateScoreBoard() {
  document.getElementById('score').textContent = score;
  document.getElementById('high-score').textContent = highScore;
  document.getElementById('level').textContent = level;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawFood();
  drawSnake();
}

function drawGrid() {
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  for (let i = 0; i <= TILE_COUNT; i++) {
    ctx.beginPath();
    ctx.moveTo(i * GRID_SIZE, 0);
    ctx.lineTo(i * GRID_SIZE, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * GRID_SIZE);
    ctx.lineTo(canvas.width, i * GRID_SIZE);
    ctx.stroke();
  }
}

function drawSnake() {
  snake.forEach((seg, i) => {
    const alpha = 1 - (i / snake.length) * 0.5;
    ctx.fillStyle = i === 0 ? '#4ecca3' : `rgba(78,204,163,${alpha})`;
    ctx.beginPath();
    ctx.roundRect(seg.x * GRID_SIZE + 1, seg.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2, 4);
    ctx.fill();
  });
}

function drawFood() {
  ctx.fillStyle = '#e84393';
  ctx.beginPath();
  ctx.arc(
    food.x * GRID_SIZE + GRID_SIZE / 2,
    food.y * GRID_SIZE + GRID_SIZE / 2,
    GRID_SIZE / 2 - 2, 0, Math.PI * 2
  );
  ctx.fill();
  ctx.fillStyle = 'rgba(232,67,147,0.3)';
  ctx.beginPath();
  ctx.arc(
    food.x * GRID_SIZE + GRID_SIZE / 2,
    food.y * GRID_SIZE + GRID_SIZE / 2,
    GRID_SIZE / 2 + 2, 0, Math.PI * 2
  );
  ctx.fill();
}

function update() {
  if (isPaused || isGameOver) return;
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
  if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) return endGame();
  if (snake.some(s => s.x === head.x && s.y === head.y)) return endGame();
  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score += 10 * level;
    if (score > highScore) { highScore = score; localStorage.setItem('snakeHighScore', highScore); }
    if (score % 100 === 0) { level++; speed = Math.max(60, speed - 15); restartLoop(); }
    food = generateFood();
  } else {
    snake.pop();
  }
  updateScoreBoard();
  draw();
}

function endGame() {
  isGameOver = true;
  clearInterval(gameLoop);
  document.getElementById('final-score').textContent = score;
  document.getElementById('game-over-modal').classList.remove('hidden');
  document.getElementById('restartBtn').disabled = false;
  document.getElementById('pauseBtn').disabled = true;
}

function restartLoop() {
  clearInterval(gameLoop);
  gameLoop = setInterval(update, speed);
}

document.getElementById('startBtn').addEventListener('click', () => {
  initGame();
  draw();
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
  initGame();
  draw();
  gameLoop = setInterval(update, speed);
  document.getElementById('pauseBtn').disabled = false;
  document.getElementById('pauseBtn').textContent = 'Pause';
});

document.getElementById('playAgainBtn').addEventListener('click', () => {
  document.getElementById('restartBtn').click();
});

document.addEventListener('keydown', (e) => {
  const keys = {
    ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
    w: { x: 0, y: -1 }, s: { x: 0, y: 1 },
    a: { x: -1, y: 0 }, d: { x: 1, y: 0 }
  };
  if (keys[e.key]) {
    const d = keys[e.key];
    if (d.x !== -direction.x || d.y !== -direction.y) direction = d;
    e.preventDefault();
  }
});

initGame();
draw();
