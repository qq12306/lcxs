'use strict';

const VW = 1280, VH = 720, GROUND = 600;
const P_HEIGHT = 160;
const ATTACK_MS = 1920;
const HIT_START = 260;
const HIT_END = 1480;

const SPRITE_BOXES = {
  spike: { x: 217, y: 224, w: 581, h: 577 },
  stump: { x: 103, y: 285, w: 810, h: 471 },
  slime: { x: 132, y: 155, w: 728, h: 749 },
  slash: { x: 114, y: 102, w: 751, h: 826 },
  heart: { x: 178, y: 228, w: 668, h: 570 },
};

const SPRITE_DRAW = {
  spike: { h: 96 },
  stump: { h: 78 },
  slime: { h: 104 },
};

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let chars = null;
let sheets = null;
let tex = null;
let sprites = null;

let mode = 'menu';
let paused = false;

let tNow = 0;

let player = null;
let obstacles = [];
let enemies = [];
let particles = [];
let travel = 0;
let meters = 0;
let kills = 0;
let score = 0;
let speed = 0;
const baseSpeed = 300;
let nextSpawnAt = 0;
let clouds = [];
let best = Number(localStorage.getItem('groveSprintBest') || 0);
let tutorialShown = false;

const keys = { left: false, right: false };

function rand(a, b) { return a + Math.random() * (b - a); }

function scaleFor(state) {
  return P_HEIGHT / chars[state].cellH;
}

function playerState() {
  if (mode !== 'play') return 'idle';
  if (player.attack) return 'attack';
  return 'run';
}

function fit() {
  const r = VW / VH;
  let w = window.innerWidth;
  let h = w / r;
  if (h > window.innerHeight) {
    h = window.innerHeight;
    w = h * r;
  }
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
}

/* ---------- asset prep ---------- */

function makeClouds() {
  clouds = [];
  for (let i = 0; i < 4; i++) {
    const cy = 90 + (i % 2) * 70 + 20;
    const cl = 200 + i * 260 + i * 40;
    clouds.push({ x: cl, y: cy, r: 34 + i * 8 });
  }
}

function cropSprite(img, box) {
  const c = document.createElement('canvas');
  c.width = box.w;
  c.height = box.h;
  c.getContext('2d').drawImage(img, box.x, box.y, box.w, box.h, 0, 0, box.w, box.h);
  return c;
}

function buildGroundTile() {
  const c = document.createElement('canvas');
  c.width = VW;
  c.height = VH - GROUND;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = true;
  g.drawImage(tex.ground, 0, 510, 1536, 120, 0, 0, c.width, c.height);
  return c;
}

function buildAssets() {
  sprites = {};
  for (const key of Object.keys(SPRITE_BOXES)) {
    const src = {
      spike: tex.spike,
      stump: tex.stump,
      slime: tex.slime,
      slash: tex.slash,
      heart: tex.heart,
    }[key];
    sprites[key] = cropSprite(src, SPRITE_BOXES[key]);
  }
  groundTile = buildGroundTile();
  makeClouds();
}

let groundTile = null;

/* ---------- input ---------- */

const menuEl = document.getElementById('menu');
const overEl = document.getElementById('gameover');
const menuBestEl = document.getElementById('menu-best');
const goScoreEl = document.getElementById('go-score');
const goDistEl = document.getElementById('go-dist');
const goKillsEl = document.getElementById('go-kills');
const goBestEl = document.getElementById('go-best');
const toastEl = document.getElementById('toast');

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.remove('hidden');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toastEl.classList.add('hidden'), 1400);
}

function resetGame() {
  player = {
    x: 260,
    feet: GROUND,
    vy: 0,
    air: false,
    attack: false,
    atkStart: 0,
    invuln: 0,
    hp: 3,
  };
  obstacles = [];
  enemies = [];
  particles = [];
  travel = 0;
  meters = 0;
  kills = 0;
  score = 0;
  speed = baseSpeed;
  nextSpawnAt = 320;
  tutorialShown = false;
}

function startGame() {
  resetGame();
  mode = 'play';
  menuEl.classList.add('hidden');
  overEl.classList.add('hidden');
}

function gameOver() {
  mode = 'over';
  if (score > best) {
    best = score;
    localStorage.setItem('groveSprintBest', String(best));
  }
  goScoreEl.textContent = String(score);
  goDistEl.textContent = String(meters);
  goKillsEl.textContent = String(kills);
  goBestEl.textContent = '最高分 ' + best;
  overEl.classList.remove('hidden');
}

function bindInput() {
  document.getElementById('btn-start').addEventListener('click', startGame);
  document.getElementById('btn-again').addEventListener('click', startGame);

  window.addEventListener('resize', fit);

  window.addEventListener('keydown', (e) => {
    const k = e.key;
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', ' '].includes(k)) e.preventDefault();
    if (k === 'ArrowLeft') keys.left = true;
    if (k === 'ArrowRight') keys.right = true;
    if (!e.repeat && (k === 'ArrowUp' || k === ' ')) {
      if (mode === 'menu') startGame();
      else if (mode === 'over') startGame();
      else if (mode === 'play' && player && !player.air && !player.attack) {
        player.vy = -920;
        player.air = true;
      }
    }
    if ((k === 'x' || k === 'X' || k === 'j' || k === 'J') && !e.repeat && mode === 'play' && player && !paused && !player.attack) {
      player.attack = true;
      player.atkStart = tNow;
    }
    if (k === 'p' || k === 'P') {
      if (mode === 'play') paused = !paused;
    }
    if ((k === 'r' || k === 'R') && mode === 'play' && paused) {
      startGame();
      paused = false;
    }
  });
  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 'ArrowRight') keys.right = false;
  });
}

/* ---------- spawn ---------- */

function pickSpawnType() {
  const r = Math.random();
  if (r < 0.42) return 'slime';
  if (r < 0.74) return 'spike';
  return 'stump';
}

function updateSpawns() {
  if (travel >= nextSpawnAt) {
    const type = pickSpawnType();
    const gap = rand(380, 700) * (1 - Math.min(0.35, travel / 70000));
    nextSpawnAt = travel + gap;
    if (type === 'slime') {
      enemies.push({
        x: VW + 60,
        top: SPRITE_DRAW.slime.h,
        phase: Math.random() * 10,
        dead: false,
        hitT: -1,
      });
    } else if (type === 'spike') {
      obstacles.push({ kind: 'spike', x: VW + 40, top: SPRITE_DRAW.spike.h - 8 });
    } else {
      obstacles.push({ kind: 'stump', x: VW + 60, top: SPRITE_DRAW.stump.h - 6 });
    }
  }
}

/* ---------- update ---------- */

function applyDamage() {
  if (player.invuln > 0) return;
  player.hp -= 1;
  player.invuln = 1.3;
  showToast('受到伤害！');
  if (player.hp <= 0) {
    player.hp = 0;
    player.attack = false;
    gameOver();
  }
}

function updatePlayer(dt) {
  if (mode !== 'play') {
    player.feet = GROUND;
    player.vy = 0;
    player.air = false;
    return;
  }
  const mv = 340;
  if (keys.left) player.x -= mv * dt;
  if (keys.right) player.x += mv * dt;
  player.x = Math.max(60, Math.min(VW - 90, player.x));

  if (player.invuln > 0) player.invuln -= dt;

  if (player.attack) {
    const el = tNow - player.atkStart;
    if (el >= ATTACK_MS) player.attack = false;
  } else if (player.air) {
    player.vy += 2600 * dt;
    player.feet += player.vy * dt;
    if (player.feet >= GROUND) {
      player.feet = GROUND;
      player.vy = 0;
      player.air = false;
    }
  }
}

function updateObstacles(dt) {
  const dx = speed * dt;
  for (const o of obstacles) {
    o.x -= dx;
    if (mode === 'play' && !o.done) {
      if (o.x + 18 > player.x - 24 && o.x - 18 < player.x + 24) {
        if (player.feet > GROUND - o.top + 6) {
          o.done = true;
          applyDamage();
        }
      }
    }
  }
  obstacles = obstacles.filter((o) => o.x > -90);
}

function updateEnemies(dt) {
  for (const en of enemies) {
    if (en.dead) continue;
    en.x -= (speed + 46) * dt;

    if (mode !== 'play') continue;
    const inSwing = player.attack &&
      tNow - player.atkStart >= HIT_START &&
      tNow - player.atkStart <= HIT_END;
    if (inSwing && en.x > player.x + 6 && en.x < player.x + 205) {
      en.hitT = tNow;
      en.dead = true;
      kills += 1;
      burst(en.x, player.feet - en.top, 10);
      continue;
    }
    const touching = en.x > player.x - 22 && en.x < player.x + 22 &&
      player.feet > GROUND - en.top + 10;
    if (touching) {
      applyDamage();
      en.hitT = tNow;
      en.dead = true;
      burst(en.x, player.feet - en.top, 6);
    }
  }
  enemies = enemies.filter((e) =>
    (e.x > -100 || e.dead) && (!e.dead || tNow - e.hitT < 260));
}

function burst(x, y, n) {
  for (let i = 0; i < n; i++) {
    particles.push({
      x, y,
      vx: rand(-160, 160),
      vy: rand(-220, -20),
      g: 700,
      life: rand(0.35, 0.8),
      age: 0,
      r: rand(3, 7),
      color: Math.random() > 0.5 ? '#6FA26F' : '#E0E0C0',
    });
  }
}

function updateParticles(dt) {
  for (const p of particles) {
    p.age += dt;
    p.x += p.vx * dt;
    p.vy += p.g * dt;
    p.y += p.vy * dt;
  }
  particles = particles.filter((p) => p.age < p.life);
}

function update(dt) {
  if (paused) return;
  tNow += dt * 1000;

  if (mode === 'play') {
    speed = Math.min(baseSpeed + travel * 0.012, 560);
    travel += speed * dt;
    const newMeters = Math.floor(travel / 48);
    if (newMeters > meters) meters = newMeters;
    score = Math.floor(travel / 48) + kills * 60;

    if (travel > 900 && !tutorialShown) {
      tutorialShown = true;
      showToast('按 X 挥砍击败墨绿小怪');
    }

    updateSpawns();
    updatePlayer(dt);
    updateObstacles(dt);
    updateEnemies(dt);
    updateParticles(dt);
  } else if (mode === 'menu' || mode === 'over') {
    player = player || { x: VW / 2, feet: GROUND, vy: 0, air: false, attack: false, invuln: 0, hp: 3 };
    if (mode === 'menu') player.x = VW / 2;
    player.feet = GROUND;
    updateParticles(dt);
  }
}

/* ---------- render ---------- */

function drawPlayer() {
  if (!player) return;
  const state = playerState();
  const meta = chars[state];
  const s = scaleFor(state);
  const cellW = meta.cellW;
  const cellH = meta.cellH;
  let frame;
  if (state === 'attack') {
    frame = Math.floor((tNow - player.atkStart) / meta.frameMs) % meta.frames;
    if (frame < 0) frame = 0;
  } else {
    frame = Math.floor(tNow / meta.frameMs) % meta.frames;
  }
  const dw = cellW * s;
  const dh = cellH * s;
  const dx = player.x - dw / 2;
  const dy = player.feet - dh + 2;

  ctx.save();
  if (player.invuln > 0 && mode === 'play') {
    if (Math.floor(tNow / 90) % 2 === 0) ctx.globalAlpha = 0.35;
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(sheets[state], frame * cellW, 0, cellW, cellH, dx, dy, dw, dh);
  ctx.restore();
}

function drawAttackSlash() {
  if (!player || !player.attack || mode !== 'play') return;
  const el = tNow - player.atkStart;
  if (el < HIT_START - 90 || el > HIT_END + 240) return;
  const prog = Math.min(1, el / HIT_END);
  const fade = el > HIT_END ? 1 - (el - HIT_END) / 240 : 1;
  const s = 0.6 + prog * 0.45;
  const dw = 340 * s;
  const dh = 340 * (SPRITE_BOXES.slash.h / SPRITE_BOXES.slash.w) * s;
  const cx = player.x + 150;
  const cy = player.feet - 110;
  ctx.save();
  ctx.globalAlpha = 0.9 * fade;
  ctx.drawImage(sprites.slash, cx - dw / 2, cy - dh / 2, dw, dh);
  ctx.restore();
}

function drawObstacles() {
  for (const o of obstacles) {
    const by = GROUND;
    if (o.kind === 'spike') {
      const spr = sprites.spike;
      const h = SPRITE_DRAW.spike.h;
      const scale = h / spr.height;
      const w = spr.width * scale;
      ctx.drawImage(spr, o.x - w / 2, by - h, w, h);
    } else {
      const spr = sprites.stump;
      const h = SPRITE_DRAW.stump.h;
      const scale = h / spr.height;
      const w = spr.width * scale;
      ctx.drawImage(spr, o.x - w / 2, by - h, w, h);
    }
  }
}

function drawEnemy(e) {
  if (e.dead && tNow - e.hitT > 260) return;
  const spr = sprites.slime;
  const h = e.top;
  const scale = h / spr.height;
  const w = spr.width * scale;
  const bob = Math.sin(tNow / 300 + e.phase) * 4;
  const cx = e.x;
  const dy = GROUND - h + bob;
  ctx.save();
  if (e.dead) ctx.globalAlpha = 0.5;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(spr, cx - w / 2, dy, w, h);
  ctx.restore();
}

function drawParticles() {
  for (const p of particles) {
    ctx.globalAlpha = 1 - p.age / p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawBackdrop() {
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(tex.sky, 0, 0, VW, VH);
}

function drawClouds() {
  for (const cl of clouds) {
    const cx = ((cl.x - travel * 0.03) % (VW + 300) + VW + 300) % (VW + 300) - 150;
    ctx.fillStyle = 'rgba(224,224,192,0.16)';
    ctx.beginPath();
    ctx.ellipse(cx, cl.y, cl.r * 2.1, cl.r * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + cl.r, cl.y - cl.r * 0.5, cl.r, cl.r * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawForest() {
  const img = tex.forest;
  const H = 535;
  const W = H * (img.width / img.height);
  const off = -((travel * 0.12) % W);
  ctx.imageSmoothingEnabled = true;
  for (let x = off; x < VW; x += W) {
    ctx.drawImage(img, x, GROUND - H, W, H);
  }
}

function drawGround() {
  const ox = -(travel % groundTile.width);
  ctx.drawImage(groundTile, ox, GROUND);
  ctx.drawImage(groundTile, ox + groundTile.width, GROUND);
}

function drawHud() {
  if (mode === 'play') {
    ctx.font = 'bold 32px "Segoe UI", sans-serif';
    ctx.textAlign = 'right';
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'rgba(26,26,26,0.85)';
    ctx.strokeText(String(score), VW - 28, 58);
    ctx.fillStyle = '#E0E0C0';
    ctx.fillText(String(score), VW - 28, 58);
    ctx.font = 'bold 18px "Segoe UI", sans-serif';
    ctx.fillStyle = 'rgba(224,224,192,0.8)';
    ctx.fillText(meters + ' m', VW - 30, 88);
    ctx.fillText('击杀 ' + kills, VW - 30, 112);
    ctx.textAlign = 'left';
  }

  if (mode !== 'menu') {
    const spr = sprites.heart;
    const dh = 44;
    const dw = dh * (spr.width / spr.height);
    for (let i = 0; i < 3; i++) {
      ctx.save();
      if (i >= player.hp) ctx.globalAlpha = 0.28;
      ctx.drawImage(spr, 24 + i * (dw + 12), 22, dw, dh);
      ctx.restore();
    }
  }
}

function render() {
  ctx.clearRect(0, 0, VW, VH);
  drawBackdrop();
  drawClouds();
  drawForest();
  drawGround();

  if (mode === 'play' || mode === 'over') {
    for (const o of obstacles) drawObstacles();
    for (const e of enemies) drawEnemy(e);
  }
  drawPlayer();
  if (mode === 'play') drawAttackSlash();
  drawParticles();
  drawHud();

  if (paused && mode === 'play') {
    ctx.fillStyle = 'rgba(13,20,15,0.5)';
    ctx.fillRect(0, 0, VW, VH);
    ctx.font = 'bold 52px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#E0E0C0';
    ctx.fillText('已暂停', VW / 2, VH / 2 - 10);
    ctx.font = '20px "Segoe UI", sans-serif';
    ctx.fillText('按 P 继续 · 按 R 重新开始', VW / 2, VH / 2 + 30);
  }
}

/* ---------- loop ---------- */

let last = performance.now();

function frame(now) {
  let dt = (now - last) / 1000;
  last = now;
  if (dt > 0.05) dt = 0.05;
  update(dt);
  render();
  requestAnimationFrame(frame);
}

async function boot() {
  fit();
  bindInput();
  menuBestEl.textContent = '最高分 ' + best;
  try {
    const loaded = await loadCharacterAssets();
    sheets = loaded.sheets;
    chars = loaded.meta;
    tex = await loadAuxAssets();
    buildAssets();
  } catch (err) {
    menuEl.innerHTML = '<div class="panel"><h2 class="title small">素材加载失败</h2><p>' + err.message + '</p></div>';
    return;
  }
  player = { x: VW / 2, feet: GROUND, vy: 0, air: false, attack: false, invuln: 0, hp: 3 };
  requestAnimationFrame(frame);
}

boot();
