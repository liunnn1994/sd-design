import { checkComponentDocs } from './docs-contract';

describe('React Upload documentation', () => {
  it('documents shared upload scenes and framework navigation', () => checkComponentDocs('upload'));
});
