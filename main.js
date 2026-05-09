const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// CANVAS SETUP
canvas.width = 768;
canvas.height = 768;

ctx.imageSmoothingEnabled = true;

// CONSTANTS
const tileSize = 48;
const tileCount = canvas.width / tileSize;
const wallSize = 1;

const gameSpeed = 400;

// GAME STATE
let snake;
let dx;
let dy;
let food;
let score;

let gameRunning = false;
let gameStarted = false;

// GAME AUDIO
const bgMusic = new Audio("assets/bgm.mp3");
const eatSound = new Audio("assets/eat.mp3");
const gameOverSound = new Audio("assets/over.mp3");

bgMusic.loop = true;
bgMusic.volume = 0.5;

// INITIALIZE GAME
function init() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];

  dx = 1;
  dy = 0;

  score = 0;

  gameRunning = true;

  spawnFood();
}

// FOOD
function spawnFood() {
  let validPosition = false;

  while (!validPosition) {
    food = {
      x: Math.floor(Math.random() * (tileCount - wallSize * 2)) + wallSize,
      y: Math.floor(Math.random() * (tileCount - wallSize * 2)) + wallSize,
    };

    validPosition = true;

    for (let segment of snake) {
      if (segment.x === food.x && segment.y === food.y) {
        validPosition = false;
        break;
      }
    }
  }
}

// UPDATE GAME
function update() {
  const head = {
    x: snake[0].x + dx,
    y: snake[0].y + dy,
  };

  // Border wall collision
  if (
    head.x < wallSize ||
    head.y < wallSize ||
    head.x >= tileCount - wallSize ||
    head.y >= tileCount - wallSize
  ) {
    gameOver();
    return;
  }

  // Self collision
  for (let segment of snake) {
    if (segment.x === head.x && segment.y === head.y) {
      gameOver();
      return;
    }
  }

  snake.unshift(head);

  // Eat food
  if (head.x === food.x && head.y === food.y) {
    score++;

    // Play eat sound
    eatSound.currentTime = 0;
    eatSound.play();

    spawnFood();
  } else {
    snake.pop();
  }
}

// DRAW GAME
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawGrass();
  drawWalls();
  drawFood();
  drawSnake();
  drawScore();
}

// DRAW GROUND
function drawGrass() {
  for (let y = 0; y < tileCount; y++) {
    for (let x = 0; x < tileCount; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? "#aad751" : "#a2d149";

      ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
    }
  }
}

// DRAW WALLS
function drawWalls() {
  for (let y = 0; y < tileCount; y++) {
    for (let x = 0; x < tileCount; x++) {
      const isWall =
        x === 0 || y === 0 || x === tileCount - 1 || y === tileCount - 1;

      if (!isWall) continue;

      const px = x * tileSize;
      const py = y * tileSize;

      // Main stone
      ctx.fillStyle = "#7a7f87";

      ctx.beginPath();
      ctx.roundRect(px, py, tileSize, tileSize, 8);
      ctx.fill();

      // Inner detail
      ctx.fillStyle = "#9aa0a8";

      ctx.beginPath();
      ctx.roundRect(px + 4, py + 4, tileSize - 8, tileSize - 8, 6);
      ctx.fill();

      // Top highlight
      ctx.fillStyle = "rgba(255,255,255,0.18)";

      ctx.fillRect(px + 6, py + 6, tileSize - 12, 4);

      // Bottom shadow
      ctx.fillStyle = "rgba(0,0,0,0.28)";

      ctx.fillRect(px + 4, py + tileSize - 8, tileSize - 8, 4);

      // Border
      ctx.strokeStyle = "rgba(0,0,0,0.2)";
      ctx.lineWidth = 2;

      ctx.strokeRect(px + 1, py + 1, tileSize - 2, tileSize - 2);
    }
  }
}

// DRAW FOOD
function drawFood() {
  const x = food.x * tileSize + tileSize / 2;
  const y = food.y * tileSize + tileSize / 2;

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.beginPath();
  ctx.ellipse(x + 2, y + 5, 14, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Main egg gradient
  const eggGradient = ctx.createLinearGradient(x, y - 20, x, y + 20);
  eggGradient.addColorStop(0, "#ffffff");
  eggGradient.addColorStop(1, "#ece4d8");

  ctx.fillStyle = eggGradient;

  // Egg shape
  ctx.beginPath();
  ctx.ellipse(x, y, 18, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Border
  ctx.strokeStyle = "#d8cec2";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Inner soft detail
  ctx.fillStyle = "#f7f2eb";

  ctx.beginPath();
  ctx.ellipse(x, y + 1, 9, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  // Top shine
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.beginPath();
  ctx.ellipse(x - 5, y - 8, 4, 7, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Small side shine
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.beginPath();
  ctx.ellipse(x + 5, y + 4, 2, 4, 0.2, 0, Math.PI * 2);
  ctx.fill();
}

// DRAW SNAKE
function drawSnake() {
  snake.forEach((segment, index) => {
    const x = segment.x * tileSize;
    const y = segment.y * tileSize;

    // HEAD
    if (index === 0) {
      // Head
      ctx.fillStyle = "#3cb043";

      ctx.beginPath();

      ctx.roundRect(x, y, tileSize, tileSize, 12);

      ctx.fill();

      // Belly detail
      ctx.fillStyle = "#67c96b";

      ctx.beginPath();

      ctx.roundRect(x + 8, y + 8, tileSize - 16, tileSize - 16, 8);

      ctx.fill();

      // Eyes
      ctx.fillStyle = "#1a1a1a";

      let eye1X, eye1Y, eye2X, eye2Y;

      // RIGHT
      if (dx === 1) {
        eye1X = x + 34;
        eye1Y = y + 14;

        eye2X = x + 34;
        eye2Y = y + 34;
      }

      // LEFT
      else if (dx === -1) {
        eye1X = x + 14;
        eye1Y = y + 14;

        eye2X = x + 14;
        eye2Y = y + 34;
      }

      // UP
      else if (dy === -1) {
        eye1X = x + 14;
        eye1Y = y + 14;

        eye2X = x + 34;
        eye2Y = y + 14;
      }

      // DOWN
      else {
        eye1X = x + 14;
        eye1Y = y + 34;

        eye2X = x + 34;
        eye2Y = y + 34;
      }

      ctx.beginPath();

      ctx.arc(eye1X, eye1Y, 4, 0, Math.PI * 2);

      ctx.arc(eye2X, eye2Y, 4, 0, Math.PI * 2);

      ctx.fill();

      // Eye shine
      ctx.fillStyle = "white";

      ctx.beginPath();

      ctx.arc(eye1X - 1, eye1Y - 1, 1.2, 0, Math.PI * 2);

      ctx.arc(eye2X - 1, eye2Y - 1, 1.2, 0, Math.PI * 2);

      ctx.fill();

      // Tongue
      ctx.strokeStyle = "#ff4d6d";
      ctx.lineWidth = 2;

      ctx.beginPath();

      // RIGHT
      if (dx === 1) {
        ctx.moveTo(x + tileSize, y + tileSize / 2);
        ctx.lineTo(x + tileSize + 10, y + tileSize / 2);

        ctx.moveTo(x + tileSize + 10, y + tileSize / 2);
        ctx.lineTo(x + tileSize + 14, y + tileSize / 2 - 4);

        ctx.moveTo(x + tileSize + 10, y + tileSize / 2);
        ctx.lineTo(x + tileSize + 14, y + tileSize / 2 + 4);
      }

      // LEFT
      else if (dx === -1) {
        ctx.moveTo(x, y + tileSize / 2);
        ctx.lineTo(x - 10, y + tileSize / 2);

        ctx.moveTo(x - 10, y + tileSize / 2);
        ctx.lineTo(x - 14, y + tileSize / 2 - 4);

        ctx.moveTo(x - 10, y + tileSize / 2);
        ctx.lineTo(x - 14, y + tileSize / 2 + 4);
      }

      // UP
      else if (dy === -1) {
        ctx.moveTo(x + tileSize / 2, y);
        ctx.lineTo(x + tileSize / 2, y - 10);

        ctx.moveTo(x + tileSize / 2, y - 10);
        ctx.lineTo(x + tileSize / 2 - 4, y - 14);

        ctx.moveTo(x + tileSize / 2, y - 10);
        ctx.lineTo(x + tileSize / 2 + 4, y - 14);
      }

      // DOWN
      else {
        ctx.moveTo(x + tileSize / 2, y + tileSize);
        ctx.lineTo(x + tileSize / 2, y + tileSize + 10);

        ctx.moveTo(x + tileSize / 2, y + tileSize + 10);
        ctx.lineTo(x + tileSize / 2 - 4, y + tileSize + 14);

        ctx.moveTo(x + tileSize / 2, y + tileSize + 10);
        ctx.lineTo(x + tileSize / 2 + 4, y + tileSize + 14);
      }

      ctx.stroke();
    }

    // BODY
    else {
      // Body
      ctx.fillStyle = "#3cb043";

      ctx.beginPath();

      ctx.roundRect(x + 2, y + 2, tileSize - 4, tileSize - 4, 10);

      ctx.fill();

      // Belly detail
      ctx.fillStyle = "#67c96b";

      ctx.beginPath();

      ctx.roundRect(x + 10, y + 10, tileSize - 20, tileSize - 20, 6);

      ctx.fill();
    }
  });
}

// DRAW SCORE
function drawScore() {
  ctx.fillStyle = "rgba(255,255,255,0.75)";

  ctx.font = "32px 'Luckiest Guy'";

  ctx.textAlign = "center";

  ctx.fillText("Score : " + score, canvas.width / 2, 35);
}

// OVERLAY SCREEN
function drawOverlayScreen(title, buttonText, subText = "") {
  // Dark overlay
  ctx.fillStyle = "rgba(0,0,0,0.5)";

  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Title
  ctx.fillStyle = "white";

  ctx.font = "96px 'Luckiest Guy'";

  ctx.textAlign = "center";

  ctx.fillText(title, canvas.width / 2, canvas.height / 2);

  // Sub text
  if (subText) {
    ctx.font = "48px 'Luckiest Guy'";

    ctx.fillText(subText, canvas.width / 2, canvas.height / 2 - 100);
  }

  // Button
  ctx.fillStyle = "#3cb043";

  ctx.beginPath();

  ctx.roundRect(canvas.width / 2 - 100, canvas.height / 2 + 40, 200, 60, 10);

  ctx.fill();

  // Button text
  ctx.fillStyle = "white";

  ctx.font = "48px 'Luckiest Guy'";

  ctx.fillText(buttonText, canvas.width / 2, canvas.height / 2 + 90);
}

// START SCREEN
function drawStartScreen() {
  drawGrass();

  drawOverlayScreen("Snake Game", "START");
}

// GAME OVER
function gameOver() {
  gameRunning = false;

  // Stop background music
  bgMusic.pause();
  bgMusic.currentTime = 0;

  // Play game over sound
  gameOverSound.currentTime = 0;
  gameOverSound.play();

  draw();

  drawOverlayScreen("Game Over", "RESTART", "Score : " + score);
}

// GAME LOOP
function gameLoop() {
  if (!gameRunning) {
    gameOver();
    return;
  }

  update();

  draw();

  setTimeout(gameLoop, gameSpeed);
}

// BTN HOVER
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();

  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const mouseX = (e.clientX - rect.left) * scaleX;
  const mouseY = (e.clientY - rect.top) * scaleY;

  const btnX = canvas.width / 2 - 100;
  const btnY = canvas.height / 2 + 40;
  const btnWidth = 200;
  const btnHeight = 60;

  const hoveringButton =
    mouseX >= btnX &&
    mouseX <= btnX + btnWidth &&
    mouseY >= btnY &&
    mouseY <= btnY + btnHeight;

  canvas.style.cursor = hoveringButton ? "pointer" : "default";
});

// CANVAS CLICK
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();

  // Convert CSS size -> canvas size
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const mouseX = (e.clientX - rect.left) * scaleX;

  const mouseY = (e.clientY - rect.top) * scaleY;

  // Start / Restart button area
  const btnX = canvas.width / 2 - 100;
  const btnY = canvas.height / 2 + 40;
  const btnWidth = 200;
  const btnHeight = 60;

  // ONLY button click
  const clickedButton =
    mouseX >= btnX &&
    mouseX <= btnX + btnWidth &&
    mouseY >= btnY &&
    mouseY <= btnY + btnHeight;

  // Ignore outside clicks
  if (!clickedButton) {
    return;
  }

  // START GAME
  if (!gameStarted) {
    gameStarted = true;

    bgMusic.currentTime = 0;
    bgMusic.play();

    init();

    document.fonts.ready.then(() => {
      draw();
      gameLoop();
    });

    return;
  }

  // RESTART GAME
  if (!gameRunning) {
    bgMusic.currentTime = 0;
    bgMusic.play();

    init();

    document.fonts.ready.then(() => {
      draw();
      gameLoop();
    });
  }
});

// KEYBOARD CONTROLS
document.addEventListener("keydown", (e) => {
  if (!gameStarted || !gameRunning) return;

  const key = e.key.toLowerCase();

  // UP
  if ((key === "arrowup" || key === "w") && dy !== 1) {
    dx = 0;
    dy = -1;
  }

  // DOWN
  else if ((key === "arrowdown" || key === "s") && dy !== -1) {
    dx = 0;
    dy = 1;
  }

  // LEFT
  else if ((key === "arrowleft" || key === "a") && dx !== 1) {
    dx = -1;
    dy = 0;
  }

  // RIGHT
  else if ((key === "arrowright" || key === "d") && dx !== -1) {
    dx = 1;
    dy = 0;
  }
});

// MOBILE CONTROLS
document.getElementById("up").addEventListener("touchstart", () => {
  if (dy !== 1) {
    dx = 0;
    dy = -1;
  }
});

document.getElementById("down").addEventListener("touchstart", () => {
  if (dy !== -1) {
    dx = 0;
    dy = 1;
  }
});

document.getElementById("left").addEventListener("touchstart", () => {
  if (dx !== 1) {
    dx = -1;
    dy = 0;
  }
});

document.getElementById("right").addEventListener("touchstart", () => {
  if (dx !== -1) {
    dx = 1;
    dy = 0;
  }
});

// INITIAL SCREEN
document.fonts.ready.then(() => {
  drawStartScreen();
});
