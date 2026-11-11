import { checkComponentDocs } from './docs-contract';

describe('React JsonForm documentation', () => {
  it('documents shared json-form scenes and framework navigation', () =>
    checkComponentDocs('json-form'));
});
