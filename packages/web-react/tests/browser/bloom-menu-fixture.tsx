import { useEffect, useRef, useState } from 'react';

import type { BloomMenuItem, BloomMenuProps } from '../../src/bloom-menu/types.js';

import { BloomMenu } from '../../src/bloom-menu/index.js';
const initialItems = [
  { value: 'one', label: 'First' },
  { value: 'two', label: 'Second', disabled: true },
  { value: 'three', label: 'Third' },
];
export function BloomMenuFixture() {
  const root = useRef<HTMLDivElement>(null);
  const [refState, setRefState] = useState('');
  const [props, setProps] = useState<Partial<BloomMenuProps>>({});
  const [items, setItems] = useState<BloomMenuItem[]>(initialItems);
  const [mounted, setMounted] = useState(true);
  const [events, setEvents] = useState<string[]>([]);
  const [icons, setIcons] = useState(false);
  const [custom, setCustom] = useState(false);
  useEffect(() => {
    const offset = () => setProps((old) => ({ ...old, offset: { left: 40, top: 20 } }));
    const open = () => setProps((old) => ({ ...old, modelValue: true }));
    const close = () => setProps((old) => ({ ...old, modelValue: false }));
    window.addEventListener('bloom-open', open);
    window.addEventListener('bloom-close', close);
    window.addEventListener('bloom-offset', offset);
    return () => {
      window.removeEventListener('bloom-offset', offset);
      window.removeEventListener('bloom-open', open);
      window.removeEventListener('bloom-close', close);
    };
  }, []);
  const event = (value: string) => setEvents((old) => [...old, value]);
  return (
    <section style={{ padding: '160px', minHeight: 430 }}>
      {mounted && (
        <BloomMenu
          {...props}
          ref={root}
          items={items}
          data-testid="bloom-main"
          onModelValueChange={(value) => event(`update:${value}`)}
          onOpen={() => event('open')}
          onClose={() => event('close')}
          onSelect={(item, index) => event(`select:${item.value}:${index}`)}
          renderTrigger={
            custom
              ? () => (
                  <strong style={{ display: 'inline-block', width: 110 }}>Custom actions</strong>
                )
              : undefined
          }
          renderHeader={
            custom ? ({ close }) => <button onClick={close}>Custom close</button> : undefined
          }
          renderItem={
            custom
              ? ({ item, index }) => (
                  <strong>
                    {index}:{item.label}
                  </strong>
                )
              : undefined
          }
          renderIcon={
            icons
              ? ({ item, index }) => (
                  <i data-testid="bloom-icon">
                    {item.value}:{index}
                  </i>
                )
              : undefined
          }
          empty={custom ? 'Custom empty' : undefined}
        />
      )}
      <button data-testid="bloom-outside" style={{ display: 'block', marginTop: 100 }}>
        Outside menu
      </button>
      <output data-testid="bloom-ref">{refState}</output>
      <output data-testid="bloom-events">{events.join('|')}</output>
      <div>
        <button onClick={() => setRefState(root.current?.tagName ?? 'none')}>Bloom ref</button>
        <button onClick={() => setProps({ modelValue: false })}>Bloom reject open</button>
        <button onClick={() => setProps({ modelValue: true })}>Bloom force open</button>
        <button onClick={() => setProps({})}>Bloom uncontrolled</button>
        <button onClick={() => setProps((old) => ({ ...old, offset: { left: 40, top: 20 } }))}>
          Bloom offset
        </button>
        <button onClick={() => setProps((old) => ({ ...old, columns: 2.9 }))}>Bloom columns</button>
        <button
          onClick={() =>
            setItems([
              { ...initialItems[1], disabled: false },
              { ...initialItems[0], disabled: true },
            ])
          }
        >
          Bloom reorder
        </button>
        <button
          onClick={() =>
            setItems([
              { value: 0, label: 'Zero', icon: <i data-testid="bloom-inline-icon">icon</i> },
              { value: 'none', label: 'None' },
            ])
          }
        >
          Bloom item icons
        </button>
        <button onClick={() => setIcons((value) => !value)}>Bloom render icons</button>
        <button onClick={() => setItems(initialItems.map((item) => ({ ...item, disabled: true })))}>
          Bloom all disabled
        </button>
        <button
          onClick={() => setProps({ style: { position: 'fixed', top: 8, left: 4 }, title: 'Edge' })}
        >
          Bloom edge
        </button>
        <button
          onClick={() =>
            setProps({
              closeAriaLabel: 'Dismiss actions',
              buttonProps: {
                'type': 'primary',
                'shape': 'circle',
                'size': 'large',
                'className': 'custom-bloom-button',
                'style': { opacity: 0.99 },
                'aria-label': 'Commands',
                'onPointerDown': () => event('pointer'),
              },
            })
          }
        >
          Bloom button props
        </button>
        <button onClick={() => setItems([])}>Bloom empty</button>
        <button onClick={() => setCustom((value) => !value)}>Bloom custom</button>
        <button onClick={() => setMounted((value) => !value)}>Bloom mount</button>
      </div>
    </section>
  );
}
