import { defineComponent, h } from 'vue';

import { useMutationObserver } from '../hooks/use-mutation-observer';
import Watermark from '../index';

describe('Watermark robustness', () => {
  it('removes its generated layer from the retained root when unmounted', () => {
    cy.mount(Watermark, { props: { content: 'Owned layer' } });
    cy.get('.sd-watermark').then(($root) => {
      expect($root[0].children).to.have.length(1);
      cy.get('@vue').then(({ wrapper }) => wrapper.unmount());
      cy.then(() => expect($root[0].children).to.have.length(0));
    });
  });
  it('renders an empty content array without invalid canvas dimensions', () => {
    cy.mount(Watermark, { props: { content: [] } });
    cy.get('.sd-watermark').should(($element) => {
      const layer = $element[0].lastElementChild as HTMLElement;
      expect(layer).not.to.equal(null);
      expect(layer.style.backgroundImage).to.contain('data:image/png');
      expect(layer.style.backgroundSize).not.to.contain('Infinity');
    });
  });

  it('uses the supplied window observer and disconnects it on unmount', () => {
    const observe = cy.stub();
    const disconnect = cy.stub();
    const Observer = cy.stub().returns({ observe, disconnect });
    const target = document.createElement('div');
    const customWindow = { MutationObserver: Observer } as unknown as Window;
    cy.mount(
      defineComponent({
        setup() {
          useMutationObserver(target, () => {}, { window: customWindow, childList: true });
          return () => h('div');
        },
      }),
    );
    cy.then(() => {
      expect(Observer.callCount).to.equal(1);
      expect(observe).to.have.been.calledOnceWith(target, { childList: true });
    });
    cy.get('@vue').then(({ wrapper }) => wrapper.unmount());
    cy.then(() => expect(disconnect).to.have.been.calledOnce);
  });
});
