/**
 * Utility functions for image placeholders and optimization
 */

/**
 * Generate a base64 encoded SVG placeholder for images
 * @param width - Width of the placeholder
 * @param height - Height of the placeholder
 * @param bgColor - Background color (hex without #)
 * @returns Base64 encoded data URL
 */
export function generatePlaceholder(
  width: number = 400,
  height: number = 300,
  bgColor: string = 'f3f4f6'
): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#${bgColor}"/>
    </svg>
  `;
  
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Generate a shimmer effect placeholder for loading states
 * @param width - Width of the placeholder
 * @param height - Height of the placeholder
 * @returns Base64 encoded data URL with shimmer effect
 */
export function generateShimmerPlaceholder(
  width: number = 400,
  height: number = 300
): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#e5e7eb;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#f3f4f6;stop-opacity:1" />
          <animate attributeName="x1" from="-100%" to="100%" dur="2s" repeatCount="indefinite" />
          <animate attributeName="x2" from="0%" to="200%" dur="2s" repeatCount="indefinite" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#shimmer)"/>
    </svg>
  `;
  
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Common placeholder data URLs for different aspect ratios
 */
export const PLACEHOLDERS = {
  card: generatePlaceholder(400, 300, 'f3f4f6'),
  detail: generatePlaceholder(1200, 400, 'f3f4f6'),
  square: generatePlaceholder(400, 400, 'f3f4f6'),
  wide: generatePlaceholder(800, 300, 'f3f4f6'),
} as const;

/**
 * Shimmer placeholders for loading states
 */
export const SHIMMER_PLACEHOLDERS = {
  card: generateShimmerPlaceholder(400, 300),
  detail: generateShimmerPlaceholder(1200, 400),
  square: generateShimmerPlaceholder(400, 400),
  wide: generateShimmerPlaceholder(800, 300),
} as const;
