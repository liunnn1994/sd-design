import { checkComponentDocs } from './docs-contract';

describe('ThinkingOrb documentation', () => {
  it('documents shared thinking-orb scenes and framework navigation', () =>
    checkComponentDocs('thinking-orb'));
});
