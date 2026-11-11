import type { NodeComponentProps } from 'markstream-react';

import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { MarkdownComponentsContext } from '../../src/markdown-render/context.js';
import { MarkdownRenderer } from '../../src/markdown-render/renderer.js';
import '../../styles/markdown-render.scss';

function Card(props: NodeComponentProps & { 'data-flavor'?: string; 'onclick'?: unknown }) {
  return (
    <section
      className="fixture-card"
      data-dark={String(props.isDark)}
      data-flavor={props['data-flavor']}
      data-unsafe={String('onclick' in props)}
    >
      {props.children}
    </section>
  );
}
const mapping = { 'fixture-card': Card };
const nodes = [
  {
    type: 'fixture-card',
    tag: 'fixture-card',
    raw: '',
    content: '<fixture-card data-flavor="deep">**Deep child**</fixture-card>',
    attrs: [['data-flavor', 'recursive']],
  },
  {
    type: 'fixture-card',
    tag: 'fixture-card',
    raw: '',
    content: 'Ignored content',
    attrs: [
      ['data-flavor', 'AST'],
      ['onclick', 'alert(1)'],
    ],
    children: [
      {
        type: 'heading',
        level: 2,
        raw: '',
        children: [{ type: 'text', content: 'AST child', raw: '' }],
      },
    ],
  },
  {
    type: 'fixture-card',
    tag: 'fixture-card',
    raw: '',
    content: '## Parsed child\n\nFirst\nSecond\n\n<div>Escaped</div>',
    loading: false,
    attrs: [['data-flavor', 'parsed']],
  },
];
function Fixture() {
  const [alternate, setAlternate] = useState(false);
  return (
    <>
      <button onClick={() => setAlternate(!alternate)}>Change config</button>
      <MarkdownComponentsContext value={mapping}>
        <MarkdownRenderer
          nodes={nodes}
          customHtmlTags={['fixture-card']}
          customMarkdownIt={(md) => (alternate ? md.disable('heading') : md.enable('heading'))}
          isDark={!alternate}
          htmlPolicy="escape"
          fade={false}
          smoothStreaming={false}
          batchRendering={false}
          deferNodesUntilVisible={false}
          nodeVirtual={false}
        />
      </MarkdownComponentsContext>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
