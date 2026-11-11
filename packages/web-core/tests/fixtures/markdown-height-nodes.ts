export const markdownHeightNodes = [
  { type: 'fixture-height', raw: '' },
  { type: 'heading', level: 1, raw: '', children: [{ type: 'text', content: 'Title', raw: '' }] },
  { type: 'heading', level: 2, raw: '', children: [{ type: 'text', content: 'Title', raw: '' }] },
  { type: 'paragraph', raw: 'Short', children: [{ type: 'text', content: 'Short', raw: '' }] },
  {
    type: 'paragraph',
    raw: 'x'.repeat(400),
    children: [{ type: 'text', content: 'x'.repeat(400), raw: '' }],
  },
  { type: 'image', raw: '', src: '/height-placeholder-image.svg', alt: 'Image' },
  { type: 'code_block', raw: '', language: 'txt', code: Array(10).fill('x').join('\n') },
  { type: 'thematic_break', raw: '' },
  {
    type: 'list',
    raw: '',
    ordered: false,
    items: Array.from({ length: 3 }, () => ({
      type: 'list_item',
      raw: 'Item',
      children: [{ type: 'text', raw: '', content: 'Item' }],
    })),
  },
  {
    type: 'table',
    raw: '',
    header: {
      cells: [
        { children: [{ type: 'inline_code', code: 'Code' }] },
        { children: [{ type: 'text', content: 'Title' }] },
      ],
    },
    rows: Array.from({ length: 2 }, () => ({
      cells: [
        { children: [{ type: 'text', content: 'Value' }] },
        { children: [{ type: 'text', content: 'Value' }] },
      ],
    })),
  },
  {
    type: 'html_block',
    raw: '<details><summary>Title</summary>Hidden</details>',
    content: '<details><summary>Title</summary>Hidden</details>',
  },
];
