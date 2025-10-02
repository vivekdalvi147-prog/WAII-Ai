
import React, { useState, useCallback, useEffect } from 'react';
import type { StylePreset, AspectRatio } from './types.ts';
import { STYLE_PRESETS, STOCK_MODELS, ASPECT_RATIOS } from './constants.ts';
import { generateCompositeImage, fileToBase64, urlToBase64, generateImageFromText, addWatermark } from './services/geminiService.ts';

import { ImageUploader } from './components/ImageUploader.tsx';
import { Loader } from './components/Loader.tsx';
import { ParticleBackground } from './components/ParticleBackground.tsx';
import { StockModelModal } from './components/StockModelModal.tsx';
import { DownloadIcon } from './components/icons.tsx';


type GenerationMode = 'composite' | 'text';

const App: React.FC = () => {
    const [generationMode, setGenerationMode] = useState<GenerationMode>('composite');
    const [modelImageFile, setModelImageFile] = useState<File | null>(null);
    const [modelImageUrl, setModelImageUrl] = useState<string | null>(null);
    const [productImageFile, setProductImageFile] = useState<File | null>(null);

    const [modelImagePreview, setModelImagePreview] = useState<string | null>(null);
    const [productImagePreview, setProductImagePreview] = useState<string | null>(null);

    const [prompt, setPrompt] = useState<string>('');
    const [selectedStyle, setSelectedStyle] = useState<StylePreset>(STYLE_PRESETS[0]);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');

    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    
    useEffect(() => {
        let objectUrl: string | null = null;
        if (modelImageFile) {
            objectUrl = URL.createObjectURL(modelImageFile);
            setModelImagePreview(objectUrl);
        } else {
            setModelImagePreview(modelImageUrl);
        }

        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [modelImageFile, modelImageUrl]);

    useEffect(() => {
        if (!productImageFile) {
            setProductImagePreview(null);
            return;
        }
        const objectUrl = URL.createObjectURL(productImageFile);
        setProductImagePreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [productImageFile]);


    const handleModelSelect = (url: string) => {
        setModelImageUrl(url);
        setModelImageFile(null);
        setIsModalOpen(false);
    };

    const handleModelFileUpload = (file: File) => {
        setModelImageFile(file);
        setModelImageUrl(null);
    };

    const clearModelImage = useCallback(() => {
        setModelImageFile(null);
        setModelImageUrl(null);
    }, []);

    const clearProductImage = useCallback(() => {
        setProductImageFile(null);
    }, []);
    
    const handleImageError = useCallback((imageType: 'model' | 'product') => {
        setError(`Unsupported format for ${imageType} photo. Please use JPG, PNG, or WebP.`);
        if (imageType === 'model') {
            clearModelImage();
        } else {
            clearProductImage();
        }
    }, [clearModelImage, clearProductImage]);


    const handleGenerate = useCallback(async () => {
        setError(null);
        setIsLoading(true);
        setGeneratedImage(null);

        try {
            const fullPrompt = `${prompt}. ${selectedStyle.promptSuffix}.`;
            let result: string;

            if (generationMode === 'composite') {
                if (!modelImageFile && !modelImageUrl) {
                    throw new Error('Please upload or select a model image.');
                }
                const modelImgData = modelImageFile
                    ? { data: await fileToBase64(modelImageFile), mimeType: modelImageFile.type }
                    : await urlToBase64(modelImageUrl!).then(({ base64, mimeType }) => ({ data: base64, mimeType }));
                
                const productImgData = productImageFile
                    ? { data: await fileToBase64(productImageFile), mimeType: productImageFile.type }
                    : null;
                
                result = await generateCompositeImage(modelImgData, productImgData, fullPrompt);

            } else {
                if (!prompt.trim()) {
                    throw new Error('Please enter a prompt to generate an image.');
                }
                result = await generateImageFromText(fullPrompt, aspectRatio);
            }
            
            const watermarkedResult = await addWatermark(result);
            setGeneratedImage(watermarkedResult);

        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [generationMode, modelImageFile, modelImageUrl, productImageFile, prompt, selectedStyle, aspectRatio]);

    const downloadImage = () => {
        if (!generatedImage) return;
        const link = document.createElement('a');
        link.href = generatedImage;
        link.download = `waii-generated-image.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen w-full relative overflow-hidden">
            <ParticleBackground />
            {isLoading && <Loader />}
            <StockModelModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSelect={handleModelSelect} />
            
            <main className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                <header className="text-center my-8">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-wider text-white neon-glow-text">
                        WAII
                    </h1>
                    <p className="text-cyan-300 mt-2 text-lg">Photorealistic AI Image Generator</p>
                </header>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-gray-900/50 border border-cyan-500/30 rounded-xl p-6 backdrop-blur-sm neon-glow-box">
                       <div className="flex border-b-2 border-cyan-500/30 mb-6 rounded-t-lg overflow-hidden">
                            <button onClick={() => setGenerationMode('composite')} className={`flex-1 py-3 text-center font-semibold transition-all duration-300 ${generationMode === 'composite' ? 'bg-cyan-500/20 text-cyan-200 border-b-4 border-cyan-400' : 'text-gray-400 hover:bg-gray-800/50'}`}>
                                Image Composite
                            </button>
                            <button onClick={() => setGenerationMode('text')} className={`flex-1 py-3 text-center font-semibold transition-all duration-300 ${generationMode === 'text' ? 'bg-cyan-500/20 text-cyan-200 border-b-4 border-cyan-400' : 'text-gray-400 hover:bg-gray-800/50'}`}>
                                Text to Image
                            </button>
                        </div>
                        
                       {generationMode === 'composite' && (
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <ImageUploader 
                                    label="1. Model Photo" 
                                    onFileSelect={handleModelFileUpload} 
                                    previewUrl={modelImagePreview}
                                    onStockSelect={() => setIsModalOpen(true)}
                                    stockSelectText="Or Select a Model"
                                    onClear={clearModelImage}
                                    onLoadError={() => handleImageError('model')}
                                />
                                <ImageUploader 
                                    label="2. Product Photo (Optional)" 
                                    onFileSelect={setProductImageFile} 
                                    previewUrl={productImagePreview}
                                    onClear={clearProductImage}
                                    onLoadError={() => handleImageError('product')}
                                />
                           </div>
                       )}

                       <div className="mt-6">
                           <label htmlFor="prompt" className="block text-sm font-medium text-cyan-300 mb-2">
                            {generationMode === 'composite' ? '3. Smart Prompt' : '1. Prompt'}
                           </label>
                           <div className="relative rounded-lg transition-shadow duration-300 prompt-box-glow">
                                <textarea
                                    id="prompt"
                                    rows={4}
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder={generationMode === 'composite' ? "e.g., 'place the watch on the wrist' or 'add a gold watch with a blue dial'" : "e.g., 'A high-resolution photo of a robot holding a red skateboard'"}
                                    className="w-full bg-gray-900/80 border-2 border-cyan-400/30 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-0 transition-colors"
                                />
                           </div>
                       </div>

                       <div className="mt-6">
                            <h3 className="text-sm font-medium text-cyan-300 mb-2">{generationMode === 'composite' ? '4. Style Preset' : '2. Style Preset'}</h3>
                            <div className="flex flex-wrap gap-2">
                                {STYLE_PRESETS.map(preset => (
                                    <button 
                                        key={preset.id} 
                                        onClick={() => setSelectedStyle(preset)}
                                        className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 border-2 ${selectedStyle.id === preset.id ? 'bg-cyan-500 text-black border-cyan-400 neon-glow-box' : 'bg-gray-800/50 border-gray-600 hover:bg-cyan-500/20 hover:border-cyan-500/50'}`}
                                    >
                                        {preset.name}
                                    </button>
                                ))}
                            </div>
                       </div>
                       
                       {generationMode === 'text' && (
                            <div className="mt-6">
                                <h3 className="text-sm font-medium text-cyan-300 mb-2">3. Aspect Ratio</h3>
                                <div className="flex flex-wrap gap-2">
                                    {ASPECT_RATIOS.map(ratio => (
                                        <button 
                                            key={ratio.value} 
                                            onClick={() => setAspectRatio(ratio.value)}
                                            className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 border-2 ${aspectRatio === ratio.value ? 'bg-cyan-500 text-black border-cyan-400 neon-glow-box' : 'bg-gray-800/50 border-gray-600 hover:bg-cyan-500/20 hover:border-cyan-500/50'}`}
                                        >
                                            {ratio.label} <span className="text-xs opacity-75">({ratio.value})</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                       )}

                       <button 
                            onClick={handleGenerate} 
                            disabled={isLoading}
                            className="w-full mt-8 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3 px-4 rounded-lg text-lg hover:scale-105 transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed neon-glow-box"
                        >
                            {isLoading ? 'Generating...' : 'Generate Image'}
                        </button>
                        {error && <p className="text-red-400 text-center mt-4 fade-in">{error}</p>}
                    </div>
                    
                    <div className="bg-gray-900/50 border border-cyan-500/30 rounded-xl p-6 backdrop-blur-sm flex items-center justify-center min-h-[400px] lg:min-h-full neon-glow-box">
                        {generatedImage ? (
                            <div className="w-full h-full flex flex-col fade-in">
                                <div className="flex-grow">
                                {generationMode === 'composite' ? (
                                    <div className="flex flex-col h-full">
                                        <h2 className="text-2xl font-bold text-center mb-4 neon-glow-text">Generated Photoshoot</h2>
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start flex-grow">
                                            <div className="text-center">
                                                <h3 className="text-lg text-cyan-200 mb-2">Model</h3>
                                                <img src={modelImagePreview!} alt="Original Model" className="rounded-lg w-full object-contain max-h-96"/>
                                            </div>
                                            <div className="text-center">
                                                <h3 className="text-lg text-cyan-200 mb-2">AI Result</h3>
                                                <img src={generatedImage} alt="Generated" className="rounded-lg w-full object-contain max-h-96 border-2 border-cyan-400" />
                                            </div>
                                            <div className="text-center">
                                                <h3 className="text-lg text-cyan-200 mb-2">Product</h3>
                                                {productImagePreview ? (
                                                    <img src={productImagePreview} alt="Original Product" className="rounded-lg w-full object-contain max-h-96"/>
                                                ) : (
                                                    <div className="w-full h-96 flex items-center justify-center text-gray-500 bg-gray-900/50 rounded-lg">
                                                        (No product)
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center h-full flex flex-col justify-center">
                                         <h2 className="text-2xl font-bold text-center mb-4 neon-glow-text">Your Creation</h2>
                                        <div className="relative inline-block">
                                            <img src={generatedImage} alt="Generated" className="rounded-lg w-full object-contain max-h-[500px]" />
                                        </div>
                                    </div>
                                )}
                                </div>
                                <button onClick={downloadImage} className="w-full mt-6 bg-green-500/80 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300">
                                    <DownloadIcon />
                                    Download Image
                                </button>
                            </div>
                        ) : (
                             <div className="text-center text-gray-400">
                                 <p className="text-2xl">Your generated image will appear here</p>
                                 <p className="mt-2">Fill in the details and click 'Generate'</p>
                             </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;