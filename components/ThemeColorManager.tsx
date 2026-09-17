import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { convertRgbaToRgb, rgbToHex } from '../utils/colorUtils';

const ThemeColorManager = ({ themeMode }: { themeMode: 'light' | 'dark' | 'system' }) => {
  const location = useLocation();

  useEffect(() => {
    let animationFrameId: number;
    let lastColor = '';

    const updateThemeColor = () => {
      const isDark = document.documentElement.classList.contains('dark');
      let targetColor = isDark ? '#120c22' : '#f5f3ff'; // default fallback

      // Try to find the topmost element's background color
      try {
        let el = document.elementFromPoint(window.innerWidth / 2, 5) as HTMLElement | null;
        
        while (el) {
          const bg = window.getComputedStyle(el).backgroundColor;
          if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
            if (bg.startsWith('rgba(')) {
                targetColor = rgbToHex(convertRgbaToRgb(bg, isDark));
            } else {
                targetColor = rgbToHex(bg);
            }
            break;
          }
          el = el.parentElement;
        }
      } catch (e) {
        // Fallback on error
      }

      if (targetColor !== lastColor) {
        lastColor = targetColor;
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (!metaThemeColor) {
          metaThemeColor = document.createElement('meta');
          metaThemeColor.setAttribute('name', 'theme-color');
          document.head.appendChild(metaThemeColor);
        }
        
        // Remove existing dual meta tags if present
        const existingMetas = document.querySelectorAll('meta[name="theme-color"]');
        existingMetas.forEach((meta, idx) => {
          if (idx > 0) meta.remove();
          else {
            meta.removeAttribute('media');
            meta.setAttribute('content', targetColor);
          }
        });
      }
    };

    // Run on initial mount and route change
    updateThemeColor();
    // Sometimes elements load asynchronously
    const timeout = setTimeout(updateThemeColor, 300);

    // Setup scroll listener to dynamically update
    // Many scroll containers exist (main, window). Just listen on both in capture phase
    const handleScroll = () => {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(updateThemeColor);
    };

    window.addEventListener('scroll', handleScroll, true);

    return () => {
        clearTimeout(timeout);
        window.removeEventListener('scroll', handleScroll, true);
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [location.pathname, themeMode]);

  return null;
};

export default ThemeColorManager;
