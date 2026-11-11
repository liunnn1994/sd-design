import { checkComponentDocs } from './docs-contract';

describe('React Calendar documentation', () => {
  it('documents shared calendar scenes and framework navigation', () =>
    checkComponentDocs('calendar'));
});
