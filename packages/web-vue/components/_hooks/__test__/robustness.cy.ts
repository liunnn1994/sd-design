import { defineComponent, h, onMounted, ref } from 'vue';

import { useOverflow } from '../use-overflow';
import usePopupManager from '../use-popup-manager';
import { useThemeMode } from '../use-theme-mode';

describe('Shared hook robustness', () => {
  const cleanups: Array<() => void> = [];
  afterEach(() => cleanups.splice(0).forEach((cleanup) => cleanup()));
  it('releases every popup layer after repeated open calls', () => {
    cy.mount(
      defineComponent({
        setup() {
          return usePopupManager('popup');
        },
        render() {
          return h('div');
        },
      }),
    );
    cy.get('@vue').then(({ wrapper }) => {
      wrapper.vm.open();
      const first = wrapper.vm.zIndex;
      wrapper.vm.open();
      wrapper.vm.close();
      wrapper.vm.open();
      expect(wrapper.vm.zIndex).to.equal(first);
    });
  });

  it('restores an overflow lock when its owning scope unmounts', () => {
    const container = document.createElement('div');
    container.style.cssText = 'width: 100px; height: 20px; overflow: auto';
    container.innerHTML = '<div style="height: 40px"></div>';
    document.body.appendChild(container);
    cleanups.push(() => container.remove());
    cy.mount(
      defineComponent({
        setup() {
          const { setOverflowHidden } = useOverflow(ref(container));
          onMounted(setOverflowHidden);
          return () => h('div');
        },
      }),
    );
    cy.then(() => expect(container.style.overflow).to.equal('hidden'));
    cy.get('@vue').then(({ wrapper }) => wrapper.unmount());
    cy.then(() => {
      expect(container.style.overflow).to.equal('auto');
      container.remove();
    });
  });

  it('follows theme changes on the document root ancestor', () => {
    let restoreTheme: () => void;
    cy.document().then((doc) => {
      const previous = doc.documentElement.getAttribute('sd-theme');
      doc.documentElement.removeAttribute('sd-theme');
      restoreTheme = () => {
        if (previous === null) doc.documentElement.removeAttribute('sd-theme');
        else doc.documentElement.setAttribute('sd-theme', previous);
      };
      cleanups.push(restoreTheme);
    });
    cy.mount(
      defineComponent({
        setup() {
          const target = ref<HTMLDivElement | null>(null);
          const mode = useThemeMode(target);
          return () => h('div', { 'ref': target, 'data-cy': 'root-theme' }, mode.value);
        },
      }),
    );
    cy.get('[data-cy=root-theme]').should('have.text', 'light');
    cy.document().then((doc) => doc.documentElement.setAttribute('sd-theme', 'dark'));
    cy.get('[data-cy=root-theme]').should('have.text', 'dark');
    cy.then(() => restoreTheme());
  });
});
