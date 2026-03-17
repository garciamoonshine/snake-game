// Pollinations AI Image Integration
const POLLINATIONS_TOKEN = 'sk_XAwK4NoIzJVceQNqn1SG22oDgJPkkMYA';
const POLLINATIONS_BASE = 'https://image.pollinations.ai/prompt/';

function getPollinationsUrl(prompt, width = 400, height = 400, seed = null) {
  const encoded = encodeURIComponent(prompt);
  let url = `${POLLINATIONS_BASE}${encoded}?width=${width}&height=${height}&nologo=true&token=${POLLINATIONS_TOKEN}`;
  if (seed !== null) url += `&seed=${seed}`;
  return url;
}

async function loadPollinationsImage(prompt, width = 400, height = 400, seed = null) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Pollinations image load failed'));
    img.src = getPollinationsUrl(prompt, width, height, seed);
  });
}

// Preload a set of background themes using Pollinations
const skinPrompts = {
  classic: 'lush green pixel art jungle, retro game background, dark forest',
  fire:    'volcanic lava landscape, pixel art fire world, dark dramatic lighting',
  ice:     'frozen arctic tundra, pixel art ice world, blue glowing crystals',
  neon:    'cyberpunk neon city, pixel art synthwave city, purple pink lights',
  gold:    'golden temple ruins, pixel art treasure dungeon, glowing gold coins'
};

const skinImages = {};

async function preloadSkinBackgrounds() {
  for (const [skin, prompt] of Object.entries(skinPrompts)) {
    try {
      skinImages[skin] = await loadPollinationsImage(prompt, 400, 400, 42);
      console.log(`[Pollinations] Loaded background for skin: ${skin}`);
    } catch (e) {
      console.warn(`[Pollinations] Failed to load skin: ${skin}`, e);
    }
  }
}

async function loadGameOverArt(score, skin) {
  const prompt = `game over screen, defeated pixel art snake, score ${score}, ${skin} theme, dramatic lighting, small icon art`;
  try {
    return await loadPollinationsImage(prompt, 200, 200, score);
  } catch (e) {
    return null;
  }
}

// Start preloading on script load
preloadSkinBackgrounds();
