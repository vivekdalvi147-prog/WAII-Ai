import { GoogleGenAI, Modality } from "@google/genai";
import type { AspectRatio } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};

export const urlToBase64 = async (url: string): Promise<{ base64: string; mimeType: string }> => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const blob = await response.blob();
    const mimeType = blob.type;
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve({ base64, mimeType });
        };
        reader.onerror = (error) => reject(error);
    });
};

export const addWatermark = (base64Image: string, format: 'jpeg' | 'png', jpegQuality: number = 0.92): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error('Could not get canvas context'));
            }

            ctx.drawImage(img, 0, 0);

            // Watermark style
            const fontSize = Math.max(16, Math.floor(canvas.width / 60));
            ctx.font = `bold ${fontSize}px 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif`;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
            ctx.shadowBlur = 5;

            const padding = fontSize * 1.2;
            ctx.fillText('WAII', canvas.width - padding, canvas.height - padding);

            if (format === 'jpeg') {
                resolve(canvas.toDataURL('image/jpeg', jpegQuality));
            } else {
                resolve(canvas.toDataURL(`image/png`));
            }
        };
        img.onerror = (err) => reject(err);
        img.src = base64Image;
    });
};


export const generateCompositeImage = async (
  modelImage: { data: string; mimeType: string },
  productImage: { data: string; mimeType: string } | null,
  prompt: string
): Promise<string> => {
  try {
    const modelImagePart = {
      inlineData: {
        data: modelImage.data,
        mimeType: modelImage.mimeType,
      },
    };

    const parts: any[] = [modelImagePart];
    let textPrompt = '';

    if (productImage) {
      parts.push({
        inlineData: {
          data: productImage.data,
          mimeType: productImage.mimeType,
        },
      });
      textPrompt = `Image 1 is the model/background. Image 2 is the product. Please realistically composite the product from Image 2 into Image 1 based on the following instructions: "${prompt}". Ensure lighting, shadows, and perspective are seamlessly blended.`;
    } else {
      textPrompt = `This is the background image. Please edit the image by adding elements based on the following instructions: "${prompt}". Ensure the final image is realistic, with lighting, shadows, and perspective seamlessly blended.`;
    }
    
    parts.push({ text: textPrompt });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: { parts },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const mimeType = part.inlineData.mimeType;
        const base64ImageBytes: string = part.inlineData.data;
        return `data:${mimeType};base64,${base64ImageBytes}`;
      }
    }
    throw new Error('No image was generated in the response.');
  } catch (error) {
    console.error('Error generating composite image:', error);
    throw new Error('Failed to generate image. Please check the console for details.');
  }
};

export const generateImageFromText = async (
  prompt: string,
  aspectRatio: AspectRatio,
  outputFormat: 'jpeg' | 'png'
): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: `image/${outputFormat}`,
        aspectRatio: aspectRatio,
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/${outputFormat};base64,${base64ImageBytes}`;
    }

    throw new Error('No image was generated in the response.');
  } catch (error) {
    console.error('Error generating image from text:', error);
    throw new Error('Failed to generate image. Please check the console for details.');
  }
};
