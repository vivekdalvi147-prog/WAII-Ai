import React, { useState, useCallback, useMemo, useEffect } from 'react';
import type { StylePreset, AspectRatio } from './types';
import { STYLE_PRESETS, ASPECT_RATIOS, STOCK_MODELS } from './constants';
import { generateCompositeImage, fileToBase64, urlToBase64 } from './services/geminiService';

// --- Helper Components (defined outside main component) ---

const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || 'w-10 h-10'}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
  </svg>
);

const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || 'w-6 h-6'}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

interface ImageUploaderProps {
  label: string;
  onFileSelect: (file: File) => void;
  previewUrl: string | null;
  onStockSelect?: () => void;
  stockSelectText?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ label, onFileSelect, previewUrl, onStockSelect, stockSelectText }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-cyan-300 mb-2">{label}</label>
      <div className="w-full aspect-square bg-gray-900/50 border-2 border-dashed border-cyan-400/30 rounded-lg flex items-center justify-center relative transition-all duration-300 hover:border-cyan-400">
        {previewUrl ? (
          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-lg" />
        ) : (
          <div className="text-center text-gray-400">
            <UploadIcon className="mx-auto w-12 h-12 text-cyan-400/50" />
            <p>Click to upload</p>
          </div>
        )}
        <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
      </div>
      {onStockSelect && (
         <button onClick={onStockSelect} className="w-full mt-2 text-sm bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 py-2 px-4 rounded-md transition-all duration-300 neon-glow-box">
             {stockSelectText}
         </button>
      )}
    </div>
  );
};

const Loader: React.FC = () => (
    <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
        <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin neon-glow-box"></div>
        <p className="mt-4 text-cyan-300 text-lg neon-glow-text">Generating Your Vision...</p>
    </div>
);


const ParticleBackground: React.FC = () => {
    const particles = useMemo(() => Array.from({ length: 50 }), []);
    return (
        <div className="absolute inset-0 overflow-hidden z-0">
            {particles.map((_, i) => {
                const size = Math.random() * 3 + 1;
                const duration = Math.random() * 15 + 10;
                const delay = Math.random() * -25;
                const top = `${Math.random() * 100}%`;
                const left = `${Math.random() * 100}%`;

                return (
                    <div
                        key={i}
                        className="absolute rounded-full bg-cyan-400/50"
                        style={{
                            width: `${size}px`,
                            height: `${size}px`,
                            top,
                            left,
                            animation: `move ${duration}s linear ${delay}s infinite`,
                            boxShadow: '0 0 5px #0ff, 0 0 10px #0ff'
                        }}
                    ></div>
                );
            })}
            <style>
                {`
                @keyframes move {
                    0% { transform: translate(0, 0); }
                    100% { transform: translate(calc(100vw - ${Math.random() * 200}vw), calc(100vh - ${Math.random() * 200}vh)); }
                }
                `}
            </style>
        </div>
    );
};


interface StockModelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (url: string) => void;
}

const StockModelModal: React.FC<StockModelModalProps> = ({ isOpen, onClose, onSelect }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-gray-900 border border-cyan-500/30 rounded-xl p-6 w-full max-w-4xl neon-glow-box" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-center mb-6 neon-glow-text">Select a Model</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {STOCK_MODELS.map((url, i) => (
                        <div key={i} className="cursor-pointer group relative overflow-hidden rounded-lg" onClick={() => onSelect(url)}>
                            <img src={url} alt={`Stock model ${i + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <span className="text-white text-lg font-semibold">Select</span>
                            </div>
                        </div>
                    ))}
                </div>
                <button onClick={onClose} className="mt-6 w-full text-sm bg-red-600/20 hover:bg-red-600/40 text-red-300 py-2 px-4 rounded-md transition-all duration-300">
                    Close
                </button>
            </div>
        </div>
    );
};

// --- Main App Component ---

const App: React.FC = () => {
    const [modelImageFile, setModelImageFile] = useState<File | null>(null);
    const [modelImageUrl, setModelImageUrl] = useState<string | null>(null);
    const [productImageFile, setProductImageFile] = useState<File | null>(null);

    const [prompt, setPrompt] = useState<string>('');
    const [selectedStyle, setSelectedStyle] = useState<StylePreset>(STYLE_PRESETS[0]);
    const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatio>(ASPECT_RATIOS[0]);

    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const modelImagePreview = useMemo(() => {
      if (modelImageFile) return URL.createObjectURL(modelImageFile);
      if (modelImageUrl) return modelImageUrl;
      return null;
    }, [modelImageFile, modelImageUrl]);
    
    const productImagePreview = useMemo(() => {
        return productImageFile ? URL.createObjectURL(productImageFile) : null;
    }, [productImageFile]);

    useEffect(() => {
        // Clean up object URLs to prevent memory leaks
        return () => {
            if (modelImagePreview && modelImagePreview.startsWith('blob:')) URL.revokeObjectURL(modelImagePreview);
            if (productImagePreview) URL.revokeObjectURL(productImagePreview);
        };
    }, [modelImagePreview, productImagePreview]);

    const handleModelSelect = (url: string) => {
        setModelImageUrl(url);
        setModelImageFile(null);
        setIsModalOpen(false);
    };

    const handleModelFileUpload = (file: File) => {
        setModelImageFile(file);
        setModelImageUrl(null);
    };

    const handleGenerate = useCallback(async () => {
        if (!productImageFile) {
            setError('Please upload a product image.');
            return;
        }
        if (!modelImageFile && !modelImageUrl) {
            setError('Please upload or select a model image.');
            return;
        }

        setError(null);
        setIsLoading(true);
        setGeneratedImage(null);

        try {
            // FIX: Map the `base64` property from `urlToBase64` to `data` to match the expected type for `generateCompositeImage`.
            const modelImgData = modelImageFile
                ? { data: await fileToBase64(modelImageFile), mimeType: modelImageFile.type }
                : await urlToBase64(modelImageUrl!).then(({ base64, mimeType }) => ({ data: base64, mimeType }));

            const productImgData = { data: await fileToBase64(productImageFile), mimeType: productImageFile.type };

            const fullPrompt = `${prompt}. The image should be styled ${selectedStyle.promptSuffix}. ${selectedAspectRatio.promptSuffix}`;
            
            const result = await generateCompositeImage(modelImgData, productImgData, fullPrompt);
            setGeneratedImage(result);

        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [modelImageFile, modelImageUrl, productImageFile, prompt, selectedStyle, selectedAspectRatio]);

    const downloadImage = () => {
        if (!generatedImage) return;

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = generatedImage;
        
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            canvas.width = img.width;
            canvas.height = img.height;

            ctx.drawImage(img, 0, 0);

            const fontSize = Math.max(24, img.width / 30);
            ctx.font = `bold ${fontSize}px sans-serif`;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';
            
            ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.shadowBlur = 4;

            const padding = fontSize;
            ctx.fillText('WAII', canvas.width - padding, canvas.height - padding);

            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = 'waii-generated-image.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        img.onerror = () => {
            // Fallback to direct download if canvas method fails
            const link = document.createElement('a');
            link.href = generatedImage;
            link.download = 'waii-generated-image.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };
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
                    <p className="text-cyan-300 mt-2">AI Imagine Generator</p>
                </header>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Controls */}
                    <div className="bg-gray-900/50 border border-cyan-500/30 rounded-xl p-6 backdrop-blur-sm neon-glow-box">
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <ImageUploader 
                                label="1. Model Photo" 
                                onFileSelect={handleModelFileUpload} 
                                previewUrl={modelImagePreview}
                                onStockSelect={() => setIsModalOpen(true)}
                                stockSelectText="Or Select a Model"
                            />
                            <ImageUploader 
                                label="2. Product Photo" 
                                onFileSelect={setProductImageFile} 
                                previewUrl={productImagePreview}
                            />
                       </div>

                       <div className="mt-6">
                           <label htmlFor="prompt" className="block text-sm font-medium text-cyan-300 mb-2">3. Smart Prompt</label>
                           <div className="relative rounded-lg transition-shadow duration-300 prompt-box-glow">
                                <textarea
                                    id="prompt"
                                    rows={4}
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="e.g., 'place the watch on the model's left wrist'"
                                    className="w-full bg-gray-900/80 border-2 border-cyan-400/30 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-0 transition-colors"
                                />
                           </div>
                       </div>

                       <div className="mt-6">
                            <h3 className="text-sm font-medium text-cyan-300 mb-2">4. Style Presets</h3>
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
                       
                       <div className="mt-6">
                            <h3 className="text-sm font-medium text-cyan-300 mb-2">5. Image Size</h3>
                            <div className="flex flex-wrap gap-2">
                                {ASPECT_RATIOS.map(ratio => (
                                    <button 
                                        key={ratio.id} 
                                        onClick={() => setSelectedAspectRatio(ratio)}
                                        className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 border-2 ${selectedAspectRatio.id === ratio.id ? 'bg-cyan-500 text-black border-cyan-400 neon-glow-box' : 'bg-gray-800/50 border-gray-600 hover:bg-cyan-500/20 hover:border-cyan-500/50'}`}
                                    >
                                        {ratio.name}
                                    </button>
                                ))}
                            </div>
                       </div>

                       <button 
                            onClick={handleGenerate} 
                            disabled={isLoading}
                            className="w-full mt-8 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3 px-4 rounded-lg text-lg hover:scale-105 transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed neon-glow-box"
                        >
                            {isLoading ? 'Generating...' : 'Generate Image'}
                        </button>
                        {error && <p className="text-red-400 text-center mt-4">{error}</p>}
                    </div>
                    {/* Right: Output */}
                    <div className="bg-gray-900/50 border border-cyan-500/30 rounded-xl p-6 backdrop-blur-sm flex items-center justify-center min-h-[400px] lg:min-h-full neon-glow-box">
                        {generatedImage ? (
                            <div className="w-full">
                                <h2 className="text-2xl font-bold text-center mb-4 neon-glow-text">Generated Photoshoot</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                                    <div className="text-center">
                                        <h3 className="text-lg text-cyan-200 mb-2">Original Product</h3>
                                        <img src={productImagePreview!} alt="Original Product" className="rounded-lg w-full object-contain max-h-96"/>
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-lg text-cyan-200 mb-2">AI Generated</h3>
                                        <div className="relative">
                                            <img src={generatedImage} alt="Generated" className="rounded-lg w-full object-contain max-h-96" />
                                            <p className="absolute bottom-2 right-4 text-xl font-bold text-white neon-glow-text pointer-events-none" style={{ textShadow: '1px 1px 5px rgba(0,0,0,0.8)' }}>
                                                WAII
                                            </p>
                                        </div>
                                    </div>
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
