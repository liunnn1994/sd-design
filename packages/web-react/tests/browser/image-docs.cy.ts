import { checkComponentDocs } from './docs-contract';

describe('React Image documentation', () => {
  it('documents shared image scenes and framework navigation', () => checkComponentDocs('image'));
});
