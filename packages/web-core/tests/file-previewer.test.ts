import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { PDFDocumentProxy, PdfJsModule } from '../src/file-previewer/pdf.ts';
import type {
  FilePreviewerPdfProps,
  FilePreviewerStatus,
  FilePreviewerType,
} from '../src/file-previewer/types.ts';

import {
  createFilePreviewer,
  shouldRenderFile,
  shouldUseImagePreview,
} from '../dist/file-previewer/foundation.js';
import {
  mergeFileImageProps,
  mergeFileMediaProps,
  callFileEventHandler,
  getMediaSkinTag,
  isVideoJsMediaSkin,
} from '../dist/file-previewer/media.js';
import { resolvePdfWorker } from '../dist/file-previewer/pdf-loader.js';
import { createPdfController } from '../dist/file-previewer/pdf.js';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
function foundation() {
  const state = {
    visible: true,
    fullscreen: true,
    esc: true,
    mask: true,
    type: 'image' as FilePreviewerType,
    render: true,
    slots: [] as string[],
    skin: true,
    request: 0,
    server: false,
  };
  const calls: unknown[][] = [];
  const media = deferred<void>();
  const f = createFilePreviewer({
    get visible() {
      return state.visible;
    },
    get fullscreen() {
      return state.fullscreen;
    },
    get escToClose() {
      return state.esc;
    },
    get maskClosable() {
      return state.mask;
    },
    get type() {
      return state.type;
    },
    get shouldRender() {
      return state.render;
    },
    get slots() {
      return state.slots;
    },
    get withMediaSkin() {
      return state.skin;
    },
    get requestId() {
      return state.request;
    },
    get isServer() {
      return state.server;
    },
    setRequestId(value) {
      state.request = value;
    },
    setVisible(value) {
      calls.push(['local', value]);
      state.visible = value;
    },
    setStatus(value) {
      calls.push(['status', value]);
    },
    onClose() {
      calls.push(['close']);
    },
    onVisibleChange(value) {
      calls.push(['visible', value]);
    },
    async destroyPdf() {
      calls.push(['destroyPdf']);
    },
    async loadPdf() {
      calls.push(['loadPdf']);
    },
    ensureMedia() {
      calls.push(['media']);
      return media.promise;
    },
    focusAfterRender() {
      calls.push(['focus']);
    },
  });
  return { f, state, calls, media };
}

test('file preview mode and close preserve inline rendering, callback order and duplicate guards', () => {
  const { f, state, calls } = foundation();
  assert.equal(shouldRenderFile(false, false), true);
  assert.equal(shouldUseImagePreview('image', true, []), true);
  assert.equal(shouldUseImagePreview('image', true, ['image']), false);
  f.close();
  f.close();
  assert.deepEqual(calls.splice(0), [['close'], ['visible', false], ['local', false]]);
  f.imageVisibleChange(true);
  f.imageVisibleChange(false);
  assert.deepEqual(calls.splice(0), [
    ['visible', true],
    ['local', true],
    ['close'],
    ['visible', false],
    ['local', false],
  ]);
  state.visible = true;
  state.fullscreen = false;
  const event = Object.assign(new Event('keydown', { cancelable: true }), {
    key: 'Escape',
  }) as KeyboardEvent;
  f.keydown(event);
  assert.deepEqual(calls, []);
  state.fullscreen = true;
  f.keydown(event);
  assert.equal(event.defaultPrevented, false);
  assert.equal(state.visible, false);
});

test('file content slot takes precedence over PDF, while a PDF type slot still loads the document', () => {
  const { f, state, calls } = foundation();
  state.type = 'pdf';
  state.slots = ['content', 'pdf'];
  f.syncPreview();
  assert.deepEqual(calls.splice(0), [
    ['destroyPdf'],
    ['status', 'beforeLoad'],
    ['focus'],
    ['status', 'loaded'],
  ]);
  state.slots = ['pdf'];
  f.syncPreview();
  assert.deepEqual(calls.splice(0), [['status', 'beforeLoad'], ['focus'], ['loadPdf']]);
  state.render = false;
  f.syncPreview();
  assert.deepEqual(calls, [['destroyPdf']]);
  assert.equal(state.request, 3);
});

test('media preparation and event callbacks reject old request generations', async () => {
  const { f, state, calls, media } = foundation();
  state.type = 'video';
  const pending = f.prepareMedia(0);
  state.request++;
  media.resolve();
  await pending;
  assert.deepEqual(calls, [['status', 'loading'], ['media']]);
  let loaded = 0;
  const handler = mergeFileMediaProps(
    {
      controls: false,
      skin: 'minimal',
      playerProps: { foo: true },
      onLoadedData: [() => loaded++, [() => loaded++]],
    },
    'current',
    'video',
    false,
    1,
    {
      get requestId() {
        return state.request;
      },
      onLoad() {
        loaded++;
      },
      onError() {},
    },
  );
  assert.equal(handler.controls, false);
  assert.equal(handler.playsinline, true);
  assert.equal(handler.src, 'current');
  assert.equal('skin' in handler, false);
  assert.equal('playerProps' in handler, false);
  handler.onLoadeddata(new Event('loadeddata'));
  assert.equal(loaded, 3);
  state.request++;
  handler.onLoadeddata(new Event('loadeddata'));
  assert.equal(loaded, 3);
  assert.equal(isVideoJsMediaSkin('native'), false);
  assert.equal(isVideoJsMediaSkin(false), false);
  assert.equal(getMediaSkinTag('audio', 'minimal'), 'audio-neutral-skin');
  assert.equal(getMediaSkinTag('video', 'custom-skin'), 'custom-skin');
});

test('image event composition retains override precedence, nested arrays and thrown user handlers', () => {
  const calls: string[] = [];
  const merged = mergeFileImageProps(
    {
      alt: 'User alt',
      src: 'ignored',
      previewProps: { escToClose: false },
      onLoad: [() => calls.push('user'), [() => calls.push('nested')]],
    },
    {
      title: 'Title',
      src: 'actual',
      renderToBody: false,
      maskClosable: true,
      closable: true,
      popupContainer: undefined,
      escToClose: true,
      onLoad() {
        calls.push('loaded');
      },
      onError() {},
    },
  );
  assert.equal(merged.src, 'actual');
  assert.equal(merged.alt, 'User alt');
  assert.equal(merged.previewProps.escToClose, false);
  merged.onLoad(new Event('load'));
  assert.deepEqual(calls, ['user', 'nested', 'loaded']);
  assert.throws(
    () =>
      callFileEventHandler(
        [
          () => {
            throw new Error('user failure');
          },
        ],
        new Event('error'),
      ),
    /user failure/,
  );
});

function pdfHarness() {
  const state = {
    src: '/document.pdf',
    props: {} as FilePreviewerPdfProps,
    doc: null as PDFDocumentProxy | null,
    numPages: 0,
    page: 1,
    server: false,
  };
  const statuses: FilePreviewerStatus[] = [];
  const tasks: {
    doc: ReturnType<typeof deferred<PDFDocumentProxy>>;
    destroyed: number;
    args: unknown;
  }[] = [];
  const created = new Map<number, ReturnType<typeof deferred<void>>>();
  const sdk = {
    GlobalWorkerOptions: { workerSrc: '', workerPort: null },
    getDocument(args: unknown) {
      const record = { doc: deferred<PDFDocumentProxy>(), destroyed: 0, args };
      const index = tasks.push(record) - 1;
      created.get(index)?.resolve();
      return {
        promise: record.doc.promise,
        async destroy() {
          record.destroyed++;
        },
      };
    },
  } as unknown as PdfJsModule;
  const f = createPdfController(
    {
      src: () => state.src,
      pdfProps: () => state.props,
      onStatus: (value) => statuses.push(value),
    },
    {
      get doc() {
        return state.doc;
      },
      get numPages() {
        return state.numPages;
      },
      get page() {
        return state.page;
      },
      get isServer() {
        return state.server;
      },
      pixelRatio: 2,
      setDoc(value) {
        state.doc = value;
      },
      setNumPages(value) {
        state.numPages = value;
      },
      setPage(value) {
        state.page = value;
      },
      loadModule: () => Promise.resolve(sdk),
      resolveWorker: async () => 'bundled-worker',
    },
  );
  return {
    f,
    state,
    statuses,
    tasks,
    sdk,
    async task(index: number) {
      if (!tasks[index]) {
        const signal = deferred<void>();
        created.set(index, signal);
        await signal.promise;
      }
      return tasks[index];
    },
  };
}
const document = (numPages = 3) => ({ numPages }) as PDFDocumentProxy;

test('PDF load keeps document parameters, callback receiver, worker reset and 1-based paging rules', async () => {
  const h = pdfHarness();
  const doc = document();
  h.state.props = {
    page: 99,
    documentParams: { url: '/overridden.pdf' },
    onDocumentLoad(value) {
      assert.equal(this, h.state.props);
      assert.equal(value, doc);
    },
  };
  const pending = h.f.load();
  const task = await h.task(0);
  task.doc.resolve(doc);
  await pending;
  assert.deepEqual(task.args, { url: '/overridden.pdf' });
  assert.equal(h.state.doc, doc);
  assert.equal(h.state.page, 3);
  assert.equal(h.sdk.GlobalWorkerOptions.workerPort, null);
  assert.equal(h.sdk.GlobalWorkerOptions.workerSrc, 'bundled-worker');
  h.f.prev();
  assert.equal(h.state.page, 2);
  h.f.next();
  h.f.goto(-10);
  assert.equal(h.state.page, 1);
  await h.f.destroy();
  assert.equal(task.destroyed, 1);
  assert.equal(h.state.doc, null);
  assert.equal(h.state.page, 1);
  assert.equal(h.state.numPages, 0);
});

test('PDF superseding load destroys the old task and ignores its late failure', async () => {
  const h = pdfHarness();
  const old = h.f.load();
  const first = await h.task(0);
  h.state.src = '/new.pdf';
  const current = h.f.load();
  const second = await h.task(1);
  assert.equal(first.destroyed, 1);
  first.doc.reject(new Error('old failure'));
  await old;
  const doc = document(2);
  second.doc.resolve(doc);
  await current;
  assert.equal(h.state.doc, doc);
  assert.equal(h.statuses.includes('error'), false);
  await h.f.destroy();
});

test('PDF destroy invalidates an outstanding document result without publishing loaded', async () => {
  const h = pdfHarness();
  const pending = h.f.load();
  const task = await h.task(0);
  await h.f.destroy();
  task.doc.resolve(document());
  await pending;
  assert.equal(h.state.doc, null);
  assert.deepEqual(h.statuses, ['loading']);
  h.state.server = true;
  await h.f.load();
  assert.equal(h.tasks.length, 1);
});

function renderDocument() {
  const records: {
    options: unknown;
    done: ReturnType<typeof deferred<void>>;
    cancelled: number;
  }[] = [];
  let cleaned = 0;
  const ready = new Map<number, ReturnType<typeof deferred<void>>>();
  const page = {
    cleanup() {
      cleaned++;
    },
    getViewport(options: unknown) {
      void options;
      return { width: 20.2, height: 30.3 };
    },
    render(options: unknown) {
      const record = { options, done: deferred<void>(), cancelled: 0 };
      const index = records.push(record) - 1;
      ready.get(index)?.resolve();
      return {
        promise: record.done.promise,
        cancel() {
          record.cancelled++;
          record.done.reject({ name: 'RenderingCancelledException' });
        },
      };
    },
  };
  const doc = { numPages: 3, getPage: async () => page } as unknown as PDFDocumentProxy;
  return {
    doc,
    records,
    get cleaned() {
      return cleaned;
    },
    async wait(index: number) {
      if (!records[index]) {
        const signal = deferred<void>();
        ready.set(index, signal);
        await signal.promise;
      }
      return records[index];
    },
  };
}
const canvas = () =>
  ({
    width: 0,
    height: 0,
    style: { width: '', height: '' },
    getContext: () => ({}),
  }) as unknown as HTMLCanvasElement;

test('PDF render applies canvas dimensions by DPR and honors render parameter override precedence', async () => {
  const h = pdfHarness(),
    render = renderDocument();
  h.state.props = { renderParams: { transform: [3, 0, 0, 3, 0, 0] } };
  const loading = h.f.load();
  (await h.task(0)).doc.resolve(render.doc);
  await loading;
  const target = canvas();
  const drawing = h.f.render(target, 99);
  const task = await render.wait(0);
  assert.equal(h.state.page, 3);
  assert.equal(target.width, 40);
  assert.equal(target.height, 60);
  assert.equal(target.style.width, '20px');
  assert.deepEqual((task.options as { transform: number[] }).transform, [3, 0, 0, 3, 0, 0]);
  task.done.resolve();
  await drawing;
  await h.f.destroy();
  assert.equal(render.cleaned, 1);
});

test('PDF render cancellation cleans the old page and does not convert cancellation into an error', async () => {
  const h = pdfHarness(),
    render = renderDocument();
  const loading = h.f.load();
  (await h.task(0)).doc.resolve(render.doc);
  await loading;
  const first = h.f.render(canvas(), 1);
  await render.wait(0);
  const second = h.f.render(canvas(), 2);
  const current = await render.wait(1);
  assert.equal(render.records[0].cancelled, 1);
  assert.equal(render.cleaned, 1);
  current.done.resolve();
  await Promise.all([first, second]);
  assert.equal(h.statuses.includes('error'), false);
  await h.f.destroy();
});

test('PDF page resolution after document destroy cannot start a stale canvas render', async () => {
  const h = pdfHarness();
  const page = deferred<Awaited<ReturnType<PDFDocumentProxy['getPage']>>>();
  const doc = { numPages: 1, getPage: () => page.promise } as unknown as PDFDocumentProxy;
  const loading = h.f.load();
  (await h.task(0)).doc.resolve(doc);
  await loading;
  const drawing = h.f.render(canvas());
  await h.f.destroy();
  let called = false;
  page.resolve({
    render() {
      called = true;
    },
  } as unknown as Awaited<ReturnType<PDFDocumentProxy['getPage']>>);
  await drawing;
  assert.equal(called, false);
});

test('PDF worker port and explicit source take priority over the bundled source callback', async () => {
  let calls = 0;
  const bundled = async () => {
    calls++;
    return 'bundled';
  };
  const port = {} as Worker;
  assert.equal(
    await resolvePdfWorker({ workerPort: port, workerSrc: 'explicit' }, bundled),
    undefined,
  );
  assert.equal(await resolvePdfWorker({ workerSrc: 'explicit' }, bundled), 'explicit');
  assert.equal(calls, 0);
  assert.equal(await resolvePdfWorker({}, bundled), 'bundled');
  assert.equal(calls, 1);
});
