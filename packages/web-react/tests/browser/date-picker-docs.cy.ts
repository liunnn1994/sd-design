import { checkComponentDocs } from './docs-contract';

describe('React DatePicker documentation', () => {
  it('documents shared date-picker scenes and framework navigation', () =>
    checkComponentDocs('date-picker'));
});
