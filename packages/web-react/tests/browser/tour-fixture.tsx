import { createContext, useContext, useEffect, useRef, useState } from 'react';

import type { TourInstance, TourStep } from '../../src/tour/index.js';

import { Button } from '../../src/button/index.js';
import { Tour } from '../../src/tour/index.js';

const Context = createContext('missing');
const imperativeSteps: TourStep[] = [{ popover: { title: 'Original step' } }];
function ImperativeTour() {
  const ref = useRef<TourInstance>(null);
  return (
    <Tour ref={ref} steps={imperativeSteps} animate={false}>
      <button
        onClick={() => {
          ref.current?.setSteps([
            { popover: { title: 'Imperative first' } },
            { popover: { title: 'Imperative second' } },
          ]);
          ref.current?.drive();
        }}
      >
        Tour imperative
      </button>
    </Tour>
  );
}
function SlotContent({
  text,
  height,
  record,
}: {
  text: string;
  height: number;
  record(value: string): void;
}) {
  const context = useContext(Context);
  const [count, setCount] = useState(0);
  useEffect(() => () => record('slot:unmount'), []);
  return (
    <div data-testid="tour-slot" style={{ height }}>
      <span>
        {context}:{text}:{count}
      </span>
      <Button onClick={() => setCount(count + 1)}>Slot count</Button>
      <input aria-label="Tour note" />
    </div>
  );
}

export function TourFixture() {
  const tour = useRef<TourInstance>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [mounted, setMounted] = useState(true);
  const [custom, setCustom] = useState(false);
  const [footer, setFooter] = useState(false);
  const [progress, setProgress] = useState(false);
  const [allowClose, setAllowClose] = useState(true);
  const [animate, setAnimate] = useState(false);
  const [text, setText] = useState('initial');
  const [height, setHeight] = useState(70);
  const [nextText, setNextText] = useState('Next');
  const [veto, setVeto] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const record = (value: string) => setEvents((old) => [...old, value]);
  const steps: TourStep[] = [
    {
      element: '#tour-first',
      popover: {
        title: 'First native',
        description: 'First description',
        onPopoverRender: () => record('step:render'),
      },
    },
    {
      element: '#tour-second',
      popover: { title: 'Second native', description: 'Second description' },
    },
  ];
  return (
    <section data-testid="tour-fixture" style={{ padding: 24 }}>
      <ImperativeTour />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <button onClick={() => tour.current?.drive()}>Tour start</button>
        <button onClick={() => tour.current?.destroy()}>Tour destroy</button>
        <button onClick={() => tour.current?.moveNext()}>Tour next</button>
        <button onClick={() => tour.current?.movePrevious()}>Tour previous</button>
        <button onClick={() => setMounted(!mounted)}>Tour mount</button>
        <button onClick={() => setCustom(!custom)}>Tour custom</button>
        <button onClick={() => setFooter(!footer)}>Tour footer</button>
        <button onClick={() => setProgress(!progress)}>Tour progress</button>
        <button onClick={() => setText('updated')}>Tour text</button>
        <button onClick={() => setHeight(170)}>Tour height</button>
        <button onClick={() => setAllowClose(!allowClose)}>Tour allow close</button>
        <button onClick={() => setAnimate(!animate)}>Tour animation</button>
        <button onClick={() => setNextText('Continue')}>Tour button text</button>
        <button onClick={() => setVeto(!veto)}>Tour veto</button>
        <button
          onClick={() => {
            tour.current?.highlight({
              popover: { title: 'Highlighted', description: 'Independent' },
            });
          }}
        >
          Tour highlight
        </button>
        <button
          onClick={() => {
            dialog.current?.showModal();
            tour.current?.setSteps([
              { element: '#tour-dialog-target', popover: { title: 'Dialog native' } },
            ]);
            tour.current?.drive();
          }}
        >
          Tour dialog
        </button>
        <button
          onClick={() => {
            tour.current?.destroy();
            dialog.current?.close();
          }}
        >
          Tour close dialog
        </button>
        <button
          onClick={() =>
            record(
              `state:${tour.current?.isActive()}:${tour.current?.getActiveIndex()}:${tour.current?.getConfig().allowClose}:${typeof tour.current?.getNextStep}`,
            )
          }
        >
          Tour read
        </button>
        <button onClick={() => setEvents([])}>Tour clear events</button>
      </div>
      <Context.Provider value="parent">
        {mounted && (
          <Tour
            ref={tour}
            steps={steps}
            animate={animate}
            allowClose={allowClose}
            nextBtnText={nextText}
            onPopoverRender={() => record('global:render')}
            onHighlighted={(_element, _step, { index }) => record(`highlight:${index}`)}
            onDestroyed={(_element, _step, options) => record(`destroy:${options.reason}`)}
            onNextClick={veto ? () => record('next:veto') : undefined}
            onDoneClick={veto ? () => record('done:veto') : undefined}
            onDestroyStarted={veto ? () => record('destroy:veto') : undefined}
            renderTitle={
              custom
                ? ({ index }) => <b data-testid="tour-title">React title {String(index)}</b>
                : undefined
            }
            renderDescription={
              custom ? () => <SlotContent text={text} height={height} record={record} /> : undefined
            }
            renderFooter={
              footer
                ? ({ driver }) => <Button onClick={() => driver.moveNext()}>Custom next</Button>
                : undefined
            }
            renderProgress={
              progress
                ? ({ index }) => <strong data-testid="tour-progress">Step {String(index)}</strong>
                : undefined
            }
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 100 }}>
              <button id="tour-first">First target</button>
              <button id="tour-second">Second target</button>
            </div>
            <dialog ref={dialog}>
              <button id="tour-dialog-target">Dialog target</button>
            </dialog>
          </Tour>
        )}
      </Context.Provider>
      <output data-testid="tour-events">{events.join('|')}</output>
    </section>
  );
}
