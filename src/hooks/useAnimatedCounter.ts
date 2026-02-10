import { useState, useEffect, useRef } from 'react';

export function useAnimatedCounter(target: number, duration: number = 600) {
  const [current, setCurrent] = useState(target);
  const animationRef = useRef<number>();
  const prevTarget = useRef(target);

  useEffect(() => {
    if (prevTarget.current === target) return;
    
    const start = prevTarget.current;
    const diff = target - start;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(start + diff * eased);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setCurrent(target);
        prevTarget.current = target;
      }
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [target, duration]);

  // Initialize on first render
  useEffect(() => {
    setCurrent(target);
    prevTarget.current = target;
  }, []);

  return current;
}
