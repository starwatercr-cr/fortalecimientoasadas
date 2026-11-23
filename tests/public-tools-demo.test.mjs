import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import test from 'node:test';
import { renderPublicToolsDemo } from '../scripts/public-tools-demo.mjs';
import { AREAS, TOOLS } from '../public/tools-catalog.js';

const read = file => readFile(new URL('../' + file, import.meta.url), 'utf8');

test('el botón público abre un catálogo independiente y los accesos existentes siguen igual', async () => {
 const [platform, legacy, config] = await Promise.all(['public/plataforma.html','public/herramientas-programa.html','netlify.toml'].map(read));
 assert.match(platform, /href="\/catalogo-herramientas">Ver todas las herramientas<\/a>/);
 assert.match(config, /from = "\/catalogo-herramientas"\s+to = "\/catalogo-herramientas.html"\s+status = 200/);
 assert.match(platform, /href=(["'])\/acceso\1/);
 assert.match(legacy, /http-equiv="refresh" content="0; url=acceso\.html"/i);
 assert.match(config, /from = "\/herramientas.html"\s+to = "\/\.netlify\/functions\/gateway\?file=herramientas.html"\s+status = 200\s+force = true/);
});

test('el catálogo cubre todas las áreas y herramientas con ejemplos; no carga APIs ni enlaza módulos privados', () => {
 const html = renderPublicToolsDemo();
 assert.deepEqual([...html.matchAll(/data-demo-tool="([^"]+)"/g)].map(m => m[1]).sort(), TOOLS.map(t => t.id).sort());
 assert.equal((html.match(/Ejemplo ficticio ·/g) || []).length, TOOLS.length);
 assert.equal((html.match(/Vista ilustrativa · Datos ficticios/g) || []).length, AREAS.length);
 const hrefs = [...html.matchAll(/\bhref="([^"]+)"/g)].map(m => m[1]);
 assert.deepEqual(hrefs, [
  'https://solucionesstarwater.com/catalogo-herramientas', '/catalogo-herramientas.css',
  '#contenido', '/', '/acceso', '/plataforma',
  ...AREAS.map(a => '#' + a.id), '/acceso?prueba=registro'
 ]);
 for (const area of AREAS) assert.ok(html.includes('id="' + area.id + '"'));
 assert.doesNotMatch(html, /<(?:script|iframe|form)\b|\/api\/|\.netlify\/functions/);
});
