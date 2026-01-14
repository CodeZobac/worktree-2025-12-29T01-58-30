/**
 * Type declarations for the 'trix' package
 * Trix does not ship with TypeScript declarations
 */

declare module "trix" {
  export const VERSION: string;
  export const config: {
    blockAttributes: Record<string, unknown>;
    textAttributes: Record<string, unknown>;
    toolbar: {
      getDefaultHTML: () => string;
    };
    lang: Record<string, string>;
  };
  
  const trix: {
    VERSION: string;
    config: typeof config;
  };
  
  export default trix;
}
