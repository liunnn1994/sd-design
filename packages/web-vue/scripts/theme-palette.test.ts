import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

// Existing light/dark outputs, captured before localizing the palette algorithm.
const fixtures = [
  {
    color: '#165dff',
    light: [
      '232, 243, 255',
      '190, 218, 255',
      '148, 191, 255',
      '106, 161, 255',
      '64, 128, 255',
      '22, 93, 255',
      '14, 66, 210',
      '7, 44, 166',
      '3, 26, 121',
      '0, 13, 77',
    ],
    dark: [
      '0, 13, 77',
      '4, 27, 121',
      '14, 50, 166',
      '29, 77, 210',
      '48, 111, 255',
      '60, 126, 255',
      '104, 159, 255',
      '147, 190, 255',
      '190, 218, 255',
      '234, 244, 255',
    ],
  },
  {
    color: '#00b42a',
    light: [
      '232, 255, 234',
      '175, 240, 181',
      '123, 225, 136',
      '76, 210, 99',
      '35, 195, 67',
      '0, 180, 42',
      '0, 154, 41',
      '0, 128, 38',
      '0, 102, 34',
      '0, 77, 28',
    ],
    dark: [
      '0, 77, 28',
      '4, 102, 37',
      '10, 128, 45',
      '18, 154, 55',
      '29, 180, 64',
      '39, 195, 70',
      '80, 210, 102',
      '126, 225, 139',
      '178, 240, 183',
      '235, 255, 236',
    ],
  },
  {
    color: '#ff7d00',
    light: [
      '255, 247, 232',
      '255, 228, 186',
      '255, 207, 139',
      '255, 182, 93',
      '255, 154, 46',
      '255, 125, 0',
      '210, 95, 0',
      '166, 69, 0',
      '121, 46, 0',
      '77, 27, 0',
    ],
    dark: [
      '77, 27, 0',
      '121, 48, 4',
      '166, 75, 10',
      '210, 105, 19',
      '255, 141, 31',
      '255, 150, 38',
      '255, 179, 87',
      '255, 205, 135',
      '255, 227, 184',
      '255, 247, 232',
    ],
  },
  {
    color: '#f53f3f',
    light: [
      '255, 236, 232',
      '253, 205, 197',
      '251, 172, 163',
      '249, 137, 129',
      '247, 101, 96',
      '245, 63, 63',
      '203, 39, 45',
      '161, 21, 30',
      '119, 8, 19',
      '77, 0, 10',
    ],
    dark: [
      '77, 0, 10',
      '119, 6, 17',
      '161, 22, 31',
      '203, 46, 52',
      '245, 78, 78',
      '247, 105, 101',
      '249, 141, 134',
      '251, 176, 167',
      '253, 209, 202',
      '255, 240, 236',
    ],
  },
  {
    color: '#808080',
    light: [
      '255, 255, 255',
      '230, 230, 230',
      '204, 204, 204',
      '179, 179, 179',
      '153, 153, 153',
      '128, 128, 128',
      '115, 86, 87',
      '102, 51, 55',
      '89, 22, 29',
      '77, 0, 10',
    ],
    dark: [
      '77, 0, 10',
      '89, 18, 25',
      '102, 41, 46',
      '115, 69, 71',
      '128, 102, 102',
      '153, 153, 153',
      '179, 175, 175',
      '204, 196, 196',
      '230, 216, 216',
      '255, 235, 235',
    ],
  },
  {
    color: '#000000',
    light: [
      '255, 255, 255',
      '204, 204, 204',
      '153, 153, 153',
      '102, 102, 102',
      '51, 51, 51',
      '0, 0, 0',
      '0, 0, 0',
      '0, 0, 0',
      '0, 0, 0',
      '0, 0, 0',
    ],
    dark: [
      '0, 0, 0',
      '0, 0, 0',
      '0, 0, 0',
      '0, 0, 0',
      '0, 0, 0',
      '51, 51, 51',
      '102, 100, 100',
      '153, 147, 147',
      '204, 192, 192',
      '255, 235, 235',
    ],
  },
  {
    color: '#ffffff',
    light: [
      '255, 255, 255',
      '255, 255, 255',
      '255, 255, 255',
      '255, 255, 255',
      '255, 255, 255',
      '255, 255, 255',
      '210, 158, 160',
      '166, 83, 88',
      '121, 30, 39',
      '77, 0, 10',
    ],
    dark: [
      '77, 0, 10',
      '121, 24, 34',
      '166, 66, 72',
      '210, 126, 129',
      '255, 204, 204',
      '255, 255, 255',
      '255, 250, 250',
      '255, 245, 245',
      '255, 240, 240',
      '255, 235, 235',
    ],
  },
  {
    color: '#123456',
    light: [
      '232, 247, 255',
      '170, 203, 221',
      '118, 160, 187',
      '75, 120, 154',
      '42, 83, 120',
      '18, 52, 86',
      '13, 46, 84',
      '9, 40, 81',
      '4, 34, 79',
      '0, 28, 77',
    ],
    dark: [
      '0, 28, 77',
      '3, 33, 79',
      '10, 40, 81',
      '17, 48, 84',
      '24, 55, 86',
      '43, 84, 120',
      '77, 121, 154',
      '120, 161, 187',
      '172, 204, 221',
      '234, 248, 255',
    ],
  },
];

test('theme seeds retain their palettes in a standalone browser ESM module', async () => {
  const result = await build({
    configFile: false,
    logLevel: 'silent',
    build: {
      write: false,
      minify: false,
      lib: {
        entry: fileURLToPath(
          new URL('../components/config-provider/algorithms.ts', import.meta.url),
        ),
        formats: ['es'],
      },
      // Bare imports must remain external, as they do in the online editor.
      rolldownOptions: { external: (id) => !id.startsWith('.') && !id.startsWith('/') },
    },
  });
  const bundle = Array.isArray(result) ? result[0] : result;
  assert.ok('output' in bundle);
  const { output } = bundle;
  const entry = output.find((chunk) => chunk.type === 'chunk' && chunk.isEntry);
  assert.ok(entry && entry.type === 'chunk');
  assert.deepEqual(entry.imports, [], 'theme palette must not need external runtime packages');
  const { deriveThemeTokens } = await import(
    `data:text/javascript;base64,${Buffer.from(entry.code).toString('base64')}`
  );
  for (const { color, light, dark } of fixtures) {
    for (const isDark of [false, true]) {
      const tokens = deriveThemeTokens({
        seed: { primary: color, success: color, warning: color, danger: color },
        algorithm: isDark ? ['dark'] : [],
      });
      for (const name of ['primary', 'link', 'success', 'warning', 'danger']) {
        assert.deepEqual(
          Array.from({ length: 10 }, (_, i) => tokens[`${name}-${i + 1}`]),
          isDark ? dark : light,
          `${color} ${name} dark=${isDark}`,
        );
      }
    }
  }
  assert.deepEqual(deriveThemeTokens({ seed: { primary: 'invalid' } }), {});
});
