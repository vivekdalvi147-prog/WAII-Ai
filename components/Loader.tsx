import React from 'react';

export const Loader: React.FC = () => (
    <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
        <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin neon-glow-box"></div>
        <p className="mt-4 text-cyan-300 text-lg neon-glow-text">Generating Your Vision...</p>
    </div>
);
