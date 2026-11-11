import { checkComponentDocs } from './docs-contract';

describe('React Table documentation', () => {
  it('documents shared table scenes and framework navigation', () => checkComponentDocs('table'));
});
