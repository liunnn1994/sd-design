import { computed, onBeforeUnmount, onMounted, shallowRef } from 'vue';

import { createBrowserChat } from './browser-chat';

export function useBrowserChat() {
  const store = createBrowserChat('vue');
  const snapshot = shallowRef(store.getSnapshot());
  const unsubscribe = store.subscribe(() => {
    snapshot.value = store.getSnapshot();
  });
  onMounted(store.start);
  onBeforeUnmount(() => {
    unsubscribe();
    store.dispose();
  });
  return {
    messages: computed(() => snapshot.value.messages),
    busy: computed(() => snapshot.value.busy),
    replying: computed(() => snapshot.value.replying),
    preparing: computed(() => snapshot.value.preparing),
    progress: computed(() => snapshot.value.progress),
    error: computed(() => snapshot.value.error),
    send: store.send,
    stop: store.stop,
  };
}
