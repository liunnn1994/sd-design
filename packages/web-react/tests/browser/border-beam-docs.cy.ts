import { checkComponentDocs } from './docs-contract';

describe('BorderBeam documentation', () => {
  it('documents shared border-beam scenes and framework navigation', () =>
    checkComponentDocs('border-beam'));
});
