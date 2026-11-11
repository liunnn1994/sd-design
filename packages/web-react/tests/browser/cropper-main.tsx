import { loadCropper } from '@sdata/web-core/cropper/engine';
import { Cropper, type CropperInstance } from '@sdata/web-react/cropper';
import { StrictMode, useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@sdata/web-react/styles/cropper.scss';

const picture = (width: number, height: number) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="blue"/></svg>`)}`;
function Fixture() {
  const query = new URLSearchParams(location.search);
  const ref = useRef<CropperInstance>(null);
  const [mounted, setMounted] = useState(true);
  const [src, setSrc] = useState(
    query.get('src') ?? (query.has('invalid') ? 'data:image/svg+xml,invalid' : picture(640, 360)),
  );
  const [fit, setFit] = useState(!query.has('nofit'));
  const [configured, setConfigured] = useState(true);
  const [geometry, setGeometry] = useState({ x: 20, y: 30, width: 100, height: 80 });
  const [events, setEvents] = useState<string[]>([]);
  const [status, setStatus] = useState('');
  const record = (name: string) => setEvents((items) => [...items, name]);
  useLayoutEffect(() => {
    if (query.has('early')) ref.current?.destroy();
  }, []);
  return (
    <>
      <button onClick={() => setMounted(!mounted)}>Mount</button>
      <button onClick={() => ref.current?.destroy()}>Destroy</button>
      <button
        onClick={async () => {
          await loadCropper();
          setStatus('loaded');
        }}
      >
        Load engine
      </button>
      <button onClick={() => setSrc(picture(320, 240))}>Replace image</button>
      <button onClick={() => setFit(!fit)}>Fit</button>
      <button onClick={() => setConfigured(!configured)}>Child props</button>
      <button onClick={() => setGeometry({ x: 40, y: 50, width: 120, height: 90 })}>
        Geometry
      </button>
      <button
        onClick={() =>
          setStatus(
            String(!!ref.current?.getInstance()) +
              ':' +
              String(ref.current?.getCropperSelections()?.length),
          )
        }
      >
        Inspect
      </button>
      <button onClick={() => ref.current?.getCropperSelection()?.$change(50, 60, 140, 100)}>
        Move selection
      </button>
      {mounted && (
        <Cropper
          ref={ref}
          src={src}
          id="avatar"
          aria-label="Avatar cropper"
          width={400}
          height={300}
          fitSelectionToImage={fit}
          template={
            query.has('template')
              ? '<cropper-canvas data-custom="true"><cropper-image></cropper-image><cropper-selection initial-coverage="0.5" movable resizable></cropper-selection></cropper-canvas>'
              : undefined
          }
          canvasProps={
            configured ? { background: true, scaleStep: 0.2, disabled: query.has('disabled') } : {}
          }
          imageProps={configured ? { rotatable: true, translatable: true } : {}}
          selectionProps={configured ? { movable: true, resizable: true } : {}}
          selectionX={query.has('controlled') ? geometry.x : undefined}
          selectionY={query.has('controlled') ? geometry.y : undefined}
          selectionWidth={query.has('controlled') ? geometry.width : undefined}
          selectionHeight={query.has('controlled') ? geometry.height : undefined}
          onSelectionChange={() => record('selection')}
          onSelectionXChange={(x) => {
            record(`x:${x}`);
            if (query.has('accept')) setGeometry((value) => ({ ...value, x }));
          }}
          onSelectionYChange={(y) => record(`y:${y}`)}
          onSelectionWidthChange={(width) => record(`width:${width}`)}
          onSelectionHeightChange={(height) => record(`height:${height}`)}
          onCanvasAction={() => record('action')}
          onCanvasActionStart={() => record('start')}
          onCanvasActionMove={() => record('move')}
          onCanvasActionEnd={() => record('end')}
          onImageTransform={() => record('transform')}
        />
      )}
      <output data-testid="events">{events.join('|')}</output>
      <output data-testid="status">{status}</output>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
