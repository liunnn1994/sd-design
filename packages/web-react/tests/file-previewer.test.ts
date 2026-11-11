import { FilePreviewer as RootFilePreviewer } from '@sdata/web-react';
import FilePreviewerDefault, { FilePreviewer } from '@sdata/web-react/file-previewer';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';

test('FilePreviewer public entries render inline content on the server', () => {
  assert.equal(RootFilePreviewer, FilePreviewer);
  assert.equal(FilePreviewerDefault, FilePreviewer);
  const html = render(
    h(FilePreviewer, {
      fullscreen: false,
      title: 'Document',
      type: 'video',
      mediaProps: { skin: 'native' },
      src: '/clip.mp4',
    }),
  );
  assert.match(html, /role="region"/);
  assert.match(html, /aria-label="Document"/);
  assert.match(html, /<video[^>]*src="\/clip.mp4"/);
  assert.doesNotMatch(html, /role="dialog"/);
});

test('FilePreviewer hidden dialogs do not render or access browser globals during SSR', () => {
  assert.equal(render(h(FilePreviewer, { type: 'pdf' })), '');
  const html = render(
    h(FilePreviewer, { type: 'pdf', defaultVisible: true, renderContent: () => 'Custom document' }),
  );
  assert.match(html, /role="dialog"/);
  assert.match(html, /Custom document/);
});
