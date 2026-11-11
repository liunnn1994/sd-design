import { analyzeCommits as analyzeConventionalCommits } from '@semantic-release/commit-analyzer';
import { generateNotes as generateConventionalNotes } from '@semantic-release/release-notes-generator';
import { execFileSync } from 'node:child_process';

import type { ReleaseContext } from '../../auto-import-resolver/scripts/release-types.ts';

import { sharedDependenciesChanged } from './release-dependencies.ts';

interface ScopedConfig {
  paths: string[];
}

const scopedContext = ({ paths }: ScopedConfig, context: ReleaseContext) => ({
  ...context,
  commits: context.commits.filter((commit) => {
    const files = execFileSync(
      'git',
      ['diff-tree', '--no-commit-id', '--name-only', '-r', '-m', '--root', commit.hash],
      { cwd: context.cwd as string, encoding: 'utf8' },
    ).split(/\r?\n/);
    return (
      files.some((file) => paths.some((prefix) => file.startsWith(prefix))) ||
      (files.some((file) => file === 'pnpm-workspace.yaml' || file === 'pnpm-lock.yaml') &&
        sharedDependenciesChanged(context.cwd as string, commit.hash, paths))
    );
  }),
});

export const analyzeCommits = (config: ScopedConfig, context: ReleaseContext) =>
  analyzeConventionalCommits({}, scopedContext(config, context));

export const generateNotes = (config: ScopedConfig, context: ReleaseContext) =>
  generateConventionalNotes({}, scopedContext(config, context));
