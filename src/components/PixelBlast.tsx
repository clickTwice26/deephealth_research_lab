'use client';

import React, { useEffect, useRef } from 'react';

interface PixelBlastProps {
    pixelSize?: number;
    gap?: number;
    speed?: number;
    colors?: string[];
}

export default function PixelBlast({
    pixelSize = 40,
    gap = 2,
    speed = 0.1,
    colors = ['#3b82f6', '#06b6d4', '#14b8a6', '#6366f1'] // Blue, Cyan, Teal, Indigo
}: PixelBlastProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const mouseRef = useRef({ x: -1000, y: -1000 });
    const pixelsRef = useRef<any[]>([]);
    const animationRef = useRef<number | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const init = () => {
            const { width, height } = container.getBoundingClientRect();
            // Handle high DPI displays
            const dpr = window.devicePixelRatio || 1;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            const cols = Math.ceil(width / (pixelSize + gap));
            const rows = Math.ceil(height / (pixelSize + gap));

            pixelsRef.current = [];
            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    pixelsRef.current.push({
                        x: i * (pixelSize + gap),
                        y: j * (pixelSize + gap),
                        baseX: i * (pixelSize + gap),
                        baseY: j * (pixelSize + gap),
                        color: colors[Math.floor(Math.random() * colors.length)],
                        scale: 1,
                        targetScale: 1,
                        distance: 0
                    });
                }
            }
        };

        const animate = () => {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Correct clear rect usage

            // We need to clear based on the actual canvas dimensions, but since we scaled, 
            // we can just clear the whole visible area. 
            // Using canvas.width/height directly works because they are the physical pixel dimensions,
            // and getContext reset transform state on clearRect? No, it doesn't.
            // Actually, standard practice with dpr scaling:
            // ctx.clearRect(0, 0, width, height) in logical coords.
            const width = canvas.width / (window.devicePixelRatio || 1);
            const height = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, width, height);

            pixelsRef.current.forEach((pixel) => {
                // Calculate distance to mouse
                const dx = mouseRef.current.x - (pixel.x + pixelSize / 2);
                const dy = mouseRef.current.y - (pixel.y + pixelSize / 2);
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Interaction radius
                const radius = 150;

                if (distance < radius) {
                    // Calculate blast effect
                    const force = (radius - distance) / radius;
                    const angle = Math.atan2(dy, dx);

                    // Push pixels away
                    pixel.targetScale = 0.5 + force * 0.5; // Scale down slightly when pushed? Or up? Let's scale down.
                    // Actually, let's just do a scale effect without movement first, simpler "blast" of color/size
                    // Or strictly scale:
                    pixel.targetScale = 0.2 + (1 - force) * 0.8; // Shrink near mouse?
                    // Let's try shrinking near mouse to create a "void" or "trail"

                    // Alternative: "Blast" = Explode outwards? 
                    // Let's stick to a pleasing ripple scale effect.
                    // Pixels near mouse shrink, then grow back.
                    pixel.targetScale = 0.4;
                } else {
                    pixel.targetScale = 1;
                }

                // Lerp scale
                pixel.scale += (pixel.targetScale - pixel.scale) * speed;

                // Draw pixel
                ctx.fillStyle = pixel.color;
                // Make them very subtle by default, only fully visible ?? 
                // For white theme, we want light squares.
                // Let's use global alpha or just light colors.
                // Assuming colors passed are vibrant, we might want to reduce opacity.
                ctx.globalAlpha = 0.1 + (1 - pixel.scale) * 0.8; // More visible when shrunk (interacting)

                ctx.beginPath();
                // Draw rounded rect manually or just rect
                // Centered scaling
                const size = pixelSize * pixel.scale;
                const offset = (pixelSize - size) / 2;

                ctx.roundRect(pixel.x + offset, pixel.y + offset, size, size, 4);
                ctx.fill();
                ctx.globalAlpha = 1;

            });

            animationRef.current = requestAnimationFrame(animate);
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            mouseRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        };

        const handleResize = () => {
            init();
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);

        init();
        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [pixelSize, gap, speed, colors]);

    return (
        <div ref={containerRef} className="absolute inset-0 overflow-hidden bg-white">
            <canvas ref={canvasRef} className="block" />
        </div>
    );
}
