import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';

import {
  VoiceGlow,
  useVoiceMicrophone,
  ConfigProvider,
  resolveVoiceDefaults,
} from '../dist/index.js';
import Glow from '../dist/voice-glow/index.js';
test('VoiceGlow SSR preserves content, decorative canvases and public preset exports without audio access', () => {
  assert.equal(Glow, VoiceGlow);
  assert.equal(resolveVoiceDefaults('pill', 'dark').scale, 0.45);
  const html = render(h(VoiceGlow, {}, h('button', {}, 'Speak')));
  assert.match(html, /data-active=""/);
  assert.match(html, /data-voice-type="default"/);
  assert.match(html, /data-voice-beam-band=""/);
  assert.match(html, /<button>Speak<\/button>/);
  assert.doesNotMatch(html, /<style/);
});
test('VoiceGlow SSR reflects explicit geometry, pause/processing and library prefix', () => {
  const html = render(
    h(
      ConfigProvider,
      { prefixCls: 'custom' },
      h(VoiceGlow, {
        active: false,
        paused: true,
        processing: true,
        type: 'mobile',
        distortion: 0,
        coreLight: 2,
        strength: 0.4,
        style: { width: 300 },
        className: 'extra',
      }),
    ),
  );
  assert.match(html, /custom-voice-glow extra/);
  assert.match(html, /data-processing=""/);
  assert.match(html, /data-paused=""/);
  assert.match(html, /data-voice-beam-core=""/);
  assert.match(html, /--voice-strength:0.4/);
  assert.match(html, /width:300px/);
  assert.doesNotMatch(html, /<svg|data-active|sensitivity=/);
});
test('useVoiceMicrophone SSR reports unsupported without requesting or constructing browser audio', () => {
  function View() {
    const mic = useVoiceMicrophone({ autoStart: true });
    return h('output', {}, `${mic.state}:${mic.supported}:${mic.stream === null}`);
  }
  assert.equal(render(h(View)), '<output>unsupported:false:true</output>');
});
