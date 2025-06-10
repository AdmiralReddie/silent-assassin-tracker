
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Mobile viewport configuration
const setMobileViewport = () => {
  const viewport = document.querySelector('meta[name=viewport]');
  if (viewport) {
    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
  }
};

// Initialize mobile optimizations
setMobileViewport();

createRoot(document.getElementById("root")!).render(<App />);
