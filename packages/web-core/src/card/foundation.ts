export interface CardState {
  metaCount: number;
  gridCount: number;
}

export function getCardSize(size?: string) {
  return size === 'small' || size === 'mini' ? 'small' : 'medium';
}

export function getCardScrollMode(fullHeight: boolean, scrollbar: unknown) {
  return !fullHeight ? 'none' : scrollbar === false ? 'native' : 'custom';
}

export function createCardFoundation(state: CardState) {
  const register = (key: keyof CardState) => {
    state[key]++;
    return () => {
      state[key]--;
    };
  };
  return {
    get hasMeta() {
      return state.metaCount > 0;
    },
    get hasGrid() {
      return state.gridCount > 0;
    },
    registerMeta: () => register('metaCount'),
    registerGrid: () => register('gridCount'),
  };
}
