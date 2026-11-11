import { checkComponentDocs } from './docs-contract';

describe('shared React documentation 2', () => {
  for (const component of [
    'select',
    'input-tag',
    'copy',
    'secret',
    'notification',
    'input-mask',
    'verification-code',
    'slider',
    'rate',
    'checkbox',
    'radio',
    'input-number',
    'textarea',
    'input',
    'form',
    'tag',
    'switch',
  ]) {
    it(component + ': shared scenes, navigation and framework counterpart', () =>
      checkComponentDocs(component),
    );
  }
});
