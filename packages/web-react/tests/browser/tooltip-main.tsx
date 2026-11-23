import { StrictMode, useState } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import '@sdata/web-core/styles/style/index.scss';

import { Tooltip, type TooltipProps } from '../../src/tooltip';
import '../../styles/tooltip.scss';

const params = new URLSearchParams(location.search);
const longContent = 'Tooltip boundary content. '.repeat(500);

function BoundaryFixture() {
  const clipped = params.has('clipped');
  return (
    <div
      id="tooltip-boundary"
      style={
        clipped
          ? { position: 'relative', overflow: 'hidden', width: 260, height: 200, margin: 20 }
          : undefined
      }
    >
      <Tooltip
        content={longContent}
        position={(params.get('position') ?? 'top') as TooltipProps['position']}
        popupContainer={clipped ? '#tooltip-boundary' : undefined}
        defaultPopupVisible={!clipped}
        mouseEnterDelay={0}
        mouseLeaveDelay={100}
      >
        <button style={clipped ? undefined : { position: 'fixed', top: 140, left: 210 }}>
          Boundary reference
        </button>
      </Tooltip>
    </div>
  );
}

function Fixture() {
  const [disabled, setDisabled] = useState(false);
  const [mounted, setMounted] = useState(true);
  const [large, setLarge] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lockedVisible, setLockedVisible] = useState<boolean | undefined>(false);
  const [lockedDefault, setLockedDefault] = useState(false);
  const [lockedEvents, setLockedEvents] = useState<boolean[]>([]);
  const [events, setEvents] = useState<boolean[]>([]);
  return (
    <section style={{ margin: 80 }}>
      <Tooltip content="普通提示内容">
        <button>普通提示</button>
      </Tooltip>
      <Tooltip content={<div style={{ height: 1000 }}>溢出提示内容</div>}>
        <button>溢出提示</button>
      </Tooltip>
      <Tooltip
        popupVisible={lockedVisible}
        defaultPopupVisible={lockedDefault}
        clickOutsideToClose={params.has('fallback') ? false : undefined}
        content="受控拒绝提示"
        onPopupVisibleChange={(visible) => setLockedEvents((history) => [...history, visible])}
      >
        <button>锁定提示</button>
      </Tooltip>
      <button
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setLockedVisible(!lockedVisible)}
      >
        Toggle controlled tooltip
      </button>
      <button
        onClick={() => {
          setLockedDefault(true);
          setLockedVisible(true);
        }}
      >
        Open controlled tooltip and change default
      </button>
      <button
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setLockedVisible(undefined)}
      >
        Release controlled tooltip
      </button>
      <output data-testid="tooltip-locked-events">{lockedEvents.join('|')}</output>
      <button
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setDisabled(!disabled)}
      >
        Toggle disabled
      </button>
      <button onMouseDown={(event) => event.preventDefault()} onClick={() => setMounted(!mounted)}>
        Toggle tooltip
      </button>
      <button onMouseDown={(event) => event.preventDefault()} onClick={() => setLarge(!large)}>
        Resize tooltip
      </button>
      <div id="tooltip-host" />
      {params.has('reference') && (
        <>
          <button onClick={() => setHidden(!hidden)}>Toggle reference ancestor</button>
          <div style={{ display: hidden ? 'none' : undefined }}>
            <Tooltip
              content="Lifecycle help"
              popupVisible={params.has('controlled') ? true : undefined}
              mouseEnterDelay={0}
            >
              <button aria-describedby="existing-description">Lifecycle reference</button>
            </Tooltip>
          </div>
          <span id="existing-description">Existing help</span>
        </>
      )}
      {mounted && (
        <Tooltip
          popupContainer="#tooltip-host"
          content={<div style={{ minHeight: large ? 1000 : undefined }}>Changing tooltip</div>}
          disabled={disabled}
          mouseEnterDelay={100}
          mouseLeaveDelay={80}
          mini
          position="bottom"
          contentClass="custom-content"
          arrowClass="custom-arrow"
          backgroundColor="#112233"
          onPopupVisibleChange={(visible) => setEvents((history) => [...history, visible])}
        >
          <button>Changing reference</button>
        </Tooltip>
      )}
      <output data-testid="tooltip-events">{events.join('|')}</output>
    </section>
  );
}

flushSync(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>{params.has('boundary') ? <BoundaryFixture /> : <Fixture />}</StrictMode>,
  ),
);
