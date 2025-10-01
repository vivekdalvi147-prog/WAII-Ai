import type { StylePreset, AspectRatio } from './types';

export const STYLE_PRESETS: StylePreset[] = [
  { id: 'studio', name: 'Professional Studio', promptSuffix: 'in a professional, clean, well-lit studio environment with a minimalist background' },
  { id: 'outdoor', name: 'Outdoor Lifestyle', promptSuffix: 'in a vibrant outdoor lifestyle setting with natural lighting, like a sunny park or a chic urban street' },
  { id: 'social', name: 'Social Media', promptSuffix: 'with a trendy, eye-catching aesthetic suitable for social media like Instagram, using vibrant colors and a dynamic composition' },
  { id: 'ecommerce', name: 'E-commerce', promptSuffix: 'against a plain, solid white background, with perfect lighting to highlight product details, in the style of an Amazon or Shopify product listing' },
];

export const ASPECT_RATIOS: { value: AspectRatio; label: string }[] = [
  { value: '1:1', label: 'Square' },
  { value: '16:9', label: 'Landscape' },
  { value: '9:16', label: 'Portrait' },
  { value: '4:3', label: 'Standard' },
  { value: '3:4', label: 'Tall' },
];

export const STOCK_MODELS: string[] = [
  'https://picsum.photos/id/1005/600/800', // Man with beard
  'https://picsum.photos/id/1011/600/800', // Woman in field
  'https://picsum.photos/id/1027/600/800', // Woman with coffee
];
