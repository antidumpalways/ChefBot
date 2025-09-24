"use client";

import { useEffect, useRef } from 'react';

interface AnimatedFoodBackgroundProps {
  className?: string;
}

export default function AnimatedFoodBackground({ className = "" }: AnimatedFoodBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Food emojis to animate
    const foodEmojis = ['🍎', '🥕', '🍞', '🧀', '🥛', '🍳', '🥗', '🍝', '🍕', '🍰'];
    const particles: Array<{
      emoji: string;
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
    }> = [];

    // Create particles
    for (let i = 0; i < 20; i++) {
      particles.push({
        emoji: foodEmojis[Math.floor(Math.random() * foodEmojis.length)],
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 20 + 10,
        opacity: Math.random() * 0.3 + 0.1
      });
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Draw emoji
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        ctx.font = `${particle.size}px Arial`;
        ctx.fillText(particle.emoji, particle.x, particle.y);
        ctx.restore();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{ background: 'transparent' }}
    />
  );
}














