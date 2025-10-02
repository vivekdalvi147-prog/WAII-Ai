import React from 'react';
import { STOCK_MODELS } from '../constants';

interface StockModelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (url: string) => void;
}

export const StockModelModal: React.FC<StockModelModalProps> = ({ isOpen, onClose, onSelect }) => {
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
