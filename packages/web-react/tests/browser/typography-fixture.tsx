import { createContext, useContext, useState, useRef } from 'react';

import {
  Typography,
  TypographyParagraph,
  TypographyText,
  TypographyTitle,
} from '../../src/typography/index';
const Label = createContext('fallback');
function Child() {
  return <strong>{useContext(Label)}</strong>;
}
export function TypographyFixture() {
  const [text, setText] = useState('Original');
  const [copied, setCopied] = useState('');
  const [edit, setEdit] = useState('Editable');
  const [events, setEvents] = useState<string[]>([]);
  const [accept, setAccept] = useState(true);
  const [ellipsis, setEllipsis] = useState(true);
  const [short, setShort] = useState(false);
  const [initial, setInitial] = useState(false);
  const [controlled, setControlled] = useState(false);
  const [allowEditing, setAllowEditing] = useState(false);
  const controlledRef = useRef<HTMLElement>(null);
  const [refStatus, setRefStatus] = useState('');
  const log = (event: string) => setEvents((value) => [...value, event]);
  return (
    <section data-testid="typography-fixture">
      <button onClick={() => setInitial(!initial)}>Typography initial</button>
      {initial && (
        <TypographyParagraph editable defaultEditing>
          Initial child text
        </TypographyParagraph>
      )}
      <TypographyParagraph
        data-testid="ty-controlled"
        editable
        editing={controlled}
        ref={controlledRef}
        onEditingChange={(value) => {
          log(`controlled:${value}`);
          if (allowEditing) setControlled(value);
        }}
      >
        Controlled
      </TypographyParagraph>
      <button onClick={() => setAllowEditing(true)}>Typography allow editing</button>
      <button
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setRefStatus(controlledRef.current?.tagName ?? 'null')}
      >
        Typography read ref
      </button>
      <output data-testid="ty-ref">{refStatus}</output>
      <TypographyParagraph
        data-testid="ty-popover"
        ellipsis={{
          showTooltip: { type: 'popover', props: { mouseEnterDelay: 0, title: 'Full source' } },
        }}
        style={{ width: 100 }}
      >
        A long paragraph inside a popover
      </TypographyParagraph>
      <Typography>
        <TypographyTitle heading={3}>Title</TypographyTitle>
        <TypographyParagraph blockquote spacing="close">
          Quote
        </TypographyParagraph>
        <TypographyText
          bold
          underline
          delete
          code
          mark={{ color: 'rgb(255, 0, 0)' }}
          type="danger"
          disabled
        >
          Formatting
        </TypographyText>
      </Typography>
      <Label value={text}>
        <TypographyParagraph data-testid="ty-copy" copyable copyDelay={500} onCopy={setCopied}>
          <Child />
        </TypographyParagraph>
        <TypographyParagraph data-testid="ty-context-clamp" ellipsis copyable onCopy={setCopied}>
          <Child />
        </TypographyParagraph>
      </Label>
      <output data-testid="ty-copied">{copied}</output>
      <button onMouseDown={(event) => event.preventDefault()} onClick={() => setText('Updated')}>
        Typography update
      </button>
      <TypographyParagraph data-testid="ty-keyed">
        <span>{text}</span>
        <input aria-label="Typography draft" />
      </TypographyParagraph>
      <TypographyParagraph
        data-testid="ty-edit"
        editable
        editText={edit}
        onEditingChange={(value) => log(`editing:${value}`)}
        onEditStart={() => log('start')}
        onEditEnd={() => log('end')}
        onEditTextChange={(value) => log(`text:${value}`)}
        onChange={(value) => {
          log(`change:${value}`);
          if (accept) setEdit(value);
        }}
      >
        {edit}
      </TypographyParagraph>
      <button onClick={() => setAccept(!accept)}>Typography accept</button>
      <output data-testid="ty-events">{events.join('|')}</output>
      <TypographyParagraph
        data-testid="ty-clamp"
        ellipsis={ellipsis && { rows: 1, expandable: true, suffix: ' suffix' }}
        mark
        code
        style={{ width: 180 }}
      >
        A long paragraph that should overflow the narrow container. More content here.
      </TypographyParagraph>
      <button onClick={() => setEllipsis(!ellipsis)}>Typography ellipsis</button>
      <TypographyParagraph
        data-testid="ty-tooltip"
        ellipsis={{ showTooltip: { type: 'tooltip', props: { mouseEnterDelay: 0 } } }}
        style={{ width: 100 }}
      >
        {short ? 'short' : 'The full long tooltip source content'}
      </TypographyParagraph>
      <button onClick={() => setShort(!short)}>Typography short</button>
      <TypographyParagraph
        data-testid="ty-custom"
        copyable
        copyText="explicit"
        onCopy={setCopied}
        copyIcon={(value) => (value ? 'done' : 'copy-custom')}
        copyTooltip={(value) => (value ? 'finished tooltip' : 'custom tooltip')}
      >
        Displayed
      </TypographyParagraph>
      <TypographyParagraph
        data-testid="ty-escape"
        ellipsis
        mark={{ color: 'red" data-injected="yes' }}
      >
        literal &lt;img src=x onerror=alert(1)&gt;
      </TypographyParagraph>
    </section>
  );
}
