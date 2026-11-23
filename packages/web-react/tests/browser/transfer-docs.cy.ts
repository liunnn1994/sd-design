import { checkComponentDocs } from './docs-contract';

describe('React Transfer documentation', () => {
  it('documents shared transfer scenes and framework navigation', () =>
    checkComponentDocs('transfer'));
});
