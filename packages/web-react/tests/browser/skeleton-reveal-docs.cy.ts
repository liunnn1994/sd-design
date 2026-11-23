import { checkComponentDocs } from './docs-contract';

describe('SkeletonReveal documentation', () => {
  it('documents shared skeleton-reveal scenes and framework navigation', () =>
    checkComponentDocs('skeleton-reveal'));
});
