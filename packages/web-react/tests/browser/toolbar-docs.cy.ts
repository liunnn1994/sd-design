import { checkComponentDocs } from './docs-contract';

describe('React Toolbar documentation', () => {
  it('documents shared toolbar scenes and framework navigation', () =>
    checkComponentDocs('toolbar'));
});
