import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { FileItem } from '../src/upload/types.ts';

import { getUploadPreviewUrls, previewUploadFile } from '../dist/upload/files.js';

test('upload preview URLs preserve order, duplicates and truthy URL policy without changing files', () => {
  const files: FileItem[] = [
    { uid: '0' },
    { uid: '1', url: '' },
    { uid: '2', url: 'same' },
    { uid: '3', url: ' ' },
    { uid: '4', url: 'same' },
  ];
  assert.deepEqual(getUploadPreviewUrls(files), ['same', ' ', 'same']);
  assert.equal(files.length, 5);
});

test('upload preview selects the first matching URL before visible and preview notifications', () => {
  const file: FileItem = { uid: '0', url: 'same' };
  const calls: unknown[] = [];
  previewUploadFile(file, {
    enabled: true,
    urls: ['other', 'same', 'same'],
    setCurrent: (current) => calls.push(['current', current]),
    setVisible: (visible) => calls.push(['visible', visible]),
    onPreview: (value) => {
      assert.equal(value, file);
      calls.push(['preview', value]);
    },
  });
  assert.deepEqual(calls, [
    ['current', 1],
    ['visible', true],
    ['preview', file],
  ]);
});

test('upload preview keeps disabled/URL short circuits and still notifies without a matching index', () => {
  for (const [enabled, url] of [
    [false, 'same'],
    [true, ''],
    [true, undefined],
  ] as const) {
    const file: FileItem = { uid: '0', ...(url === undefined ? {} : { url }) };
    let notified = false;
    previewUploadFile(file, {
      enabled,
      get urls(): never {
        throw Error('unexpected URL read');
      },
      setCurrent() {
        throw Error('unexpected current');
      },
      setVisible() {
        throw Error('unexpected visibility');
      },
      onPreview(value) {
        assert.equal(value, file);
        notified = true;
      },
    });
    assert.equal(notified, true);
  }
  const file: FileItem = { uid: '0', url: 'missing' };
  let notified = false;
  previewUploadFile(file, {
    enabled: true,
    urls: ['other'],
    setCurrent() {
      throw Error('unexpected current');
    },
    setVisible() {
      throw Error('unexpected visibility');
    },
    onPreview() {
      notified = true;
    },
  });
  assert.equal(notified, true);
});

test('upload preview does not swallow a failed state write or notify out of order', () => {
  const failure = Error('write failed');
  assert.throws(
    () =>
      previewUploadFile(
        { uid: '0', url: 'same' },
        {
          enabled: true,
          urls: ['same'],
          setCurrent() {
            throw failure;
          },
          setVisible() {
            throw Error('late visibility');
          },
          onPreview() {
            throw Error('late preview');
          },
        },
      ),
    (error) => error === failure,
  );
});
