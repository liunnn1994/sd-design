import { checkComponentDocs } from './docs-contract';

describe('React ModelSelector documentation', () => {
  it('documents shared model-selector scenes and framework navigation', () =>
    checkComponentDocs('model-selector'));
});
