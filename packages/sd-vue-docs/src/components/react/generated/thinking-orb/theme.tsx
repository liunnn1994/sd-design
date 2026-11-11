/** @jsxImportSource react */
import { ThemeProvider, ThinkingOrb } from '@sdata/web-react';

export default function Example() {
  return (
    <>
      <div data-v-c1cc616f="" className={'theme-grid'}>
        <ThemeProvider data-v-c1cc616f="" themeMode={'light'}>
          <div data-v-c1cc616f="" className={'theme-panel theme-panel--light'}>
            <ThinkingOrb data-v-c1cc616f="" theme={'auto'} state={'connecting'} />
            <span data-v-c1cc616f="">{'浅色模式'}</span>
          </div>
        </ThemeProvider>
        <ThemeProvider data-v-c1cc616f="" themeMode={'dark'}>
          <div data-v-c1cc616f="" className={'theme-panel theme-panel--dark'}>
            <ThinkingOrb data-v-c1cc616f="" theme={'auto'} state={'connecting'} />
            <span data-v-c1cc616f="">{'深色模式'}</span>
          </div>
        </ThemeProvider>
      </div>
      <style>
        {
          '\n.theme-grid[data-v-c1cc616f] {\n    display: grid;\n    grid-template-columns: repeat(2, minmax(0, 1fr));\n    gap: 12px;\n}\n.theme-panel[data-v-c1cc616f] {\n    display: grid;\n    gap: 12px;\n    justify-items: center;\n    padding: 24px;\n    border: 1px solid var(--sd-color-border-2);\n    border-radius: 8px;\n}\n.theme-panel--light[data-v-c1cc616f] {\n    color: rgb(29 33 41);\n    background: #fff;\n}\n.theme-panel--dark[data-v-c1cc616f] {\n    color: rgb(255 255 255 / 90%);\n    background: #17171a;\n}\n'
        }
      </style>
    </>
  );
}
