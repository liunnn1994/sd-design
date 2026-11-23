import { checkComponentDocs } from './docs-contract';

describe('VoiceGlow documentation', () => {
  it('documents shared voice-glow scenes and framework navigation', () =>
    checkComponentDocs('voice-glow'));
});
