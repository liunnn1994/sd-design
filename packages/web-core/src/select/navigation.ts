export interface SelectNavigationAdapter<E extends { preventDefault: () => void }> {
  getEnabledKeys: () => string[];
  getActiveKey: () => string | undefined;
  getValueKeys: () => string[];
  getDefaultActiveFirst: () => boolean | undefined;
  getLoading: () => boolean | undefined;
  getPopupVisible: () => boolean;
  getEnterToOpen: () => boolean;
  setActiveKey: (key: string | undefined) => void;
  scrollIntoView: (key: string) => void;
  select: (key: string, event: E) => void;
  setPopupVisible: (visible: boolean) => void;
  afterRender: (task: () => void) => void;
}

export function createSelectNavigation<E extends { preventDefault: () => void }>(
  adapter: SelectNavigationAdapter<E>,
) {
  function enabledKeysChanged(keys: string[]) {
    const active = adapter.getActiveKey();
    if (!active || !keys.includes(active)) adapter.setActiveKey(keys[0]);
  }
  function getNextActiveKey(direction: 'up' | 'down') {
    const keys = adapter.getEnabledKeys();
    if (!keys.length) return;
    const active = adapter.getActiveKey();
    if (!active) return direction === 'down' ? keys[0] : keys[keys.length - 1];
    const index = keys.indexOf(active);
    return keys[(keys.length + index + (direction === 'up' ? -1 : 1)) % keys.length];
  }
  function opened() {
    const values = adapter.getValueKeys();
    const current = values[values.length - 1];
    const enabled = adapter.getEnabledKeys();
    let active = (adapter.getDefaultActiveFirst() ?? true) ? enabled[0] : undefined;
    if (enabled.includes(current)) active = current;
    if (active !== adapter.getActiveKey()) adapter.setActiveKey(active);
    adapter.afterRender(() => {
      const key = adapter.getActiveKey();
      if (key) adapter.scrollIntoView(key);
    });
  }
  function keydown(key: string, event: E, composing = false) {
    if (key === 'Enter') {
      if (adapter.getLoading() || composing) return;
      if (adapter.getPopupVisible()) {
        const active = adapter.getActiveKey();
        if (active) {
          adapter.select(active, event);
          event.preventDefault();
        }
      } else if (adapter.getEnterToOpen()) {
        adapter.setPopupVisible(true);
        event.preventDefault();
      }
    } else if (key === 'Escape') {
      if (adapter.getPopupVisible()) {
        adapter.setPopupVisible(false);
        event.preventDefault();
      }
    } else if ((key === 'ArrowDown' || key === 'ArrowUp') && adapter.getPopupVisible()) {
      const next = getNextActiveKey(key === 'ArrowDown' ? 'down' : 'up');
      if (next) {
        adapter.setActiveKey(next);
        adapter.scrollIntoView(next);
      }
      event.preventDefault();
    }
  }
  return { enabledKeysChanged, getNextActiveKey, opened, keydown };
}
