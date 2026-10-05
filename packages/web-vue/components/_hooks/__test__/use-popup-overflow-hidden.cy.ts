import { defineComponent, h, nextTick, reactive } from 'vue';

import usePopupOverflowHidden from '../use-popup-overflow-hidden';

const createHost = (container: HTMLElement | undefined, hidden: boolean) => {
  const state = reactive({ container, hidden });

  const Host = defineComponent({
    setup() {
      usePopupOverflowHidden(state);
      return () => h('div');
    },
  });

  return { state, Host };
};

const createContainer = (overflow: string) => {
  const el = document.createElement('div');
  el.style.overflow = overflow;
  document.body.appendChild(el);
  return el;
};

describe('usePopupOverflowHidden', () => {
  it('restores overflow when the popup closes', () => {
    const container = createContainer('auto');
    const { state, Host } = createHost(container, true);

    cy.mount(Host).then(async () => {
      await nextTick();
      expect(container.style.overflow).to.eq('hidden');

      state.hidden = false;
      await nextTick();
      expect(container.style.overflow).to.eq('auto');

      container.remove();
    });
  });

  it('restores the locked element when the container changes while hidden', () => {
    const first = createContainer('auto');
    const second = createContainer('auto');
    const { state, Host } = createHost(first, true);

    cy.mount(Host).then(async () => {
      await nextTick();
      expect(first.style.overflow).to.eq('hidden');

      // 锁定期间换容器：旧的容器必须被还原，不能永远留着 overflow: hidden
      state.container = second;
      await nextTick();

      expect(first.style.overflow).to.eq('auto');
      expect(second.style.overflow).to.eq('hidden');

      state.hidden = false;
      await nextTick();
      expect(second.style.overflow).to.eq('auto');

      first.remove();
      second.remove();
    });
  });

  it('keeps the original width of the locked element', () => {
    const container = createContainer('auto');
    container.style.width = '320px';
    const { state, Host } = createHost(container, true);

    cy.mount(Host).then(async () => {
      await nextTick();

      state.hidden = false;
      await nextTick();
      expect(container.style.width).to.eq('320px');

      container.remove();
    });
  });
});
