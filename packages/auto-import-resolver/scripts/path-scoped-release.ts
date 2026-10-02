import { analyzeCommits as analyzeConventionalCommits } from '@semantic-release/commit-analyzer';
import { generateNotes as generateConventionalNotes } from '@semantic-release/release-notes-generator';
import { execFileSync } from 'node:child_process';

import type { ReleaseCommit, ReleaseContext, ReleasePluginConfig } from './release-types.ts';

const RESOLVER_PATH_PREFIX = 'packages/auto-import-resolver/';

const getChangedFiles = (hash: string) => {
  if (!hash) {
    return [];
  }

  try {
    return execFileSync(
      'git',
      ['diff-tree', '--no-commit-id', '--name-only', '-r', '-m', '--root', hash],
      { encoding: 'utf8' },
    )
      .split('\n')
      .filter(Boolean);
  } catch {
    return [];
  }
};

export const filterResolverCommits = (
  commits: ReleaseCommit[],
  readChangedFiles = getChangedFiles,
) =>
  commits.filter((commit) =>
    readChangedFiles(commit.hash).some((file) => file.startsWith(RESOLVER_PATH_PREFIX)),
  );

const createResolverContext = (context: ReleaseContext) => {
  const commits = filterResolverCommits(context.commits ?? []);

  context.logger.log(
    'Filtered %d commits to %d auto-import-resolver commits',
    context.commits?.length ?? 0,
    commits.length,
  );

  return { ...context, commits };
};

export const analyzeCommits = (pluginConfig: ReleasePluginConfig, context: ReleaseContext) =>
  analyzeConventionalCommits(pluginConfig, createResolverContext(context));

export const generateNotes = (pluginConfig: ReleasePluginConfig, context: ReleaseContext) =>
  generateConventionalNotes(pluginConfig, createResolverContext(context));
