export const markdownPreNode = {
  type: 'code_block',
  language: 'typescript',
  loading: false,
  code: `const text = "${'x'.repeat(100)}";\nsecond\n`,
  raw: '```typescript /src/file.ts\ncode\n```',
};
export const markdownPreScenarios = [
  { name: 'default', options: {}, props: {}, dark: false },
  {
    name: 'configured',
    options: {
      fontSize: 16,
      lineHeight: 28,
      fontFamily: 'Courier New',
      padding: 12,
      maxHeight: 150,
      tabSize: 8,
    },
    props: {},
    dark: true,
  },
  {
    name: 'scroll',
    options: { overflow: 'scroll' as const },
    props: { showLineNumbers: false },
    dark: false,
  },
  { name: 'bare', options: {}, props: { showHeader: false, showLineNumbers: false }, dark: false },
  { name: 'plain-title', options: {}, props: {}, dark: false },
];
export const markdownPreStyleKeys = [
  'font-family',
  'font-size',
  'line-height',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'max-height',
  'white-space',
  'overflow-wrap',
  'overflow-x',
  'background-color',
  'color',
  'border-top-width',
  'margin-top',
  'tab-size',
] as const;
