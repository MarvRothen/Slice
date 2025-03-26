
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let bottles = [];
let hits = [];
let lives = 3;
let score = 0;
let gameOver = false;
let win = false;

const bier = new Image();
bier.src = 'bierflasche.png';

const wasser = new Image();
wasser.src = 'wasserflasche.png';

const boss = new Image();
boss.src = 'endgegner.png';

const hitSound = new Audio('hit.mp3');

canvas.addEventListener('click', (e) => {
  if (gameOver || win) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  for (let i = bottles.length - 1; i >= 0; i--) {
    let b = bottles[i];
    if (x > b.x && x < b.x + b.w && y > b.y && y < b.y + b.h) {
      if (b.type === 'bier') {
        score++;
        hits.push({ x: b.x + 20, y: b.y, opacity: 1.0 });
        hitSound.currentTime = 0;
        hitSound.play();
        if (score >= 1995) {
          win = true;
          document.getElementById('winScreen').style.display = 'flex';
        }
      } else if (b.type === 'wasser') {
        lives--;
        if (lives <= 0) {
          gameOver = true;
          document.getElementById('gameOverScreen').style.display = 'flex';
        }
      } else if (b.type === 'endgegner') {
        score = 0;
      }
      bottles.splice(i, 1);
    }
  }
});

function spawnBottle() {
  if (gameOver || win) return;
  let typeChance = Math.random();
  let type = 'bier';
  if (typeChance > 0.7) type = 'wasser';
  if (typeChance > 0.85) type = 'endgegner';

  let edge = Math.floor(Math.random() * 4); // 0=bottom, 1=top, 2=left, 3=right
  let startX = 0, startY = 0, vx = 0, vy = 0;
  const speed = Math.random() * 5 + 4;

  switch (edge) {
    case 0:
      startX = Math.random() * canvas.width;
      startY = canvas.height + 50;
      vx = (Math.random() - 0.5) * 6;
      vy = -speed;
      break;
    case 1:
      startX = Math.random() * canvas.width;
      startY = -50;
      vx = (Math.random() - 0.5) * 6;
      vy = speed;
      break;
    case 2:
      startX = -50;
      startY = Math.random() * canvas.height;
      vx = speed;
      vy = (Math.random() - 0.5) * 6;
      break;
    case 3:
      startX = canvas.width + 50;
      startY = Math.random() * canvas.height;
      vx = -speed;
      vy = (Math.random() - 0.5) * 6;
      break;
  }

  const size = type === 'endgegner' ? [80, 160] : type === 'bier' ? [75, 180] : [65, 150];

  bottles.push({
    x: startX,
    y: startY,
    vx: vx,
    vy: vy,
    w: size[0],
    h: size[1],
    type: type
  });

  setTimeout(spawnBottle, 500);
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = bottles.length - 1; i >= 0; i--) {
    let b = bottles[i];
    b.x += b.vx;
    b.y += b.vy;

    if (b.y > canvas.height + 200 || b.y + b.h < -200 || b.x + b.w < -200 || b.x > canvas.width + 200) {
      bottles.splice(i, 1);
      continue;
    }

    let img = bier;
    if (b.type === 'wasser') img = wasser;
    if (b.type === 'endgegner') img = boss;
    ctx.drawImage(img, b.x, b.y, b.w, b.h);
  }

  for (let i = hits.length - 1; i >= 0; i--) {
    const h = hits[i];
    ctx.globalAlpha = h.opacity;
    ctx.fillStyle = "#00ff00";
    ctx.font = "bold 28px Arial";
    ctx.fillText("+1", h.x, h.y);
    ctx.globalAlpha = 1.0;
    h.y -= 1;
    h.opacity -= 0.03;
    if (h.opacity <= 0) hits.splice(i, 1);
  }

  ctx.font = "bold 26px sans-serif";
  ctx.strokeStyle = "black";
  ctx.lineWidth = 4;
  ctx.strokeText("Punkte: " + score, 10, 40);
  ctx.strokeText("Leben: " + lives, 10, 70);
  ctx.fillStyle = "white";
  ctx.fillText("Punkte: " + score, 10, 40);
  ctx.fillText("Leben: " + lives, 10, 70);

  requestAnimationFrame(update);
}

spawnBottle();
update();
