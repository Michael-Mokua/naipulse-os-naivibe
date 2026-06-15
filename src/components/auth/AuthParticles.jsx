import { useEffect } from 'react';

const COLORS = ['#00FF88', '#7B2FFF', '#FF2D78', '#FFD600', '#00D4FF'];

export default function AuthParticles() {
  useEffect(() => {
    const particles = Array.from({ length: 20 }, (_, index) => {
      const element = document.createElement('div');
      element.className = 'auth-particle';
      const size = Math.random() * 4 + 2;
      element.style.cssText = `
        width:${size}px;
        height:${size}px;
        left:${Math.random() * 100}%;
        background:${COLORS[Math.floor(Math.random() * COLORS.length)]};
        opacity:0.3;
        animation-duration:${8 + Math.random() * 12}s;
        animation-delay:${Math.random() * 10}s;
      `;
      document.body.appendChild(element);
      return element;
    });

    return () => {
      particles.forEach((particle) => particle.remove());
    };
  }, []);

  return null;
}
