import { checkComponentDocs } from './docs-contract';

describe('React TreeSelect documentation', () => {
  it('documents shared tree-select scenes and framework navigation', () =>
    checkComponentDocs('tree-select'));
});
