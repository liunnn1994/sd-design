export const markdownCodeHeightNodes = [
  { type: 'fixture-height', raw: '' },
  ...[
    { code: 'one\ntwo\n' },
    { code: 'one\ntwo\n', loading: true },
    { code: 'A'.repeat(80) },
    { code: '\t中文abcdef'.repeat(10) },
    {
      code: '',
      diff: true,
      originalCode: 'A'.repeat(100),
      updatedCode: 'B'.repeat(60) + '\nextra',
      raw: '--- a\n+++ b\n@@ -1 +1 @@\n-old\n+new\n+extra',
    },
    { code: '--- a\n+++ b\n-old\n+new\n same', raw: '--- a\n+++ b\n-old\n+new\n same', diff: true },
    { code: '' },
    { code: 'line\n'.repeat(100) },
  ].map((node) => ({ type: 'code_block', raw: '', language: 'txt', ...node })),
];
export const markdownCodeHeightScenarios = [
  { name: 'stream', pre: false, options: {}, props: {} },
  { name: 'pre', pre: true, options: {}, props: {} },
  { name: 'scroll', pre: true, options: { overflow: 'scroll' as const }, props: {} },
  {
    name: 'no-header',
    pre: true,
    options: {},
    props: { showHeader: false, showLineNumbers: false },
  },
  {
    name: 'configured',
    pre: true,
    options: {
      fontSize: 16,
      lineHeight: 28,
      padding: 12,
      maxHeight: 190,
      tabSize: 8,
      diffStyle: 'unified' as const,
    },
    props: {},
  },
];
