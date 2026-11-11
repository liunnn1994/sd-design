import { useEffect, useState, useSyncExternalStore } from 'react';

import { createBrowserChat } from '../../home/browser-chat';

export function useBrowserChat() {
  const [store] = useState(() => createBrowserChat('react'));
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  useEffect(() => {
    store.start();
    return store.dispose;
  }, [store]);
  return { ...snapshot, send: store.send, stop: store.stop };
}
