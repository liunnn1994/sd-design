import { checkComponentDocs } from './docs-contract';

describe('React RegexVis documentation', () => {
  it('documents shared regex-vis scenes and framework navigation', () =>
    checkComponentDocs('regex-vis'));
});
