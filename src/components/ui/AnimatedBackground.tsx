import React, { useRef, useEffect } from 'react';

const AnimatedBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const points: { x: number; y: number; vx: number; vy: number }[] = [];
    const pointCount = 100;
    const maxDist = 150;

    for (let i = 0; i < pointCount; i++) {
      points.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.random() * 0.4 - 0.2,
        vy: Math.random() * 0.4 - 0.2,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, width, height);

      for (const p of points) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x > width + 20) p.x = -20;
        if (p.y > height + 20) p.y = -20;
        if (p.x < -20) p.x = width + 20;
        if (p.y < -20) p.y = height + 20;

        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();
      }

      for (let i = 0; i < pointCount; i++) {
        for (let j = i + 1; j < pointCount; j++) {
          const dist = Math.sqrt(
            Math.pow(points[i].x - points[j].x, 2) +
              Math.pow(points[i].y - points[j].y, 2)
          );

          if (dist < maxDist) {
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[j].x, points[j].y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${1 - dist / maxDist})`;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: -1,
        background: '#0F172A',
      }}
    />
  );
};

export default AnimatedBackground;