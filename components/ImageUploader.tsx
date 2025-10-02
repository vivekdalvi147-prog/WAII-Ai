
import React, { useEffect, useState } from 'react';
import { UploadIcon, CloseIcon } from './icons';

interface ImageUploaderProps {
  label: string;
  onFileSelect: (file: File) => void;
  previewUrl: string | null;
  onStockSelect?: () => void;
  stockSelectText?: string;
  onClear: () => void;
  onLoadError: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ label, onFileSelect, previewUrl, onStockSelect, stockSelectText, onClear, onLoadError }) => {
  const [hasLoadError, setHasLoadError] = useState(false);
  
  useEffect(() => {
    // Reset error state whenever the preview URL changes
    setHasLoadError(false);
  }, [previewUrl]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleImageError = () => {
    setHasLoadError(true);
    onLoadError();
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-cyan-300 mb-2">{label}</label>
      <div className="w-full h-64 bg-gray-900/50 border-2 border-dashed border-cyan-400/30 rounded-lg flex items-center justify-center relative transition-all duration-300 hover:border-cyan-400 group">
        {previewUrl && !hasLoadError ? (
          <>
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="w-full h-full object-contain rounded-lg p-1" 
              onError={handleImageError}
            />
            <button 
              onClick={onClear} 
              className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white hover:bg-red-500/80 transition-all duration-200 opacity-0 group-hover:opacity-100"
              aria-label="Clear image"
            >
              <CloseIcon />
            </button>
          </>
        ) : (
          <div className="text-center text-gray-400 px-4">
            <UploadIcon className="mx-auto w-12 h-12 text-cyan-400/50" />
            <p>Click to upload</p>
            <p className="text-xs mt-1">(JPG, PNG, WebP)</p>
          </div>
        )}
        <input 
            type="file" 
            accept="image/jpeg, image/png, image/webp" 
            onChange={handleFileChange} 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
            aria-label={`Upload ${label}`}
        />
      </div>
      {onStockSelect && (
         <button onClick={onStockSelect} className="w-full mt-2 text-sm bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 py-2 px-4 rounded-md transition-all duration-300 neon-glow-box">
             {stockSelectText}
         </button>
      )}
    </div>
  );
};