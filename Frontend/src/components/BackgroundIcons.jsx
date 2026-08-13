import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const icons = ['📚', '🖋️', '🎓', '👓', '📜', '📖', '📝', '✒️'];

export default function BackgroundIcons() {
  const [elements, setElements] = useState([]);

  useEffect(() => {
    // Generate random positions for the icons once on mount
    const generated = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      icon: icons[Math.floor(Math.random() * icons.length)],
      x: Math.random() * 100, // random percentage for left
      y: Math.random() * 100, // random percentage for top
      duration: 15 + Math.random() * 20, // random animation duration (15s to 35s)
      delay: Math.random() * 5, // random start delay
    }));
    setElements(generated);
  }, []);

  return (
    <div className="floating-bg">
      {elements.map((el) => (
        <motion.div
          key={el.id}
          className="floating-icon"
          style={{ left: `${el.x}vw`, top: `${el.y}vh` }}
          animate={{
            y: [0, -30, 0, 30, 0],
            x: [0, 20, 0, -20, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: el.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: el.delay,
          }}
        >
          {el.icon}
        </motion.div>
      ))}
    </div>
  );
}
