export function createLayoutRegistry(state: { siders: string[] }) {
  return {
    addSider(id: string) {
      state.siders = [...state.siders, id];
    },
    removeSider(id: string) {
      state.siders = state.siders.filter((currentId) => currentId !== id);
    },
  };
}

export function resolveHasSider(
  hasSider: boolean | undefined,
  getSiderCount: () => number,
  scanChildren: () => boolean,
): boolean {
  if (typeof hasSider === 'boolean') return hasSider;
  if (getSiderCount() > 0) return true;
  return scanChildren();
}
