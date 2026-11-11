import { checkComponentDocs } from './docs-contract';

describe('React Cascader documentation', () => {
  it('documents shared cascader scenes and framework navigation', () =>
    checkComponentDocs('cascader'));
});
