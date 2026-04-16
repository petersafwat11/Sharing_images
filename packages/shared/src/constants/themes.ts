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

const UNS = (id: string): string =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=400&q=80`;

export const THEMES: Theme[] = [
  {
    slug: 'studio-white',
    name: 'Studio Portrait',
    category: 'classic',
    free: true,
    prompt:
      'A professional studio portrait photograph of a cute baby img, ' +
      'clean white seamless background, soft diffused butterfly lighting, ' +
      'beautiful catchlights in large bright eyes, rosy chubby cheeks, ' +
      'adorable infant expression, tack-sharp focus on face, ' +
      'photorealistic, high resolution, warm skin tones',
    negativePrompt:
      'blurry, deformed, ugly, low quality, bad anatomy, distorted face, ' +
      'extra limbs, watermark, text, adult, man, woman, teenager, grown-up, ' +
      'old person, wrinkles, beard, facial hair, mature features',
    style: 'Photographic (Default)',
    previewUrl: UNS('photo-1694231664712-91e992b4d4a8'),
  },
  {
    slug: 'astronaut',
    name: 'Little Astronaut',
    category: 'adventure',
    free: true,
    prompt:
      'A cute baby img wearing a tiny white NASA astronaut spacesuit and helmet, ' +
      'floating weightlessly in outer space, surrounded by colourful glowing planets, ' +
      'sparkling stars and a vivid nebula, soft rim lighting on the baby\'s face, ' +
      'wonder and joy in their big bright eyes, cinematic composition, ' +
      'highly detailed digital art, adorable and whimsical, 8K',
    negativePrompt:
      'blurry, deformed, ugly, low quality, bad anatomy, distorted face, ' +
      'extra limbs, watermark, text, adult, man, woman, teenager, grown-up, ' +
      'old person, wrinkles, beard, facial hair, mature features, scary, dark',
    style: 'Digital Art',
    previewUrl: UNS('photo-1756693576129-9cf644527021'),
  },
];

export const THEME_SLUGS = new Set(THEMES.map((t) => t.slug));

export function getTheme(slug: string): Theme | undefined {
  return THEMES.find((t) => t.slug === slug);
}
