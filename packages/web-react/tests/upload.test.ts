import { Upload as RootUpload } from '@sdata/web-react';
import UploadDefault, { Upload } from '@sdata/web-react/upload';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';
test('Upload public entries render default file lists without initiating requests in SSR', () => {
  assert.equal(RootUpload, Upload);
  assert.equal(UploadDefault, Upload);
  const html = render(
    h(Upload, {
      defaultFileList: [{ uid: 'one', name: 'report.txt' }],
      title: 'Files',
    }),
  );
  assert.match(html, /report.txt/);
  assert.match(html, /sd-upload-list-item-done/);
  assert.match(html, /sd-upload-wrapper/);
  assert.match(html, /title="Files"/);
});
test('Upload SSR forwards native attributes to the button-only span and includes tip text', () => {
  const html = render(
    h(Upload, {
      'showFileList': false,
      'tip': 'Text files',
      'id': 'uploader',
      'aria-label': 'Choose file',
    }),
  );
  assert.match(html, /^<span[^>]*id="uploader"/);
  assert.match(html, /aria-label="Choose file"/);
  assert.match(html, /Text files/);
  assert.doesNotMatch(html, /sd-upload-wrapper/);
});
