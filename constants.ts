
import type { StylePreset, AspectRatio } from './types';

export const STYLE_PRESETS: StylePreset[] = [
  { id: 'studio', name: 'Professional Studio', promptSuffix: 'in a professional, clean, well-lit studio environment with a minimalist background' },
  { id: 'outdoor', name: 'Outdoor Lifestyle', promptSuffix: 'in a vibrant outdoor lifestyle setting with natural lighting, like a sunny park or a chic urban street' },
  { id: 'social', name: 'Social Media', promptSuffix: 'with a trendy, eye-catching aesthetic suitable for social media like Instagram, using vibrant colors and a dynamic composition' },
  { id: 'ecommerce', name: 'E-commerce', promptSuffix: 'against a plain, solid white background, with perfect lighting to highlight product details, in the style of an Amazon or Shopify product listing' },
];

export const ASPECT_RATIOS: AspectRatio[] = [
  { id: '16:9', name: '16:9', promptSuffix: 'The final image must have a landscape 16:9 aspect ratio.' },
  { id: '9:16', name: '9:16', promptSuffix: 'The final image must have a portrait 9:16 aspect ratio, suitable for stories or reels.' },
  { id: '1:1', name: '1:1', promptSuffix: 'The final image must have a square 1:1 aspect ratio.' },
];

export const STOCK_MODELS: string[] = [
  'https://picsum.photos/id/1005/600/800', // Man with beard
  'https://picsum.photos/id/1011/600/800', // Woman in field
  'https://picsum.photos/id/1027/600/800', // Woman with coffee
];
