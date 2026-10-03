import assert from 'node:assert/strict';
import test from 'node:test';

import { SdDesignResolver } from '../index.ts';

type ResolvedImport = { from: string; name: string };

// ComponentResolver 是联合类型，这里取我们实际创建的那一项
const resolver = SdDesignResolver()[0] as unknown as {
  type: string;
  resolve: (name: string, importer: unknown) => Promise<ResolvedImport | undefined>;
};

const resolveName = (name: string) => resolver.resolve(name, { name });

test('resolves the exported components', async () => {
  assert.equal(typeof resolver.type, 'string');

  const button = await resolveName('SdButton');
  assert.ok(button, 'SdButton should resolve');
  assert.equal(button.from, '@sdata/web-vue');
  assert.equal(button.name, 'Button');

  const rate = await resolveName('SdRate');
  assert.ok(rate, 'SdRate should resolve');
  assert.equal(rate.name, 'Rate');
});

test('resolves sub-components exported under an alias', async () => {
  const item = await resolveName('SdModelSelectorContent');
  assert.ok(item, 'SdModelSelectorContent should resolve');
  assert.equal(item.name, 'ModelSelectorContent');
});

test('does not resolve names that are not exported', async () => {
  assert.equal(await resolveName('SdDefinitelyNotAComponent'), undefined);
  assert.equal(await resolveName('Button'), undefined);
});
