import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// The browser restores the previous scroll offset on reload, which reads as
// the hero "scrolling down by itself" (smooth scroll-behavior animates it).
// A single-page portfolio should always reload at the top.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo({ top: 0, behavior: 'instant' });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
