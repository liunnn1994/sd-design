import { checkComponentDocs } from './docs-contract';

describe('React Sender documentation', () => {
  it('documents shared sender scenes and framework navigation', () => checkComponentDocs('sender'));
});
