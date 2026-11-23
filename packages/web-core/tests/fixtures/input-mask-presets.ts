import type { InputMaskPresetName } from '../../src/input-mask/types.ts';

export const inputMaskPresetCases = [
  ['mime-type', 'application/json', 'application/json'],
  ['jwt', 'header.payload.signature', 'header.payload.signature'],
  ['fqdn', 'example.com', 'example.com'],
  ['issn', '1234567X', '1234-567X'],
  ['isrc', 'USAAA2612345', 'US-AAA-26-12345'],
  ['iso6346', 'MSCU1234567', 'MSCU 123456 7'],
] as const satisfies ReadonlyArray<readonly [InputMaskPresetName, string, string]>;
