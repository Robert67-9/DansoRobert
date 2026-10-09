/**
 * Utility to replace solid background (such as solid red passport photo background)
 * with a clean, professional studio backdrop while preserving the user's exact face,
 * hair, suit, and clothing.
 */

export type BackdropTheme = 'slate' | 'charcoal' | 'light' | 'transparent' | 'original';

type BackdropGradient = {
  inner: string;
  middle: string;
  outer: string;
  innerRadius: number;
  middleStop: number;
  outerRadius: number;
};

const BACKDROP_GRADIENTS: Record<Exclude<BackdropTheme, 'transparent' | 'original'>, BackdropGradient> = {
  slate: {
    inner: '#334155', // slate-700
    middle: '#1e293b', // slate-800
    outer: '#0f172a', // slate-900
    innerRadius: 0.1,
    middleStop: 0.5,
    outerRadius: 0.8,
  },
  charcoal: {
    inner: '#27272a', // zinc-800
    middle: '#18181b', // zinc-900
    outer: '#09090b', // zinc-950
    innerRadius: 0.05,
    middleStop: 0.6,
    outerRadius: 0.75,
  },
  light: {
    inner: '#f8fafc', // slate-50
    middle: '#e2e8f0', // slate-200
    outer: '#cbd5e1', // slate-300
    innerRadius: 0.05,
    middleStop: 0.7,
    outerRadius: 0.8,
  },
};

const paintBackdrop = (bgCtx: CanvasRenderingContext2D, width: number, height: number, theme: BackdropTheme) => {
  if (theme === 'transparent' || theme === 'original') return;
  const gradient = BACKDROP_GRADIENTS[theme];
  if (!gradient) return;

  const fill = bgCtx.createRadialGradient(
    width * 0.5, height * 0.35, width * gradient.innerRadius,
    width * 0.5, height * 0.5, width * gradient.outerRadius
  );
  fill.addColorStop(0, gradient.inner);
  fill.addColorStop(gradient.middleStop, gradient.middle);
  fill.addColorStop(1, gradient.outer);
  bgCtx.fillStyle = fill;
  bgCtx.fillRect(0, 0, width, height);
};

export function processPassportPhoto(
  imageSource: string,
  theme: BackdropTheme = 'slate',
  featherRadius: number = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (theme === 'original') {
      resolve(imageSource);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (!ctx) {
        resolve(imageSource);
        return;
      }

      // Draw original image
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;

      // Create a background canvas for the replacement
      const bgCanvas = document.createElement('canvas');
      bgCanvas.width = width;
      bgCanvas.height = height;
      const bgCtx = bgCanvas.getContext('2d');

      if (!bgCtx) {
        resolve(imageSource);
        return;
      }

      // Render desired studio backdrop (transparent themes keep the canvas blank)
      paintBackdrop(bgCtx, width, height, theme);

      const bgData = bgCtx.getImageData(0, 0, width, height).data;

      // Chroma key calculation for vibrant red background
      // Red background has: high R (> 150), R substantially higher than G and B
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Detection metric: red dominance over green and blue
        const maxOther = Math.max(g, b);
        const redDominance = r - maxOther;

        // Strict detection to protect warm skin tones:
        // Pure red background typically has redDominance > 75 and r > 140
        // Whereas skin tones usually have redDominance between 15 and 55 with g around 70-130
        const isRedBackdrop = r > 130 && redDominance > 60 && (g < 110 || r / Math.max(g, 1) > 1.7);

        if (isRedBackdrop) {
          // Calculate blend factor for smooth edges (anti-aliasing)
          const blend = Math.min(1, Math.max(0, (redDominance - 50) / 40));

          if (theme === 'transparent') {
            data[i + 3] = Math.round(data[i + 3] * (1 - blend));
          } else {
            // Blend original pixel with background pixel
            data[i] = Math.round(data[i] * (1 - blend) + bgData[i] * blend);
            data[i + 1] = Math.round(data[i + 1] * (1 - blend) + bgData[i + 1] * blend);
            data[i + 2] = Math.round(data[i + 2] * (1 - blend) + bgData[i + 2] * blend);
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => {
      resolve(imageSource);
    };

    img.src = imageSource;
  });
}
