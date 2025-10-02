import React from 'react';

export const ParticleBackground: React.FC = () => {
    const particles = Array.from({ length: 50 });
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
