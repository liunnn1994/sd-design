import type { NoticeConfig, NoticeId, NoticeReturn } from './types.js';

import { isString, isUndefined } from '../_utils/is.js';

export function resolveNoticeConfig<Config extends NoticeConfig, Type extends string>(
  type: Type,
  config: string | Config,
  defaults?: { deduplicate?: boolean; deduplicateByType?: boolean },
) {
  const options = isString(config) ? undefined : config;
  return {
    type,
    ...(isString(config) ? { content: config } : config),
    deduplicate: options?.deduplicate ?? defaults?.deduplicate ?? false,
    deduplicateByType: options?.deduplicateByType ?? defaults?.deduplicateByType ?? true,
  };
}

interface NoticeManager<Config> {
  add(config: Config): NoticeReturn;
  reuse(config: Config): NoticeReturn | undefined;
  remove(id: NoticeId): void;
  clear(): void;
  destroy(): void;
  isDisconnected(): boolean;
}

export function createNoticeService<
  Position extends string,
  Config extends NoticeConfig & { position?: Position },
  Context,
>(adapter: {
  defaultPosition: Position;
  create(config: Config, context: Context): NoticeManager<Config>;
}) {
  const instances: Partial<Record<Position, NoticeManager<Config>>> = {};
  const all = () => Object.values<NoticeManager<Config> | undefined>(instances);
  return {
    open(config: Config, context: Context) {
      const { position = adapter.defaultPosition } = config;
      for (const instance of all()) {
        if (instance?.isDisconnected()) {
          instance.clear();
          instance.destroy();
        }
      }
      if (config.deduplicate && isUndefined(config.id)) {
        for (const instance of all()) {
          const reused = instance?.reuse(config);
          if (reused) return reused;
        }
      }
      if (!instances[position]) instances[position] = adapter.create(config, context);
      return instances[position]!.add(config);
    },
    release(position: Position) {
      instances[position] = undefined;
    },
    remove(id: NoticeId) {
      all().forEach((instance) => instance?.remove(id));
    },
    clear(position?: Position) {
      if (position) instances[position]?.clear();
      else all().forEach((instance) => instance?.clear());
    },
  };
}
