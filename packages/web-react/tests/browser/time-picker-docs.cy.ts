import { checkComponentDocs } from './docs-contract';

describe('React TimePicker documentation', () => {
  it('documents shared time-picker scenes and framework navigation', () =>
    checkComponentDocs('time-picker'));
});
