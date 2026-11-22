import {readFile} from 'node:fs/promises';

// In the browser, calidad.js is served at the site root. For Node tests,
// resolve its imports against this checkout without changing production URLs.
const source=await readFile(new URL('../private/calidad.js',import.meta.url),'utf8');
const code=source
  .replaceAll("from './water-parameters.js'", `from '${new URL('../private/water-parameters.js',import.meta.url).href}'`)
  .replaceAll("from '/quality-import.mjs'", `from '${new URL('../public/quality-import.mjs',import.meta.url).href}'`);
export const {buildQualityWord,compactQualityResult,filledQualityRows,qualityWarningsForContext}=await import('data:text/javascript;charset=utf-8,'+encodeURIComponent(code));
