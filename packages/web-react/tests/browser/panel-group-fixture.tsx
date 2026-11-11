import { useEffect, useRef, useState } from 'react';

import type { PanelSize } from '../../src/panel-group/types.js';

import { Panel, PanelGroup, PanelSeparator } from '../../src/panel-group/index.js';

export function PanelGroupFixture() {
  const [size, setSize] = useState<PanelSize>(200);
  const [collapsed, setCollapsed] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [vertical, setVertical] = useState(false);
  const [explicit, setExplicit] = useState(true);
  const [custom, setCustom] = useState(false);
  const [keepMounted, setKeepMounted] = useState(true);
  const [pose, setPose] = useState(false);
  const [reversed, setReversed] = useState(false);
  const [mounted, setMounted] = useState(true);
  const [width, setWidth] = useState(600);
  const [defaultSize, setDefaultSize] = useState(160);
  const [events, setEvents] = useState<string[]>([]);
  const group = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const separator = useRef<HTMLDivElement>(null);
  const [refs, setRefs] = useState('');
  const [initialCollapsed, setInitialCollapsed] = useState(true);
  const [rtl, setRtl] = useState(false);
  const record = (name: string) => setEvents((old) => [...old, name]);
  useEffect(() => {
    const disable = () => setDisabled(true);
    const unmount = () => setMounted(false);
    const orient = () => setVertical(true);
    window.addEventListener('panel-disable', disable);
    window.addEventListener('panel-unmount', unmount);
    window.addEventListener('panel-vertical', orient);
    return () => {
      window.removeEventListener('panel-disable', disable);
      window.removeEventListener('panel-unmount', unmount);
      window.removeEventListener('panel-vertical', orient);
    };
  }, []);
  const sized = (
    <Panel
      key="sized"
      ref={panel}
      data-testid="panel-content"
      size={size}
      collapsed={collapsed}
      defaultSize={defaultSize}
      minSize={80}
      maxSize={400}
      keepMounted={keepMounted}
      fold={
        pose
          ? {
              hidden: { opacity: 0, transform: 'translateX(-20px)' },
              shown: { opacity: 1, transform: 'none' },
            }
          : undefined
      }
      transition={{ duration: 180 }}
      onSizeChange={(value) => {
        setSize(value);
        record(`size:${value}`);
      }}
      onCollapsedChange={(value) => {
        setCollapsed(value);
        record(`collapsed:${value}`);
      }}
      onMoveStart={() => record('panel:start')}
      onMoving={() => record('panel:moving')}
      onMoveEnd={() => record('panel:end')}
    >
      {(state) => (
        <>
          <input data-testid="panel-input" defaultValue="preserved" />
          <output data-testid="panel-state">{JSON.stringify(state)}</output>
        </>
      )}
    </Panel>
  );
  const fill = (
    <Panel key="fill" pin data-testid="panel-fill-content">
      <p>Fill content</p>
    </Panel>
  );
  const grip = explicit ? (
    <PanelSeparator
      key="separator"
      ref={separator}
      ariaLabel="Resize workspace"
      data-testid="panel-grip"
    >
      {custom ? <span data-testid="panel-custom-grip">Resize</span> : undefined}
    </PanelSeparator>
  ) : null;
  return (
    <section style={{ padding: 24 }}>
      <div style={{ width, height: 360 }} data-testid="panel-container">
        {mounted && (
          <PanelGroup
            dir={rtl ? 'rtl' : 'ltr'}
            ref={group}
            component="section"
            data-testid="panel-main"
            disabled={disabled}
            orientation={vertical ? 'vertical' : 'horizontal'}
            transition={{ duration: 100 }}
            onMoveStart={() => record('group:start')}
            onMoving={() => record('group:moving')}
            onMoveEnd={() => record('group:end')}
          >
            {reversed ? [fill, grip, sized] : [sized, grip, fill]}
          </PanelGroup>
        )}
      </div>
      <output data-testid="panel-size">{size}</output>
      <output data-testid="panel-events">{events.join('|')}</output>
      <output data-testid="panel-refs">{refs}</output>
      <button data-testid="panel-rtl" onClick={() => setRtl((value) => !value)}>
        RTL
      </button>
      <button data-testid="panel-initial-open" onClick={() => setInitialCollapsed(false)}>
        Open initially collapsed
      </button>
      <button data-testid="panel-collapse" onClick={() => setCollapsed((value) => !value)}>
        Collapse
      </button>
      <button data-testid="panel-disable-toggle" onClick={() => setDisabled((value) => !value)}>
        Disable
      </button>
      <button data-testid="panel-orientation" onClick={() => setVertical((value) => !value)}>
        Orientation
      </button>
      <button data-testid="panel-explicit" onClick={() => setExplicit((value) => !value)}>
        Separator
      </button>
      <button data-testid="panel-custom" onClick={() => setCustom((value) => !value)}>
        Custom grip
      </button>
      <button
        data-testid="panel-presence"
        onClick={() => {
          setKeepMounted(false);
          setPose(true);
        }}
      >
        Unmount folded content
      </button>
      <button data-testid="panel-reorder" onClick={() => setReversed((value) => !value)}>
        Reorder
      </button>
      <button data-testid="panel-percent" onClick={() => setSize('30%')}>
        Percentage
      </button>
      <button data-testid="panel-width" onClick={() => setWidth(800)}>
        Resize container
      </button>
      <button data-testid="panel-default" onClick={() => setDefaultSize(220)}>
        Reset default
      </button>
      <button
        data-testid="panel-read-refs"
        onClick={() =>
          setRefs(
            `${group.current?.tagName}|${panel.current?.className}|${separator.current?.getAttribute('role')}`,
          )
        }
      >
        Read refs
      </button>
      <div style={{ width: 500, height: 160, marginTop: 24 }}>
        <PanelGroup data-testid="panel-uncontrolled" transition={{ duration: 0 }}>
          <Panel
            defaultSize={defaultSize}
            minSize={80}
            transition={{ duration: 0 }}
            data-testid="panel-uncontrolled-content"
          >
            Uncontrolled
          </Panel>
          <Panel>
            <PanelGroup data-testid="panel-nested" orientation="vertical">
              <Panel
                defaultSize={60}
                transition={{ duration: 0 }}
                data-testid="panel-nested-content"
              >
                Nested
              </Panel>
              <Panel>Nested fill</Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
      <div style={{ width: 500, height: 100, marginTop: 24 }}>
        <PanelGroup data-testid="panel-initial">
          <Panel
            defaultSize={140}
            collapsed={initialCollapsed}
            onCollapsedChange={setInitialCollapsed}
            transition={{ duration: 0 }}
            data-testid="panel-initial-content"
          >
            Initially collapsed
          </Panel>
          <Panel>Fill</Panel>
        </PanelGroup>
      </div>
    </section>
  );
}
