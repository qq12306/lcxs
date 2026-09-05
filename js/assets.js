const PALETTE = {
  ink: '#1A1A1A',
  green: '#2E5A32',
  light: '#6FA26F',
  cream: '#E0E0C0',
  soil: '#4A3526',
};

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('无法加载 ' + src));
    img.src = src;
  });
}

async function loadCharacterAssets() {
  const res = await fetch('assets/character/meta.json');
  const meta = await res.json();
  const sheets = {};
  for (const key of Object.keys(meta)) {
    sheets[key] = await loadImage('assets/character/' + key + '_sheet.png');
  }
  return { meta, sheets };
}

const AUX_PATHS = {
  sky: 'assets/bg/bg_sky.png',
  forest: 'assets/bg/bg_forest_far.png',
  ground: 'assets/ground/ground_tile.png',
  spike: 'assets/obstacles/obstacle_spike.png',
  stump: 'assets/obstacles/obstacle_stump.png',
  slime: 'assets/enemies/enemy_slime.png',
  slash: 'assets/fx/fx_slash.png',
  heart: 'assets/ui/ui_heart.png',
};

async function loadAuxAssets() {
  const out = {};
  const entries = Object.entries(AUX_PATHS);
  await Promise.all(entries.map(async ([key, path]) => {
    out[key] = await loadImage(path);
  }));
  return out;
}
