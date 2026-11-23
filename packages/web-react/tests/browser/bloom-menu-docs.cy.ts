import { checkComponentDocs } from './docs-contract';

describe('BloomMenu documentation', () => {
  it('documents shared bloom-menu scenes and framework navigation', () =>
    checkComponentDocs('bloom-menu'));
});
