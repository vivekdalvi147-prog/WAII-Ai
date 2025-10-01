
import { GoogleGenAI, Modality } from "@google/genai";

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


export const generateCompositeImage = async (
  modelImage: { data: string; mimeType: string },
  productImage: { data: string; mimeType: string },
  prompt: string
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: modelImage.data,
              mimeType: modelImage.mimeType,
            },
          },
          {
            inlineData: {
              data: productImage.data,
              mimeType: productImage.mimeType,
            },
          },
          {
            text: `Image 1 is the model/background. Image 2 is the product. Please realistically composite the product from Image 2 into Image 1 based on the following instructions: "${prompt}". Ensure lighting, shadows, and perspective are seamlessly blended.`,
          },
        ],
      },
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
