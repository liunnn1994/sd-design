import { checkComponentDocs } from './docs-contract';

describe('React Tree documentation', () => {
  it('documents shared tree scenes and framework navigation', () => checkComponentDocs('tree'));
});
