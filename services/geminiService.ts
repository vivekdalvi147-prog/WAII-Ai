import { GoogleGenAI, Modality } from "@google/genai";
import type { AspectRatio } from '../types.ts';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getApiErrorMessage = (error: any): string => {
    console.error('Gemini API Error:', error);
    if (error && typeof error.message === 'string') {
        const message = error.message.toLowerCase();
        if (message.includes('api key not valid') || message.includes('permission denied') || message.includes('api_key')) {
            return 'Image generation failed: The API key is invalid or missing. Please ensure it is configured correctly in the environment settings.';
        }
        if (message.includes('safety') || message.includes('blocked')) {
            return 'Image generation failed: Your request was blocked due to safety policies. Please modify your prompt and try again.';
        }
        if (message.includes('network') || message.includes('fetch failed')) {
             return 'Image generation failed: A network error occurred. Please check your internet connection and try again.';
        }
        if (message.includes('malformed')) {
             return 'Image generation failed: The request was malformed. Please check the inputs.';
        }
    }
    // Generic fallback for other types of errors
    return 'Image generation failed due to an unexpected issue. Please check your prompt and try again. If the problem persists, see the console for more details.';
};


export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};

export const urlToBase64 = async (url: string): Promise<{ base64: string; mimeType: string }> => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch image from URL. Status: ${response.status}`);
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
            reader.onerror = () => reject(new Error('Failed to convert fetched image to Base64.'));
        });
    } catch (error) {
        console.error('Error fetching URL to base64:', error);
        throw new Error('Could not load image from the provided URL. Please check the network connection and CORS policy.');
    }
};

export const addWatermark = (base64Image: string): Promise<string> => {
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

            const fontSize = Math.max(16, Math.floor(canvas.width / 60));
            ctx.font = `bold ${fontSize}px 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif`;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
            ctx.shadowBlur = 5;

            const padding = fontSize * 1.2;
            ctx.fillText('WAII', canvas.width - padding, canvas.height - padding);

            resolve(canvas.toDataURL('image/png'));
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
      textPrompt = `Act as a professional photoshop artist. Your task is to seamlessly composite the product from the second image onto the model/background from the first image. Follow the user's instructions precisely: "${prompt}". The final result must be ultra-realistic. Pay extreme attention to matching lighting, shadows, perspective, and color grading. The integration should be flawless.`;
    } else {
      textPrompt = `Act as a professional photoshop artist. This is the background image. Please edit the image by adding elements based on the following instructions: "${prompt}". The final result must be ultra-realistic, with lighting, shadows, and perspective seamlessly blended as if they were part of the original photograph.`;
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
    throw new Error(getApiErrorMessage(error));
  }
};

export const generateImageFromText = async (
  prompt: string,
  aspectRatio: AspectRatio
): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: aspectRatio,
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/png;base64,${base64ImageBytes}`;
    }

    throw new Error('No image was generated in the response.');
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};