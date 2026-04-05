import { motion } from "framer-motion";

const shapes = [
  { size: 300, x: "10%", y: "20%", duration: 20, delay: 0, color: "hsl(var(--primary) / 0.08)" },
  { size: 200, x: "80%", y: "10%", duration: 25, delay: 2, color: "hsl(var(--coral) / 0.08)" },
  { size: 250, x: "70%", y: "60%", duration: 22, delay: 4, color: "hsl(var(--mint) / 0.08)" },
  { size: 180, x: "20%", y: "70%", duration: 18, delay: 1, color: "hsl(var(--lavender) / 0.08)" },
  { size: 150, x: "50%", y: "40%", duration: 30, delay: 3, color: "hsl(var(--sunshine) / 0.06)" },
  { size: 120, x: "90%", y: "80%", duration: 24, delay: 5, color: "hsl(var(--primary) / 0.06)" },
];

const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: `${Math.random() * 100}%`,
  y: `${Math.random() * 100}%`,
  size: Math.random() * 6 + 2,
  duration: Math.random() * 10 + 15,
  delay: Math.random() * 5,
}));

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Floating gradient blobs */}
      {shapes.map((shape, i) => (
        <motion.div
          key={`blob-${i}`}
          className="absolute rounded-full blur-3xl"
          style={{
            width: shape.size,
            height: shape.size,
            left: shape.x,
            top: shape.y,
            background: shape.color,
          }}
          animate={{
            x: [0, 30, -20, 15, 0],
            y: [0, -25, 15, -10, 0],
            scale: [1, 1.2, 0.9, 1.1, 1],
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            delay: shape.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Floating particles */}
      {particles.map((p) => (
        <motion.div
          key={`particle-${p.id}`}
          className="absolute rounded-full bg-primary/20"
          style={{
            width: p.size,
            height: p.size,
            left: p.x,
            top: p.y,
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, 15, -15, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedBackground;
