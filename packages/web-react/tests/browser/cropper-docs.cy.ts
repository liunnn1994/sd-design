import { checkComponentDocs } from './docs-contract';
describe('React Cropper documentation', () => {
  it('documents shared cropper scenes and framework navigation', () =>
    checkComponentDocs('cropper'));
});
