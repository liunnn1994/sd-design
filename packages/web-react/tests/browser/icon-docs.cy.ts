import { checkComponentDocs } from './docs-contract';

describe('React icon documentation', () => {
  it('documents shared icon scenes and framework navigation', () => checkComponentDocs('icon'));
  it('documents shared icon-component scenes and framework navigation', () =>
    checkComponentDocs('icon-component'));
});
