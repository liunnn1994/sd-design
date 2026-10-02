declare module '@semantic-release/commit-analyzer' {
  export function analyzeCommits(
    config: import('../packages/auto-import-resolver/scripts/release-types').ReleasePluginConfig,
    context: import('../packages/auto-import-resolver/scripts/release-types').ReleaseContext,
  ): Promise<import('../packages/auto-import-resolver/scripts/release-types').ReleaseType | null>;
}
declare module '@semantic-release/release-notes-generator' {
  export function generateNotes(
    config: import('../packages/auto-import-resolver/scripts/release-types').ReleasePluginConfig,
    context: import('../packages/auto-import-resolver/scripts/release-types').ReleaseContext,
  ): Promise<string>;
}

declare module 'stylelint-config-rational-order/config/configCreator.js' {
  const create: (options?: {
    'border-in-box-model'?: boolean;
    'empty-line-between-groups'?: boolean;
  }) => { emptyLineBefore: 'always' | 'never'; properties: string[]; groupName: string }[];
  export default create;
}
declare module 'stylelint-config-rational-order/groups/special.js' {
  const properties: string[];
  export default properties;
}
