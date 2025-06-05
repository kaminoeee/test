const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// プレイヤー設定
const player = {
  x: canvas.width / 2 - 20,
  y: canvas.height - 50,
  w: 40,
  h: 20,
  speed: 5,
  color: "#4caf50",
  bullets: [],
  alive: true,
  cooldown: 0
};

// CPU設定
const cpu = {
  x: canvas.width / 2 - 20,
  y: 30,
  w: 40,
  h: 20,
  speed: 3,
  color: "#e91e63",
  bullets: [],
  alive: true,
  dir: 1,
  cooldown: 0
};

let leftPressed = false;
let rightPressed = false;
let spacePressed = false;
let gameover = false;
let winner = null;

// キー操作
document.addEventListener("keydown", (e) => {
  if (e.code === "ArrowLeft") leftPressed = true;
  if (e.code === "ArrowRight") rightPressed = true;
  if (e.code === "Space") spacePressed = true;
});
document.addEventListener("keyup", (e) => {
  if (e.code === "ArrowLeft") leftPressed = false;
  if (e.code === "ArrowRight") rightPressed = false;
  if (e.code === "Space") spacePressed = false;
});

// 弾の描画
function drawBullets(bullets, color) {
  ctx.fillStyle = color;
  bullets.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));
}

// 弾の移動
function updateBullets(bullets, dir) {
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].y += bullets[i].speed * dir;
    if (bullets[i].y < 0 || bullets[i].y > canvas.height) {
      bullets.splice(i, 1);
    }
  }
}

// 衝突判定
function checkCollision(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

// ゲームループ
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // プレイヤー操作
  if (!gameover && player.alive) {
    if (leftPressed && player.x > 0) player.x -= player.speed;
    if (rightPressed && player.x + player.w < canvas.width) player.x += player.speed;
    if (spacePressed && player.cooldown === 0) {
      player.bullets.push({ x: player.x + player.w / 2 - 2, y: player.y, w: 4, h: 12, speed: 8 });
      player.cooldown = 15;
    }
    if (player.cooldown > 0) player.cooldown--;
  }

  // CPU自動移動・発射
  if (!gameover && cpu.alive) {
    cpu.x += cpu.speed * cpu.dir;
    if (cpu.x <= 0 || cpu.x + cpu.w >= canvas.width) cpu.dir *= -1;
    if (cpu.cooldown === 0) {
      cpu.bullets.push({ x: cpu.x + cpu.w / 2 - 2, y: cpu.y + cpu.h, w: 4, h: 12, speed: 6 });
      cpu.cooldown = Math.floor(Math.random() * 60) + 30; // ランダム発射
    }
    if (cpu.cooldown > 0) cpu.cooldown--;
  }

  // 弾更新
  updateBullets(player.bullets, -1); // 上へ
  updateBullets(cpu.bullets, 1);     // 下へ

  // 弾と敵の当たり判定
  for (let i = player.bullets.length - 1; i >= 0; i--) {
    if (checkCollision(player.bullets[i], cpu)) {
      cpu.alive = false;
      winner = "あなた";
      gameover = true;
      player.bullets.splice(i, 1);
      break;
    }
  }
  for (let i = cpu.bullets.length - 1; i >= 0; i--) {
    if (checkCollision(cpu.bullets[i], player)) {
      player.alive = false;
      winner = "CPU";
      gameover = true;
      cpu.bullets.splice(i, 1);
      break;
    }
  }

  // キャラ描画
  if (player.alive) {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.w, player.h);
  }
  if (cpu.alive) {
    ctx.fillStyle = cpu.color;
    ctx.fillRect(cpu.x, cpu.y, cpu.w, cpu.h);
  }

  // 弾描画
  drawBullets(player.bullets, "#fff");
  drawBullets(cpu.bullets, "#ffeb3b");

  // ゲームオーバー表示
  if (gameover) {
    ctx.font = "32px sans-serif";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText(winner + " の勝ち！", canvas.width / 2, canvas.height / 2);
    ctx.font = "18px sans-serif";
    ctx.fillText("F5でリトライ", canvas.width / 2, canvas.height / 2 + 40);
  } else {
    requestAnimationFrame(loop);
  }
}

// スタート
loop();