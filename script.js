const APP_WIDTH = 640;
const APP_HEIGHT = 320;
const TARGET_AMOUNT = 30; // make divisible by 5 or mad
let moveRight = false;
let moveLeft = false;
let isBallSent = false;
let spaceClick = false;
let frames = 4;
const TARGET_HEIGHT = 10;
const TARGET_WIDTH = 50;
const targetArr = [];
const PLAYER_STEP = 2;
const PARTICLE_AMOUNT = 20;
const PARTICLE_WIDTH = 10;
const PARTICLE_HEIGHT = 10;
let ballBackToPlayer = false;
let target_hit = 0;
let picked_color = {};

let app = new PIXI.Application({
  width: APP_WIDTH,
  height: APP_HEIGHT,
  backgroundColor: 0x141313,
});

document.getElementById("game").appendChild(app.view);

// creating player
let player = new PIXI.Sprite.from(PIXI.Texture.WHITE);
player.width = 80;
player.height = 10;
player.tint = 0xde3249;
player.x = APP_WIDTH / 2 - player.width / 2;
player.y = APP_HEIGHT - player.height - 10;

app.stage.addChild(player);

// creating ball
let ball = new PIXI.Sprite.from(PIXI.Texture.WHITE);
ball.tint = 0xffffff;
ball.width = 15;
ball.height = 15;
ball.x = player.x + player.width / 2 - ball.width / 2;
ball.y = player.y - ball.height;
ball.dy = -1;

app.stage.addChild(ball);

// creating targets
let targetCountX = 0;
let targetCountY = 0;
for (let j = 0; j < TARGET_AMOUNT; j++) {
  targetCountX++;
  if (j % 10 == 0) {
    picked_color = {
      r: getRndInteger(40, 255),
      g: getRndInteger(40, 255),
      b: getRndInteger(40, 255),
    };
    targetCountX = 0;
    targetCountY++;
  }
  let str = `0x${rgbToHex(picked_color.r, picked_color.g, picked_color.b)}`;

  let target = new PIXI.Sprite.from(PIXI.Texture.WHITE);
  target.tint = str;
  target.width = TARGET_WIDTH;
  target.height = TARGET_HEIGHT;
  target.x = 60 * targetCountX + APP_WIDTH / 2 - player.width * 3.75;
  target.y = 30 * targetCountY;
  target.sign = uuidv4();
  targetArr.push({ x: target.x, y: target.y, sign: target.sign, str: str });
  app.stage.addChild(target);
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

let x = setInterval(() => {
  game();
}, frames);

window.addEventListener("keydown", (e) => {
  if (e.key == "ArrowRight") {
    moveRight = true;
  }
  if (e.key == "ArrowLeft") {
    moveLeft = true;
  }
  if (e.key == " " && !spaceClick) {
    isBallSent = true;
    if (moveRight) {
      ball.dx = 1;
    } else if (moveLeft) {
      ball.dx = -1;
    } else {
      ball.dx = 0;
    }

    spaceClick = true;
  }
});

window.addEventListener("keyup", (e) => {
  if (e.key == "ArrowRight") {
    moveRight = false;
  }
  if (e.key == "ArrowLeft") {
    moveLeft = false;
  }
});

function game() {
  checkPlayerHitSide();
  ballHitPlayer();
  if (!ballBackToPlayer) {
    playerMove();
  }
  ballHitWall();
  checkBallHitTarget();
  moveParticle();

  // move ball
  if (spaceClick) {
    ball.x += ball.dx;
    ball.y += ball.dy;
  }
}

function ballHitPlayer() {
  if (ballBackToPlayer) {
    if (ball.y < player.y - player.height * 1.4) {
      ballBackToPlayer = false;
      spaceClick = false;
      isBallSent = false;
    }
    return;
  }
  if (ball.y > player.y - ball.height) {
    // ball same line as player
    if (
      ball.x + ball.width / 2 >= player.x - 10 &&
      ball.x + ball.width / 2 < player.x + player.width / 3
    ) {
      // ball hit left hand side of player
      ball.dy *= -1;
      ball.dx = -1;
    } else if (
      ball.x + ball.width / 2 > player.x + player.width / 3 &&
      ball.x + ball.width / 2 < player.x + 2 * (player.width / 3)
    ) {
      // ball hit center of player
      ball.dy *= -1;
      ball.dx = 0;
    } else if (
      ball.x + ball.width / 2 >= player.x + 2 * (player.width / 3) &&
      ball.x + ball.width / 2 <= player.x + player.width + 10
    ) {
      //ball hit right hand side of player
      ball.dy *= -1;
      ball.dx = 1;
    }
  }
}

function checkPlayerHitSide() {
  if (player.x + player.width < 0) {
    player.x = APP_WIDTH;
    if (!spaceClick)
      // have to move ball as well
      ball.x = APP_WIDTH + player.width / 2 - ball.width / 2;
  }

  if (player.x > APP_WIDTH) {
    player.x = -player.width;
    if (!spaceClick)
      // have to move ball as well
      ball.x = -player.width / 2 - ball.width / 2;
  }
}

function playerMove() {
  if (moveRight) {
    if (!isBallSent) ball.x += PLAYER_STEP;
    player.x += PLAYER_STEP;
  }
  if (moveLeft) {
    if (!isBallSent) ball.x -= PLAYER_STEP;
    player.x -= PLAYER_STEP;
  }
}
function ballHitWall() {
  if (ball.x >= APP_WIDTH - ball.width || ball.x <= 0) {
    ball.dx *= -1;
  }

  if (ball.y <= 0) ball.dy *= -1;

  if (ball.y - ball.height >= APP_HEIGHT) {
    ball.x = player.x + player.width / 2 - ball.width / 2;
    ball.dx = 0;
    ball.dy = -1;
    ballBackToPlayer = true;
  }
}

function checkBallHitTarget() {
  for (let i = 0; i < targetArr.length; i++) {
    // check if top of ball hit target
    if (
      ball.y == targetArr[i].y + TARGET_HEIGHT &&
      ball.x + ball.width / 2 > targetArr[i].x - 10 &&
      ball.x + ball.width / 2 < targetArr[i].x + TARGET_WIDTH + 10
    ) {
      handleBallHitTarget(targetArr[i], i);
      return;
    }

    // check if top of ball hit target
    if (
      ball.y == targetArr[i].y - TARGET_HEIGHT &&
      ball.x + ball.width / 2 > targetArr[i].x - 10 &&
      ball.x + ball.width / 2 < targetArr[i].x + TARGET_WIDTH + 10
    ) {
      handleBallHitTarget(targetArr[i], i);
      return;
    }
  }
}

function handleBallHitTarget(target, i) {
  target_hit++;
  if (target_hit == TARGET_AMOUNT) {
    setTimeout(() => {
      document.getElementById("status").style.display = "block";
      document.getElementById("status").innerHTML = "You've won!";
      clearInterval(x);
      setTimeout(() => {
        location.reload();
      }, 1000);
    }, 1000);
  }
  removeTarget(targetArr[i].sign);
  targetArr.splice(i, 1);
  ball.dy *= -1;

  let spawnX = target.x + TARGET_WIDTH / 2 - PARTICLE_WIDTH / 2;
  let spawnY = target.y + TARGET_HEIGHT / 2 - PARTICLE_HEIGHT / 2;

  for (let i = 0; i < PARTICLE_AMOUNT; i++) {
    let particle = new PIXI.Sprite.from(PIXI.Texture.WHITE);
    particle.tint = target.str;
    particle.width = PARTICLE_WIDTH;
    particle.height = PARTICLE_HEIGHT;
    particle.x = spawnX;
    particle.y = spawnY;
    particle.sign = "PARTICLE";
    particle.dx = Math.floor(Math.random() * (5 + 5 + 1)) - 5;
    particle.dy = Math.floor(Math.random() * (5 + 5 + 1)) - 5;
    while (particle.dx == 0 || particle.dy == 0) {
      particle.dx = Math.floor(Math.random() * (5 + 5 + 1)) - 5;
      particle.dy = Math.floor(Math.random() * (5 + 5 + 1)) - 5;
    }
    app.stage.addChild(particle);
  }
}

function removeTarget(sign) {
  for (let i = 0; i < app.stage.children.length; i++) {
    if (app.stage.children[i].sign == sign) {
      app.stage.children.splice(i, 1);
    }
  }
}

function moveParticle() {
  for (let i = 0; i < app.stage.children.length; i++) {
    if (app.stage.children[i].sign == "PARTICLE") {
      app.stage.children[i].x += app.stage.children[i].dx;
      app.stage.children[i].y += app.stage.children[i].dy;
      if (app.stage.children[i].x < 0 || app.stage.children[i].x > APP_WIDTH)
        return app.stage.children.splice(i, 1);

      if (app.stage.children[i].y < 0 || app.stage.children[i].y > APP_HEIGHT)
        return app.stage.children.splice(i, 1);
    }
  }
}

function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
