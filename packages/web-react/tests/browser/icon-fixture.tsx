import { useRef, useState } from 'react';

import { ConfigProvider } from '../../src/config-provider/index.js';
import { Icon, addFromIconFontCn } from '../../src/icon-component/index.js';
import Icons, { iconCatalog, IconPlus } from '../../src/icon/index.js';

const Font = addFromIconFontCn({});
export function IconFixture() {
  const [size, setSize] = useState<number | string | undefined>(24);
  const [rotate, setRotate] = useState(0);
  const [spin, setSpin] = useState(false);
  const [type, setType] = useState<string | undefined>('fixture-small-square');
  const [stroke, setStroke] = useState(false);
  const [gallery, setGallery] = useState(false);
  const [prefix, setPrefix] = useState('sd');
  const [mounted, setMounted] = useState(true);
  const [events, setEvents] = useState<string[]>([]);
  const [Remote, setRemote] = useState<ReturnType<typeof addFromIconFontCn>>();
  const ref = useRef<SVGSVGElement>(null);
  const [refName, setRefName] = useState('');
  const record = (name: string) => setEvents((old) => [...old, name]);
  const [Configured] = useState(() =>
    addFromIconFontCn({
      extraProps: {
        size: 30,
        className: 'configured-icon',
        style: { color: 'red' },
        onClick: () => record('configured'),
      },
    }),
  );
  const loadRemote = () => setRemote(() => addFromIconFontCn({ src: '/react-iconfont.js' }));
  return (
    <section data-testid="icon-fixture" style={{ padding: 24, fontSize: 16 }}>
      <svg width={0} height={0} aria-hidden="true">
        <defs>
          <symbol id="fixture-small-square">
            <rect width={10} height={10} />
          </symbol>
          <symbol id="fixture-large-square">
            <rect width={20} height={20} />
          </symbol>
        </defs>
      </svg>
      <ConfigProvider prefixCls={prefix}>
        {mounted && (
          <IconPlus
            ref={ref}
            data-testid="icon-generated"
            aria-label="Add"
            size={size}
            rotate={rotate}
            spin={spin}
            strokeWidth={stroke ? 2 : undefined}
            strokeLinecap={stroke ? 'round' : undefined}
            strokeLinejoin={stroke ? 'bevel' : undefined}
            onClick={() => record('generated')}
          />
        )}
        <Icon
          data-testid="icon-generic"
          type="inline-shape"
          size={size}
          rotate={rotate}
          spin={spin}
          viewBox="0 0 20 20"
        >
          <circle cx={10} cy={10} r={5} />
        </Icon>
        <Font
          data-testid="icon-font"
          type={type}
          size={size}
          rotate={rotate}
          spin={spin}
          aria-label={type ?? 'Fallback'}
          onClick={() => record('font')}
        >
          <circle cx={3} cy={3} r={3} />
        </Font>
        <Configured
          data-testid="icon-configured"
          className="caller-icon"
          size={12}
          type="fixture-small-square"
          onClick={() => record('caller')}
        />
        {Remote && <Remote data-testid="icon-remote" type="react-remote-square" size={24} />}
      </ConfigProvider>
      <div>
        <button data-testid="icon-zero" onClick={() => setSize(0)}>
          Zero
        </button>
        <button data-testid="icon-inherit" onClick={() => setSize(undefined)}>
          Inherit
        </button>
        <button data-testid="icon-em" onClick={() => setSize('2em')}>
          Em size
        </button>
        <button
          data-testid="icon-spin"
          onClick={() => {
            setSpin(true);
            setRotate(90);
          }}
        >
          Spin rotated
        </button>
        <button
          data-testid="icon-stop"
          onClick={() => {
            setSpin(false);
            setRotate(180);
          }}
        >
          Stop rotated
        </button>
        <button data-testid="icon-clear-rotate" onClick={() => setRotate(0)}>
          Clear rotate
        </button>
        <button data-testid="icon-large" onClick={() => setType('fixture-large-square')}>
          Large symbol
        </button>
        <button data-testid="icon-fallback" onClick={() => setType(undefined)}>
          Slot fallback
        </button>
        <button data-testid="icon-stroke" onClick={() => setStroke((value) => !value)}>
          Stroke
        </button>
        <button
          data-testid="icon-prefix"
          onClick={() => setPrefix((value) => (value === 'sd' ? 'custom' : 'sd'))}
        >
          Prefix
        </button>
        <button data-testid="icon-gallery" onClick={() => setGallery((value) => !value)}>
          All icons
        </button>
        <button data-testid="icon-load" onClick={loadRemote}>
          Load remote
        </button>
        <button data-testid="icon-unmount" onClick={() => setMounted(false)}>
          Unmount
        </button>
        <button
          data-testid="icon-read-ref"
          onClick={() => setRefName(ref.current?.tagName ?? 'none')}
        >
          Read ref
        </button>
      </div>
      <output data-testid="icon-events">{events.join('|')}</output>
      <output data-testid="icon-ref">{refName}</output>
      {gallery && (
        <div
          data-testid="icon-gallery-grid"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(16, 32px)', gap: 4 }}
        >
          {iconCatalog.map((item) => {
            const Component = Icons[item.componentName];
            return <Component key={item.name} aria-label={item.name} size={24} />;
          })}
        </div>
      )}
    </section>
  );
}
