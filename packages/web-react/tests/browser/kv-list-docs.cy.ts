import { checkComponentDocs } from './docs-contract';

describe('KvList documentation', () => {
  it('documents shared kv-list scenes and framework navigation', () =>
    checkComponentDocs('kv-list'));
});
