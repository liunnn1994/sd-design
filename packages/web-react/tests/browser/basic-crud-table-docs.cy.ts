import { checkComponentDocs } from './docs-contract';

describe('React BasicCrudTable documentation', () => {
  it('documents shared basic-crud-table scenes and framework navigation', () =>
    checkComponentDocs('basic-crud-table'));
});
