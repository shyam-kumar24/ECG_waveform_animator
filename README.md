# ECG Waveform Animation

This project simulates a real-time ECG (Electrocardiogram) waveform using React and TypeScript. It dynamically generates wave points based on configurable parameters and animates them on an SVG path.

## Tech Stack
- React
- TypeScript
- SVG for rendering
- Custom Hooks (`useECGAnimation`)
- Functional programming style

## 📦 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name

npm install

npm run dev

```


rc/
│
├── hooks/
│   └── useECGAnimation.ts      # Custom hook for animating waveform
│
├── utils/
│   └── ecgMath.ts              # Waveform generation math functions
│
├── types/
│   └── index.ts                # TypeScript interfaces & types
│
├── components/
│   └── ECGDisplay.tsx          # (Optional) SVG wrapper component
