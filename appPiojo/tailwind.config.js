/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Base colors
        background: '#0a0a0f',
        foreground: '#e5e5e5',
        card: '#1a1a24',
        border: '#2a2a3a',
        
        // Primary palette
        primary: '#00d4ff',
        secondary: '#1e1e2e',
        accent: '#ff00ff',
        
        // Neon/Cyber theme
        'neon-cyan': '#00ffff',
        'neon-magenta': '#ff00ff',
        'neon-yellow': '#ffff00',
        'neon-green': '#00ff88',
        'neon-pink': '#ff0080',
        
        // Friendly colors
        coral: '#ff6b6b',
        sunshine: '#ffd93d',
        mint: '#6bcb77',
        lavender: '#a66cff',
        'warm-brown': '#8b5a2b',
        
        // Status colors
        success: '#00ff88',
        warning: '#ffff00',
        error: '#ff4444',
        info: '#00d4ff',
      },
      fontFamily: {
        display: ['Orbitron', 'Fredoka', 'sans-serif'],
        body: ['Rajdhani', 'Nunito', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
