import { checkComponentDocs } from './docs-contract';

describe('React Tour documentation', () => {
  it('documents shared tour scenes and framework navigation', () => checkComponentDocs('tour'));
});
