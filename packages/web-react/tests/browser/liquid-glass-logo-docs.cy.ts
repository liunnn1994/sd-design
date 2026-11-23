import { checkComponentDocs } from './docs-contract';

describe('LiquidGlassLogo documentation', () => {
  it('documents shared liquid-glass-logo scenes and framework navigation', () =>
    checkComponentDocs('liquid-glass-logo'));
});
