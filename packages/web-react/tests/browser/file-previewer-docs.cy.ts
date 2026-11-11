import { checkComponentDocs } from './docs-contract';

describe('React FilePreviewer documentation', () => {
  it('documents shared file-previewer scenes and framework navigation', () =>
    checkComponentDocs('file-previewer'));
});
