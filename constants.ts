import type { StylePreset, AspectRatio } from './types.ts';

export const STYLE_PRESETS: StylePreset[] = [
  { id: 'studio', name: 'Professional Studio', promptSuffix: 'in a professional, clean, well-lit studio environment with a minimalist background. Aim for an ultra-realistic, photorealistic, 8k resolution image with cinematic lighting and sharp focus.' },
  { id: 'outdoor', name: 'Outdoor Lifestyle', promptSuffix: 'in a vibrant outdoor lifestyle setting. The image should be ultra-realistic, photorealistic, 8k, as if shot on a professional DSLR camera with a prime lens, featuring beautiful depth of field and natural golden hour lighting.' },
  { id: 'social', name: 'Social Media', promptSuffix: 'with a trendy, eye-catching aesthetic suitable for social media. The image should be vibrant, high-contrast, ultra-sharp, trending on ArtStation, with a dynamic composition and cinematic lighting.' },
  { id: 'ecommerce', name: 'E-commerce', promptSuffix: 'against a perfect #FFFFFF solid white background. The product should be shot with a macro lens to be incredibly detailed, lit with studio softbox lighting, have no shadows, and be ready for an e-commerce website like Amazon or Shopify.' },
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