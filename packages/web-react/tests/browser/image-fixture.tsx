import { useRef, useState } from 'react';

import type { ImageInstance } from '../../src/image/index.js';

import { ConfigProvider } from '../../src/config-provider/index.js';
import {
  Image,
  ImagePreview,
  ImagePreviewAction,
  ImagePreviewGroup,
} from '../../src/image/index.js';

export const imageSources = ['red', 'blue', 'green', 'purple'].map(
  (color) =>
    `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480"><rect width="640" height="480" fill="${color}"/></svg>`)}`,
);

export function ImageFixture() {
  const [mode, setMode] = useState('image');
  const [source, setSource] = useState(imageSources[0]);
  const [mounted, setMounted] = useState(true);
  const [visible, setVisible] = useState(false);
  const [controlled, setControlled] = useState(false);
  const [accept, setAccept] = useState(true);
  const [custom, setCustom] = useState(false);
  const [hideFooter, setHideFooter] = useState<boolean | 'never'>(false);
  const [outer, setOuter] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [keyboard, setKeyboard] = useState(true);
  const [wheelZoom, setWheelZoom] = useState(true);
  const [escToClose, setEscToClose] = useState(true);
  const [maskClosable, setMaskClosable] = useState(true);
  const [container, setContainer] = useState<string>('body');
  const [renderToBody, setRenderToBody] = useState(true);
  const [prefix, setPrefix] = useState('sd');
  const [layout, setLayout] = useState<string[]>();
  const [ids, setIds] = useState([0, 1, 2]);
  const [sources, setSources] = useState<string[]>();
  const [current, setCurrent] = useState(0);
  const [infinite, setInfinite] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const image = useRef<ImageInstance>(null);
  const record = (value: string) => setEvents((old) => [...old, value]);
  const visibility = (value: boolean) => {
    record(`visible:${value}`);
    if (accept) setVisible(value);
  };
  const options = {
    popupContainer: container,
    renderToBody,
    keyboard,
    wheelZoom,
    escToClose,
    maskClosable,
    actionsLayout: layout,
  };
  const actions = (
    <>
      <input data-testid="image-editable" aria-label="Image note" />
      <ImagePreviewAction name="Custom" disabled={disabled} onClick={() => record('custom')}>
        <b data-testid="image-custom-action">Custom</b>
      </ImagePreviewAction>
    </>
  );
  return (
    <section data-testid="image-fixture" style={{ padding: 24 }}>
      <div
        style={{
          position: 'relative',
          background: 'white',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <select
          aria-label="Image mode"
          value={mode}
          onChange={(event) => {
            setVisible(false);
            setMode(event.target.value);
          }}
        >
          <option value="image">Image</option>
          <option value="default-preview">Open initially</option>
          <option value="preview">Preview</option>
          <option value="group">Group</option>
          <option value="stack">Stack</option>
        </select>
        <button onClick={() => setMounted(!mounted)}>Image mount</button>
        <button onClick={() => setSource(imageSources[3])}>Image replace</button>
        <button onClick={() => setSource('/image-missing.png')}>Image fail</button>
        <button onClick={() => setSource('')}>Image empty</button>
        <button onClick={() => setVisible(!visible)}>Image visible</button>
        <button onClick={() => setControlled(!controlled)}>Image controlled</button>
        <button onClick={() => setAccept(!accept)}>Image accept</button>
        <button onClick={() => setCustom(!custom)}>Image custom slots</button>
        <button
          onClick={() =>
            setHideFooter(hideFooter === false ? true : hideFooter === true ? 'never' : false)
          }
        >
          Image footer visibility
        </button>
        <button onClick={() => setOuter(!outer)}>Image footer position</button>
        <button onClick={() => setDisabled(!disabled)}>Image disable</button>
        <button onClick={() => setKeyboard(!keyboard)}>Image keyboard</button>
        <button onClick={() => setWheelZoom(!wheelZoom)}>Image wheel</button>
        <button onClick={() => setEscToClose(!escToClose)}>Image escape</button>
        <button onClick={() => setMaskClosable(!maskClosable)}>Image mask</button>
        <button
          onClick={() =>
            setContainer(
              container === 'body'
                ? '#image-container-a'
                : container === '#image-container-a'
                  ? '#image-container-b'
                  : 'body',
            )
          }
        >
          Image container
        </button>
        <button onClick={() => setRenderToBody(!renderToBody)}>Image portal</button>
        <button onClick={() => setPrefix(prefix === 'sd' ? 'custom' : 'sd')}>Image prefix</button>
        <button onClick={() => setLayout(layout ? undefined : ['zoomOut', 'rotateLeft'])}>
          Image layout
        </button>
        <button onClick={() => setIds(ids.length === 3 ? [0, 2] : [0, 1, 2])}>
          Image remove middle
        </button>
        <button onClick={() => setIds([...ids].reverse())}>Image reorder</button>
        <button
          onClick={() => setSources(sources ? undefined : [imageSources[3], imageSources[1]])}
        >
          Image source list
        </button>
        <button onClick={() => setSources([])}>Image empty list</button>
        <button onClick={() => setInfinite(!infinite)}>Image infinite</button>
        <button onClick={() => image.current?.onImgClick()}>Image ref open</button>
        <button onClick={() => image.current?.onPreviewClose()}>Image ref close</button>
        <output data-testid="image-events">{events.join('|')}</output>
        <output data-testid="image-current">{current}</output>
      </div>
      <div id="image-container-a" style={{ position: 'relative', width: 500, height: 360 }} />
      <div id="image-container-b" style={{ position: 'relative', width: 500, height: 360 }} />
      <ConfigProvider prefixCls={prefix}>
        {mounted && (mode === 'image' || mode === 'default-preview') && (
          <Image
            key={mode}
            ref={image}
            data-testid="image-main"
            src={source}
            width={160}
            height={120}
            title="Landscape"
            description="Caption"
            fit="cover"
            showLoader
            footerClass="fixture-image-footer"
            footerPosition={outer ? 'outer' : 'inner'}
            hideFooter={hideFooter}
            preview={!disabled}
            defaultPreviewVisible={mode === 'default-preview'}
            previewVisible={controlled ? visible : undefined}
            onPreviewVisibleChange={visibility}
            renderToBody={renderToBody}
            previewProps={
              mode === 'default-preview'
                ? { ...options, src: imageSources[1], closable: false }
                : options
            }
            extra={custom ? <button>Extra download</button> : undefined}
            error={custom ? <span>Custom error</span> : undefined}
            loader={custom ? <span>Custom loading</span> : undefined}
            previewActions={actions}
            onLoad={() => record('load')}
            onError={() => record('error')}
            onClick={() => record('click')}
          />
        )}
        {mounted && mode === 'preview' && (
          <ImagePreview
            {...options}
            src={source}
            visible={visible}
            onVisibleChange={visibility}
            onClose={() => record('close')}
            actions={actions}
          />
        )}
        {mounted && mode === 'group' && (
          <ImagePreviewGroup
            {...options}
            srcList={sources}
            infinite={infinite}
            visible={controlled ? visible : undefined}
            current={controlled ? current : undefined}
            onChange={(index) => {
              record(`current:${index}`);
              if (accept) setCurrent(index);
            }}
            onVisibleChange={visibility}
            actions={({ url }) => (
              <>
                <span data-testid="image-group-url">{url}</span>
                {actions}
              </>
            )}
          >
            {ids.map((id) => (
              <Image
                key={id}
                data-image-id={id}
                src={id === 0 ? source : imageSources[id]}
                width={100}
                height={75}
                preview={id !== 1 || !disabled}
              />
            ))}
          </ImagePreviewGroup>
        )}
        {mounted && mode === 'stack' && (
          <>
            <ImagePreview src={imageSources[0]} defaultVisible className="image-stack-first" />
            <ImagePreview
              src={imageSources[1]}
              visible={visible}
              onVisibleChange={visibility}
              className="image-stack-second"
            />
          </>
        )}
      </ConfigProvider>
    </section>
  );
}
