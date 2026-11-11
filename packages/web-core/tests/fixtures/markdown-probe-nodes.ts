const text = (content: string) => ({ type: 'text', content, raw: content });
const paragraph = (content: string) => ({
  type: 'paragraph',
  children: [text(content)],
  raw: content,
});
export const markdownProbeNodes = [
  { type: 'probe-fixture', raw: 'Measured' },
  paragraph('Measured words across lines '.repeat(12)),
  {
    type: 'paragraph',
    children: [text('First'), { type: 'hardbreak', raw: '\n' }, text('Second')],
    raw: 'First\nSecond',
  },
  {
    type: 'paragraph',
    children: [{ type: 'strong', children: [text('Strong')], raw: '**Strong**' }],
    raw: '**Strong**',
  },
  {
    type: 'heading',
    level: 2,
    children: [text('A heading that wraps over several lines '.repeat(4))],
    raw: '## Long heading',
  },
  {
    type: 'list',
    ordered: false,
    items: [
      {
        type: 'list_item',
        children: [paragraph('First list item '.repeat(10))],
        raw: '- First item',
      },
      {
        type: 'list_item',
        children: [paragraph('Second list item '.repeat(10))],
        raw: '- Second item',
      },
    ],
    raw: '- First item\n- Second item',
  },
  {
    type: 'list',
    ordered: false,
    items: [
      {
        type: 'list_item',
        children: [
          paragraph('Nested'),
          { type: 'code_block', code: 'x', language: 'text', raw: 'x' },
        ],
        raw: '- Nested',
      },
    ],
    raw: '- Nested',
  },
  {
    type: 'paragraph',
    children: [{ type: 'emoji', name: '🙂', raw: ':smile:' }, text(' Emoji')],
    raw: ':smile: Emoji',
  },
  { type: 'heading', level: 6, children: [text('Small heading')], raw: '###### Small heading' },
  paragraph(`${'W'.repeat(44)}il`),
];
