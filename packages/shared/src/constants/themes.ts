/**
 * Portrait theme registry — single source of truth for web + api.
 * Slugs are stable identifiers; never rename a slug after launch.
 * `prompt` must contain "img" — PhotoMaker trigger word.
 */

export interface Theme {
  slug: string;
  name: string;
  category: 'classic' | 'nature' | 'fantasy' | 'seasonal' | 'artistic' | 'adventure' | 'cultural';
  free: boolean;
  prompt: string;
  negativePrompt: string;
  /** PhotoMaker style_name param */
  style: string;
  /** Preview image URL shown in theme picker */
  previewUrl?: string;
}

const NEG =
  'blurry, deformed, ugly, low quality, bad anatomy, distorted face, extra limbs, watermark';

const UNS = (id: string): string =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=400&q=80`;

export const THEMES: Theme[] = [
  // Classic Studio
  {
    slug: 'studio-white',
    name: 'Studio White',
    category: 'classic',
    free: true,
    prompt: 'A professional studio portrait photo of img, white background, soft diffused lighting, sharp focus, photorealistic',
    negativePrompt: NEG,
    style: 'Photographic (Default)',
    previewUrl: UNS('photo-1694231664712-91e992b4d4a8'),
  },
  {
    slug: 'dramatic-light',
    name: 'Dramatic Light',
    category: 'classic',
    free: true,
    prompt: 'A dramatic cinematic portrait of img, strong directional Rembrandt lighting, dark moody background, film grain, photorealistic',
    negativePrompt: NEG,
    style: 'Cinematic',
    previewUrl: UNS('photo-1552788960-65fcafe071a5'),
  },
  {
    slug: 'vintage-film',
    name: 'Vintage Film',
    category: 'classic',
    free: true,
    prompt: 'A vintage film photography portrait of img, warm amber tones, soft grain, retro 1970s aesthetic, photorealistic',
    negativePrompt: NEG,
    style: 'Photographic (Default)',
    previewUrl: UNS('photo-1610901128906-f87956df174f'),
  },
  // Nature & Floral
  {
    slug: 'spring-blossom',
    name: 'Spring Blossom',
    category: 'nature',
    free: true,
    prompt: 'A portrait of img surrounded by pink cherry blossom flowers, soft natural light, dreamy bokeh background, photorealistic',
    negativePrompt: NEG,
    style: 'Photographic (Default)',
    previewUrl: UNS('photo-1455479398897-44fbcd9d77df'),
  },
  {
    slug: 'wildflower',
    name: 'Wildflower Field',
    category: 'nature',
    free: false,
    prompt: 'A whimsical portrait of img in a field of colourful wildflowers, golden hour light, soft bokeh, photorealistic',
    negativePrompt: NEG,
    style: 'Photographic (Default)',
    previewUrl: UNS('photo-1624953505153-163c862bd51d'),
  },
  {
    slug: 'forest-fairy',
    name: 'Forest Fairy',
    category: 'nature',
    free: false,
    prompt: 'A magical forest fairy portrait of img, enchanted woodland, fairy lights, mystical glowing atmosphere, fantasy art',
    negativePrompt: NEG,
    style: 'Fantasy art',
    previewUrl: UNS('photo-1638965050821-42ca42dc50ac'),
  },
  {
    slug: 'garden-morning',
    name: 'Garden Morning',
    category: 'nature',
    free: false,
    prompt: 'A morning garden portrait of img, dewy roses, golden hour sunlight, shallow depth of field, photorealistic',
    negativePrompt: NEG,
    style: 'Photographic (Default)',
    previewUrl: UNS('photo-1683322752840-afdf3c18c405'),
  },
  // Fantasy & Whimsy
  {
    slug: 'cloud-kingdom',
    name: 'Cloud Kingdom',
    category: 'fantasy',
    free: true,
    prompt: 'A fantasy portrait of img floating in a cloud kingdom above the clouds, ethereal pastel sky, dreamy and magical, digital art',
    negativePrompt: NEG,
    style: 'Fantasy art',
    previewUrl: UNS('photo-1669901529844-87aa91967b46'),
  },
  {
    slug: 'stardust',
    name: 'Stardust Dreams',
    category: 'fantasy',
    free: false,
    prompt: 'A magical cosmic portrait of img surrounded by glowing stars and golden stardust, nebula background, fantasy digital art',
    negativePrompt: NEG,
    style: 'Digital Art',
    previewUrl: UNS('photo-1505851543971-19811a8f4c21'),
  },
  {
    slug: 'rainbow-magic',
    name: 'Rainbow Magic',
    category: 'fantasy',
    free: false,
    prompt: 'A joyful magical portrait of img with rainbow colours and sparkling fairy dust, bright and enchanting, fantasy art',
    negativePrompt: NEG,
    style: 'Fantasy art',
    previewUrl: UNS('photo-1639966195692-9303b8344ca3'),
  },
  {
    slug: 'moonlit-wonder',
    name: 'Moonlit Wonder',
    category: 'fantasy',
    free: false,
    prompt: 'A beautiful portrait of img under a large glowing full moon, silver moonlight, fairy tale atmosphere, fantasy digital art',
    negativePrompt: NEG,
    style: 'Fantasy art',
    previewUrl: UNS('photo-1690576639880-e572eed7994d'),
  },
  // Seasonal
  {
    slug: 'winter-wonder',
    name: 'Winter Wonderland',
    category: 'seasonal',
    free: false,
    prompt: 'A magical winter portrait of img in a snowy wonderland, snowflakes, icy crystals, warm cosy scarf, photorealistic',
    negativePrompt: NEG,
    style: 'Photographic (Default)',
    previewUrl: UNS('photo-1765294661321-c564a3249d47'),
  },
  {
    slug: 'autumn-harvest',
    name: 'Autumn Harvest',
    category: 'seasonal',
    free: false,
    prompt: 'A warm autumn portrait of img surrounded by golden falling leaves and pumpkins, cosy fall light, photorealistic',
    negativePrompt: NEG,
    style: 'Photographic (Default)',
    previewUrl: UNS('photo-1730081568497-7365e5c63618'),
  },
  {
    slug: 'summer-sunshine',
    name: 'Summer Sunshine',
    category: 'seasonal',
    free: true,
    prompt: 'A bright summer portrait of img in warm golden sunshine, vibrant and happy, outdoor natural light, photorealistic',
    negativePrompt: NEG,
    style: 'Photographic (Default)',
    previewUrl: UNS('photo-1685580325404-5d3d2dc46b58'),
  },
  {
    slug: 'spring-morning',
    name: 'Spring Morning',
    category: 'seasonal',
    free: false,
    prompt: 'A fresh spring morning portrait of img with pink flowers and green leaves, soft morning light, photorealistic',
    negativePrompt: NEG,
    style: 'Photographic (Default)',
    previewUrl: UNS('photo-1635377361665-60442f6cf799'),
  },
  // Artistic
  {
    slug: 'watercolor',
    name: 'Watercolor',
    category: 'artistic',
    free: false,
    prompt: 'A beautiful watercolour painting portrait of img, soft pastel washes, artistic brushstrokes, delicate and dreamy',
    negativePrompt: NEG,
    style: 'Digital Art',
    previewUrl: UNS('photo-1762117499084-2305f510c84c'),
  },
  {
    slug: 'oil-portrait',
    name: 'Oil Portrait',
    category: 'artistic',
    free: false,
    prompt: 'A classical oil painting portrait of img, rich warm colours, Renaissance masterpiece style, detailed and regal',
    negativePrompt: NEG,
    style: 'Digital Art',
    previewUrl: UNS('photo-1763494893425-5faf136b3b79'),
  },
  {
    slug: 'impressionist',
    name: 'Impressionist',
    category: 'artistic',
    free: false,
    prompt: 'An impressionist painting portrait of img, Monet style, loose visible brushstrokes, soft dappled garden light',
    negativePrompt: NEG,
    style: 'Digital Art',
    previewUrl: UNS('photo-1763494893478-6f2c917ce7e1'),
  },
  {
    slug: 'comic-hero',
    name: 'Comic Book Hero',
    category: 'artistic',
    free: false,
    prompt: 'A comic book superhero portrait of img, bold ink outlines, vibrant flat colours, dynamic hero pose, comic art',
    negativePrompt: NEG,
    style: 'Comic book',
    previewUrl: UNS('photo-1620075267033-09d12ec75b40'),
  },
  // Adventure
  {
    slug: 'astronaut',
    name: 'Little Astronaut',
    category: 'adventure',
    free: true,
    prompt: 'A portrait of img as a cute little astronaut in space, stars and planets behind, cosmic adventure, digital art',
    negativePrompt: NEG,
    style: 'Digital Art',
    previewUrl: UNS('photo-1756693576129-9cf644527021'),
  },
  {
    slug: 'ocean-explorer',
    name: 'Ocean Explorer',
    category: 'adventure',
    free: false,
    prompt: 'An underwater portrait of img as an ocean explorer, colourful coral reef, tropical fish, crystal clear water, digital art',
    negativePrompt: NEG,
    style: 'Fantasy art',
    previewUrl: UNS('photo-1634148521245-554dde415214'),
  },
  {
    slug: 'jungle-adventure',
    name: 'Jungle Adventure',
    category: 'adventure',
    free: false,
    prompt: 'A portrait of img in a lush tropical jungle adventure, vibrant exotic plants and animals, photorealistic',
    negativePrompt: NEG,
    style: 'Photographic (Default)',
    previewUrl: UNS('photo-1668976895552-a8764564ff7f'),
  },
  {
    slug: 'safari-baby',
    name: 'Safari Baby',
    category: 'adventure',
    free: false,
    prompt: 'A portrait of img on the African savanna safari, golden grass, acacia trees, wildlife in background, photorealistic',
    negativePrompt: NEG,
    style: 'Photographic (Default)',
    previewUrl: UNS('photo-1614698561633-5eb087077543'),
  },
  // Cultural
  {
    slug: 'japanese-garden',
    name: 'Japanese Garden',
    category: 'cultural',
    free: false,
    prompt: 'A serene portrait of img in a traditional Japanese garden, cherry blossoms, koi pond, zen atmosphere, photorealistic',
    negativePrompt: NEG,
    style: 'Photographic (Default)',
    previewUrl: UNS('photo-1731116392806-c642898dc7d4'),
  },
  {
    slug: 'nordic-winter',
    name: 'Nordic Winter',
    category: 'cultural',
    free: false,
    prompt: 'A cosy Nordic portrait of img in a snowy Scandinavian landscape, aurora borealis in the sky, warm woolly clothing, photorealistic',
    negativePrompt: NEG,
    style: 'Photographic (Default)',
    previewUrl: UNS('photo-1761662826830-e8f697112ca7'),
  },
  {
    slug: 'moroccan-dreams',
    name: 'Moroccan Dreams',
    category: 'cultural',
    free: false,
    prompt: 'A vibrant portrait of img in a colourful Moroccan riad, intricate tilework, warm lantern light, rich textiles, photorealistic',
    negativePrompt: NEG,
    style: 'Photographic (Default)',
    previewUrl: UNS('photo-1570289676648-8bc8ee1331c8'),
  },
  // Premium fantasy
  {
    slug: 'angel-wings',
    name: 'Angel Wings',
    category: 'fantasy',
    free: false,
    prompt: 'A divine celestial portrait of img with beautiful white angel wings, heavenly golden light, clouds, ethereal and magical',
    negativePrompt: NEG,
    style: 'Fantasy art',
    previewUrl: UNS('photo-1764555719692-df3cf8541928'),
  },
  {
    slug: 'royal-portrait',
    name: 'Royal Portrait',
    category: 'classic',
    free: false,
    prompt: 'A regal royal portrait of img in opulent royal attire, crown, majestic palace backdrop, classical oil painting style',
    negativePrompt: NEG,
    style: 'Digital Art',
    previewUrl: UNS('photo-1763828592852-41d36f202c27'),
  },
  {
    slug: 'boho-dreams',
    name: 'Boho Dreams',
    category: 'nature',
    free: false,
    prompt: 'A bohemian portrait of img with dream catchers, wildflowers, boho textiles, warm golden tones, free-spirited atmosphere, photorealistic',
    negativePrompt: NEG,
    style: 'Photographic (Default)',
    previewUrl: UNS('photo-1591800017262-cb985345c20c'),
  },
  {
    slug: 'neon-future',
    name: 'Neon Future',
    category: 'artistic',
    free: false,
    prompt: 'A futuristic neon cyberpunk portrait of img, vibrant neon lights, holographic elements, high-tech city background',
    negativePrompt: NEG,
    style: 'Neonpunk',
    previewUrl: UNS('photo-1587930708915-55a36837263b'),
  },
];

export const THEME_SLUGS = new Set(THEMES.map((t) => t.slug));

export function getTheme(slug: string): Theme | undefined {
  return THEMES.find((t) => t.slug === slug);
}
