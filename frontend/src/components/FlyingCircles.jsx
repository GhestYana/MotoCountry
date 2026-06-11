import React, { useEffect, useState } from 'react';
import './FlyingCircles.css';

const FlyingCircles = () => {
  const [circles, setCircles] = useState([]);

  useEffect(() => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';

    const newCircles = Array.from({ length: isLight ? 18 : 25 }).map((_, i) => ({
      id: i,
      size: isLight
        ? Math.random() * 280 + 150   // більші на світлій темі
        : Math.random() * 200 + 100,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: Math.random() * 25 + 20,
      delay: Math.random() * 5,
      opacity: isLight
        ? Math.random() * 0.25 + 0.35  // помітніші на світлій темі
        : Math.random() * 0.3 + 0.2,
    }));
    setCircles(newCircles);
  }, []);

  return (
    <div className="flying-circles-container">
      {circles.map((c) => (
        <div
          key={c.id}
          className="flying-circle"
          style={{
            width: `${c.size}px`,
            height: `${c.size}px`,
            left: `${c.left}%`,
            top: `${c.top}%`,
            animationDuration: `${c.duration}s`,
            animationDelay: `${c.delay}s`,
            opacity: c.opacity,
          }}
        />
      ))}
    </div>
  );
};

export default FlyingCircles;
