import { checkComponentDocs } from './docs-contract';

describe('React ColorPicker documentation', () => {
  it('documents shared color-picker scenes and framework navigation', () =>
    checkComponentDocs('color-picker'));
});
