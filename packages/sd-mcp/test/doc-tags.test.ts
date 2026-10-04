import assert from 'node:assert/strict';
import test from 'node:test';

import { extractDescription, isPrivateApi } from '../../web-vue/scripts/utils/doc-tags.ts';

test('recognizes private tags from docgen and TypeScript without hiding public APIs', () => {
  assert.equal(isPrivateApi({ access: [{ title: 'access', description: 'private' }] }), true);
  assert.equal(isPrivateApi([{ title: 'private', description: '' }]), true);
  assert.equal(isPrivateApi({ en: [{ title: 'en', description: 'Public field' }] }), false);
  assert.equal(isPrivateApi(undefined), false);
});

// vue-docgen-api 各描述符存文案的字段并不一致：
// prop 用 description，event 用 content，slot 又是 description。
// 取值逻辑写错过一次，导致所有组件的 slot 被整条丢弃（MCP 里 slots 恒为 0）。
test('reads prop tags from the description field', () => {
  const tags = {
    zh: [{ title: 'zh', description: '是否禁用' }],
    en: [{ title: 'en', description: 'Whether disabled' }],
  };
  assert.deepEqual(extractDescription(tags, 'description'), {
    zh: '是否禁用',
    en: 'Whether disabled',
  });
});

test('reads slot tags even though they do not carry a content field', () => {
  const tags = {
    zh: [{ title: 'zh', description: '内容' }],
    en: [{ title: 'en', description: 'Content' }],
  };
  assert.deepEqual(extractDescription(tags, 'content'), { zh: '内容', en: 'Content' });
});

test('prefers the requested field when both are present', () => {
  const tags = {
    en: [{ title: 'en', content: 'from content', description: 'from description' }],
  };
  assert.deepEqual(extractDescription(tags, 'content'), { zh: '', en: 'from content' });
  assert.deepEqual(extractDescription(tags, 'description'), { zh: '', en: 'from description' });
});

test('ignores non-language tags and empty input', () => {
  const tags = {
    en: [{ title: 'en', description: 'Custom radio' }],
    version: [{ title: 'version', description: '2.18.0' }],
  };
  assert.deepEqual(extractDescription(tags, 'description'), { zh: '', en: 'Custom radio' });
  assert.deepEqual(extractDescription(undefined, 'description'), { zh: '', en: '' });
});
