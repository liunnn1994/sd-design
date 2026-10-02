export interface ReleaseCommit {
  hash: string;
  message: string;
  [key: string]: unknown;
}
export interface ReleaseContext {
  commits: ReleaseCommit[];
  logger: { log: (...args: unknown[]) => void };
  [key: string]: unknown;
}
export type ReleasePluginConfig = Record<string, unknown>;
export type ReleaseType = 'major' | 'minor' | 'patch';
