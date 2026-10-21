import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { UploadAdapter, UploadOptions } from '../src/upload/foundation.ts';
import type { FileItem, RequestOption } from '../src/upload/types.ts';

import { getUploadAccept, getUploadFileKind, isUploadButtonHidden } from '../dist/upload/files.js';
import { createUploadFoundation } from '../dist/upload/foundation.js';
import { createUploadInput } from '../dist/upload/input.js';
import { getFiles, getProgressStatus, isImage } from '../dist/upload/utils.js';

const file = (name = 'a.txt', type = 'text/plain') => new File(['content'], name, { type });
const settle = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

function setup(options: Partial<UploadOptions> = {}) {
  const state = { files: [] as FileItem[], disabled: false };
  const requests: RequestOption[] = [];
  const events: unknown[][] = [];
  const adapter: UploadAdapter = {
    options: {
      limit: 0,
      autoUpload: true,
      customRequest: (request) => {
        requests.push(request);
        return {};
      },
      ...options,
    },
    getFileList: () => state.files,
    setFileList: (files) => {
      state.files = files;
    },
    createFileItem: (item) => item,
    getDisabled: () => state.disabled,
    onUpdateList: (files) => {
      events.push(['update', files]);
    },
    onChange: (files, item) => {
      events.push(['change', files, item]);
    },
    onExceed: (files, selected) => {
      events.push(['exceed', files, selected]);
    },
    onProgress: (item) => {
      events.push(['progress', item]);
    },
    onSuccess: (item) => {
      events.push(['success', item]);
    },
    onError: (item) => {
      events.push(['error', item]);
    },
    onFormChange: () => {
      events.push(['form']);
    },
  };
  return { state, adapter, requests, events, foundation: createUploadFoundation(adapter) };
}

test('upload file rules retain MIME aliases, extension cases and existing fallback icons', () => {
  const files = [
    file('photo.JPEG', 'image/jpeg'),
    file('song.mp3', 'audio/mpeg'),
    file('book.xlsx', 'application/vnd.ms-excel'),
  ];
  const list = files as unknown as FileList;
  assert.deepEqual(getFiles(list, '.jpg'), [files[0]]);
  assert.deepEqual(getFiles(list, 'audio/mp3'), [files[1]]);
  assert.deepEqual(getFiles(list, 'application/vnd.ms-excel'), [files[2]]);
  assert.deepEqual(getFiles(list, 'image/*'), [files[0]]);
  assert.equal(isImage(files[0]), true);
  assert.equal(getUploadFileKind({ uid: '1', name: 'book.pdf' }), 'file');
  assert.equal(getUploadFileKind({ uid: '1', file: file('book.pdf', 'application/pdf') }), 'pdf');
  assert.equal(getUploadAccept(undefined, 'picture'), 'image/*');
  assert.equal(isUploadButtonHidden({ showOnExceedLimit: true }, true), false);
  assert.equal(getProgressStatus('error'), 'danger');
});

test('upload normalizes controlled defaults and preserves explicit zero percent', () => {
  const { state, foundation } = setup();
  foundation.checkFileList([
    { uid: 'a', status: 'uploading', percent: 0 },
    { uid: 'b', status: 'init' },
    { uid: 'c' },
  ]);
  assert.deepEqual(
    state.files.map((item) => [item.status, item.percent]),
    [
      ['uploading', 0],
      ['init', 0],
      ['done', 1],
    ],
  );
});

test('request progress writes to the current controlled entry and preserves event order', () => {
  const { state, events, requests, foundation } = setup();
  foundation.uploadFiles([file()]);
  const original = state.files[0];
  foundation.checkFileList([{ ...original }]);
  const current = state.files[0];
  assert.notEqual(current, original);
  events.length = 0;
  requests[0].onProgress(0.4);
  assert.equal(current.percent, 0.4);
  assert.equal(events[0][1], current);
  assert.deepEqual(
    events.map((item) => item[0]),
    ['progress', 'update', 'change', 'form'],
  );
  events.length = 0;
  requests[0].onSuccess({ id: 1 });
  assert.equal(current.status, 'done');
  assert.deepEqual(
    events.map((item) => item[0]),
    ['success', 'update', 'change', 'form'],
  );
});

test('duplicate submit and cancelled callbacks cannot affect a retried request', () => {
  const { state, adapter, events, requests, foundation } = setup();
  adapter.options.customRequest = (request) => {
    requests.push(request);
    return { abort: () => request.onError('sync abort') };
  };
  foundation.uploadFiles([file()]);
  foundation.submit(state.files[0]);
  assert.equal(requests.length, 1);
  foundation.abort(state.files[0]);
  assert.equal(events.filter((item) => item[0] === 'error').length, 1);
  foundation.submit(state.files[0]);
  requests[1].onProgress(0.5);
  requests[0].onSuccess('late');
  requests[0].onError('late');
  requests[0].onProgress(0.1);
  assert.equal(state.files[0].status, 'uploading');
  assert.equal(state.files[0].percent, 0.5);
  requests[1].onSuccess('current');
  assert.equal(state.files[0].response, 'current');
});

test('a request cancelled during customRequest is aborted when its handle arrives', () => {
  const { state, adapter, foundation } = setup();
  let aborts = 0;
  adapter.options.customRequest = (request) => {
    foundation.abort(request.fileItem);
    return {
      abort: () => {
        aborts++;
      },
    };
  };
  foundation.uploadFiles([file()]);
  assert.equal(aborts, 1);
  assert.equal(state.files[0].status, 'error');
});

test('pending validation reserves a whole batch against asynchronous and synchronous reentry', async () => {
  const { state, adapter, foundation, events } = setup({ limit: 2, autoUpload: false });
  const resolves: Array<(allow: boolean) => void> = [];
  adapter.options.onBeforeUpload = () =>
    new Promise<boolean>((resolve) => {
      resolves.push(resolve);
    });
  foundation.uploadFiles([file('a'), file('b')]);
  foundation.uploadFiles([file('c')]);
  assert.equal(events[0][0], 'exceed');
  resolves[0](true);
  resolves[1](false);
  await settle();
  assert.equal(state.files.length, 1);
  adapter.options.onBeforeUpload = () => true;
  adapter.onChange = () => foundation.uploadFiles([file('reentrant')]);
  foundation.uploadFiles([file('d')]);
  await settle();
  assert.equal(state.files.length, 2);
  assert.ok(events.filter((event) => event[0] === 'exceed').length >= 2);
});

test('validation replacements and rejection free reserved slots without inserting rejected files', async (t) => {
  t.mock.method(console, 'error', () => {});
  const { state, adapter, foundation } = setup({
    limit: 1,
    autoUpload: false,
    onBeforeUpload: async () => {
      throw new Error('rejected');
    },
  });
  foundation.uploadFiles([file()]);
  await settle();
  assert.equal(state.files.length, 0);
  const replacement = file('replacement');
  adapter.options.onBeforeUpload = async () => replacement;
  foundation.uploadFiles([file()]);
  await settle();
  assert.equal(state.files[0].file, replacement);
});

test('removing controlled entries cancels requests and disposal ignores pending validators', async () => {
  const { adapter, foundation, requests, events, state } = setup();
  let aborts = 0;
  adapter.options.customRequest = (request) => {
    requests.push(request);
    return {
      abort: () => {
        aborts++;
      },
    };
  };
  foundation.uploadFiles([file()]);
  foundation.checkFileList([]);
  assert.equal(aborts, 1);
  requests[0].onSuccess('late');
  assert.equal(events.filter((item) => item[0] === 'success').length, 0);
  let resolve!: (allow: boolean) => void;
  adapter.options.onBeforeUpload = () =>
    new Promise<boolean>((done) => {
      resolve = done;
    });
  foundation.uploadFiles([file()]);
  foundation.dispose();
  resolve(true);
  await settle();
  assert.equal(state.files.length, 0);
});

test('response URL failures terminate as errors and removal inside a URL callback suppresses success', (t) => {
  t.mock.method(console, 'error', () => {});
  const { adapter, state, events, requests, foundation } = setup({
    responseUrlKey: () => {
      throw new Error('url');
    },
  });
  foundation.uploadFiles([file()]);
  requests[0].onSuccess({});
  assert.equal(state.files[0].status, 'error');
  adapter.options.responseUrlKey = (item) => {
    foundation.handleRemove(item);
    return 'ignored';
  };
  foundation.submit(state.files[0]);
  requests[1].onSuccess({});
  assert.equal(state.files.length, 0);
  assert.equal(events.filter((item) => item[0] === 'success').length, 0);
});

test('only internally created preview URLs are revoked, retained URLs survive and disposal releases the rest', (t) => {
  const revoked: string[] = [];
  t.mock.method(URL, 'revokeObjectURL', (url) => {
    revoked.push(String(url));
  });
  const { state, foundation } = setup({ autoUpload: false });
  foundation.uploadFiles([file('a.png', 'image/png')]);
  const owned = state.files[0].url!;
  foundation.releasePreviewUrls(new Set([owned]));
  assert.deepEqual(revoked, []);
  foundation.checkFileList([{ uid: 'external', url: 'https://example.test/image.png' }]);
  foundation.releasePreviewUrls(new Set(state.files.map((item) => item.url)));
  assert.deepEqual(revoked, [owned]);
  foundation.dispose();
  assert.deepEqual(revoked, [owned]);
});

test('disabled removal is blocked while explicit submit and updateFile preserve public command semantics', () => {
  const { state, requests, foundation } = setup({ autoUpload: false });
  foundation.uploadFiles([file()]);
  state.disabled = true;
  foundation.handleRemove(state.files[0]);
  assert.equal(state.files.length, 1);
  const replacement = file('new');
  foundation.updateFile(state.files[0].uid, replacement);
  foundation.submit();
  assert.equal(requests[0].fileItem.file, replacement);
});

test('upload input drag state and file filtering keep native event ordering and single-file drops', () => {
  const state = { dragging: false, count: 0, selected: [] as File[], clicks: 0 };
  const options = {
    disabled: false,
    directory: false,
    multiple: false,
    accept: '.txt',
    uploadFiles: (files: File[]) => {
      state.selected = files;
    },
  };
  const input = createUploadInput({
    options,
    getDragging: () => state.dragging,
    setDragging: (value) => {
      state.dragging = value;
    },
    getDragEnterCount: () => state.count,
    setDragEnterCount: (value) => {
      state.count = value;
    },
    clickInput: () => {
      state.clicks++;
    },
  });
  input.setDragEnterCount('add');
  input.handleDragOver(new Event('dragover') as DragEvent);
  assert.equal(state.dragging, true);
  const drop = new Event('drop', { cancelable: true });
  Object.defineProperty(drop, 'dataTransfer', {
    value: { files: [file('a.txt'), file('b.txt'), file('c.png', 'image/png')] },
  });
  input.handleDrop(drop as DragEvent);
  assert.equal(drop.defaultPrevented, true);
  assert.equal(state.count, 0);
  assert.equal(state.dragging, false);
  assert.deepEqual(
    state.selected.map((item) => item.name),
    ['a.txt'],
  );
  options.disabled = true;
  input.handleClick(new Event('click'));
  assert.equal(state.clicks, 0);
});
