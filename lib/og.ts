import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

// Used by the generated link-preview image (app/opengraph-image.tsx, via next/og).
// Same concert-night palette as app/globals.css.
export const BRAND = {
  night: '#160a22',
  violetGlow: '#3a1566',
  teal: '#3cc6c4',
  cream: '#fbf1e3',
};

// next/og can't read the woff2 files next/font uses, so load the .woff files from @fontsource.
function fontsource(pkg: string, file: string) {
  return readFile(join(process.cwd(), 'node_modules/@fontsource', pkg, 'files', file));
}

export const loadRozha = () => fontsource('rozha-one', 'rozha-one-latin-400-normal.woff');
export const loadHanken = () =>
  fontsource('hanken-grotesk', 'hanken-grotesk-latin-400-normal.woff');
