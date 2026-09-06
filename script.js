const board = document.querySelector(".board");
const startBtn = document.querySelector(".start-btn");
const modal = document.querySelector(".modal");
const restartBtn = document.querySelector(".restart-btn");
const gameOver = document.querySelector(".game-over");
const startGame = document.querySelector(".start-game");
const highScoreElement = document.querySelector("#high-score");
const currentScoreElement = document.querySelector("#current-score");
const timeElement = document.querySelector("#time");
const blockHeight = 50;
const blockWidth = 50;

let highScore = Number(localStorage.getItem("highScore")) || 0;
let currentScore = 0;
let time = `00:00`;

highScoreElement.innerText = highScore;
currentScoreElement.innerText = currentScore;
timeElement.innerText = time;

const cols = Math.floor(board.clientWidth / blockWidth);
const rows = Math.floor(board.clientHeight / blockHeight);
let intervalId = null;
let timeIntervalId = null;

let food = {
  x: Math.floor(Math.random() * rows),
  y: Math.floor(Math.random() * cols),
};
const blocks = [];
let snake = [{ x: 1, y: 3 }];

let direction = "right";

// rotation angle (degrees) applied to the head block/eyes per direction
const directionAngle = {
  right: 0,
  down: 90,
  left: 180,
  up: 270,
};

for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    const block = document.createElement("div");
    block.classList.add("block");
    board.appendChild(block);
    blocks[`${row}-${col}`] = block;
  }
}

function markHead(headKey) {
  const el = blocks[headKey];
  el.classList.add("head");
  el.style.setProperty("--rot", `${directionAngle[direction]}deg`);
  el.innerHTML = `<span class="eye eye-l"></span><span class="eye eye-r"></span>`;
}

function unmarkHead(headKey) {
  const el = blocks[headKey];
  if (!el) return;
  el.classList.remove("head");
  el.innerHTML = "";
}

function render() {
  let head = null;
  let grew = false;

  blocks[`${food.x}-${food.y}`].classList.add("food");
  if (direction === "left") {
    head = { x: snake[0].x, y: snake[0].y - 1 };
  } else if (direction === "right") {
    head = { x: snake[0].x, y: snake[0].y + 1 };
  } else if (direction === "up") {
    head = { x: snake[0].x - 1, y: snake[0].y };
  } else if (direction === "down") {
    head = { x: snake[0].x + 1, y: snake[0].y };
  }
  //  wall collision logic
  if (head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols) {
    snake.forEach((segment) => {
      blocks[`${segment.x}-${segment.y}`].classList.remove("fill");
    });
    unmarkHead(`${snake[0].x}-${snake[0].y}`);
    snake.length = 0;
    snake.push({ x: 1, y: 3 });
    direction = "left";
    clearInterval(intervalId);
    clearInterval(timeIntervalId);
    modal.style.display = "flex";
    startGame.style.display = "none";
    gameOver.style.display = "flex";
    return;
  }

  // food consumption logic
  if (head.x === food.x && head.y === food.y) {
    grew = true;
    blocks[`${food.x}-${food.y}`].classList.remove("food");
    food = {
      x: Math.floor(Math.random() * rows),
      y: Math.floor(Math.random() * cols),
    };
    blocks[`${food.x}-${food.y}`].classList.add("food");
    currentScore += 10;
    currentScoreElement.innerText = currentScore;

    if (currentScore > highScore) {
      highScore = currentScore;
      highScoreElement.innerText = highScore;
      localStorage.setItem("highScore", highScore.toString());
    }
  }
  const oldHeadKey = `${snake[0].x}-${snake[0].y}`;
  snake.forEach((segment) => {
    blocks[`${segment.x}-${segment.y}`].classList.remove("fill");
  });
  unmarkHead(oldHeadKey);
  snake.unshift(head);
  if (!grew) {
    snake.pop();
  }
  snake.forEach((segment) => {
    blocks[`${segment.x}-${segment.y}`].classList.add("fill");
  });
  markHead(`${snake[0].x}-${snake[0].y}`);
}

startBtn.addEventListener("click", () => {
  modal.style.display = "none";
  blocks[`${snake[0].x}-${snake[0].y}`].classList.add("fill");
  markHead(`${snake[0].x}-${snake[0].y}`);
  intervalId = setInterval(() => {
    render();
  }, 300);
  timeIntervalId = setInterval(() => {
    let [minutes, seconds] = time.split(":").map(Number);

    if (seconds === 59) {
      minutes++;
      seconds = 0;
    } else {
      seconds++;
    }
    time = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    timeElement.innerText = time;
  }, 1000);
});

// ArrowRight, ArrowLeft, ArrowUp, ArrowDown
addEventListener("keydown", (e) => {
  if (e.key == "ArrowUp") {
    direction = "up";
  }
  if (e.key == "ArrowDown") {
    direction = "down";
  }
  if (e.key == "ArrowLeft") {
    direction = "left";
  }
  if (e.key == "ArrowRight") {
    direction = "right";
  }
});

restartBtn.addEventListener("click", restartGame);

function restartGame() {
  clearInterval(intervalId);
  clearInterval(timeIntervalId);
  blocks[`${food.x}-${food.y}`].classList.remove("food");
  snake.forEach((segment) => {
    blocks[`${segment.x}-${segment.y}`].classList.remove("fill");
  });
  unmarkHead(`${snake[0].x}-${snake[0].y}`);
  currentScore = 0;
  currentScoreElement.innerText = currentScore;
  time = `00:00`;
  timeElement.innerText = time;
  modal.style.display = "none";
  snake = [{ x: 1, y: 3 }];
  direction = "right";
  food = {
    x: Math.floor(Math.random() * rows),
    y: Math.floor(Math.random() * cols),
  };
  blocks[`${snake[0].x}-${snake[0].y}`].classList.add("fill");
  markHead(`${snake[0].x}-${snake[0].y}`);
  intervalId = setInterval(() => {
    render();
  }, 300);
}
