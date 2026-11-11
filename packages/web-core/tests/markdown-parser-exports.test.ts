import assert from 'node:assert/strict';
import test from 'node:test';
import * as parser from 'stream-markdown-parser';

import * as core from '../dist/markdown/parser.js';

test('Core exposes the complete locked parser runtime without replacing its bindings', () => {
  assert.deepEqual(Object.keys(core).sort(), Object.keys(parser).sort());
  for (const [name, value] of Object.entries(parser))
    assert.equal(core[name as keyof typeof core], value, name);
});
test('registered parser plugins affect parsing and clearing removes them for new instances', () => {
  core.clearRegisteredMarkdownPlugins();
  try {
    core.registerMarkdownPlugin((md) => {
      md.core.ruler.push('sd-manifest-marker', (state) => {
        for (const token of state.tokens)
          for (const child of token.children ?? [])
            if (child.type === 'text') child.content = child.content.replaceAll('BRIDGE', 'PLUGIN');
      });
    });
    const md = core.getMarkdown('sd-manifest-plugin');
    assert.match(md.render('BRIDGE'), /PLUGIN/);
    assert.match(JSON.stringify(core.parseMarkdownToStructure('BRIDGE', md)), /PLUGIN/);
    core.clearRegisteredMarkdownPlugins();
    assert.doesNotMatch(core.getMarkdown('sd-manifest-cleared').render('BRIDGE'), /PLUGIN/);
  } finally {
    core.clearRegisteredMarkdownPlugins();
  }
});
