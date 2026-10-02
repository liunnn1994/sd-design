export const omit = <T extends object, K extends keyof T>(
  object: T,
  path: Array<K>,
): Omit<T, K> => {
  const result = { ...object } as Omit<T, K>;

  for (const item of path) {
    if (item in result) {
      delete (result as Record<string, unknown>)[item as string];
    }
  }

  return result;
};
