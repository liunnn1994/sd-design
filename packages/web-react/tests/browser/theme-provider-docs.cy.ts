import { checkComponentDocs } from './docs-contract';

describe('React ThemeProvider documentation', () => {
  it('documents shared theme-provider scenes and framework navigation', () =>
    checkComponentDocs('theme-provider'));
});
