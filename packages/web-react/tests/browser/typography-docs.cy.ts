import { checkComponentDocs } from './docs-contract';

describe('Typography documentation', () => {
  it('documents shared typography scenes and framework navigation', () =>
    checkComponentDocs('typography'));
});
