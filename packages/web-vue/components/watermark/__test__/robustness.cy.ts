import { defineComponent, h } from 'vue';

import { useMutationObserver } from '../hooks/use-mutation-observer';
import Watermark from '../index';

describe('Watermark robustness', () => {
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
  for (const [textAlign, expectedX] of [
    ['left', 0],
    ['start', 0],
    ['center', 50],
    ['right', 100],
    ['end', 100],
  ] as const) {
    it(`positions ${textAlign}-aligned text within its measured tile`, () => {
      let textX: number | undefined;
      cy.window().then((win) => {
        const fillText = win.CanvasRenderingContext2D.prototype.fillText;
        cy.stub(win.CanvasRenderingContext2D.prototype, 'fillText').callsFake(function (
          this: CanvasRenderingContext2D,
          text: string,
          x: number,
          y: number,
        ) {
          if (text === 'SD') textX = this.getTransform().e + x;
          fillText.call(this, text, x, y);
        });
      });
      cy.mount(Watermark, {
        props: {
          content: 'SD',
          width: 100,
          height: 30,
          gap: [0, 0],
          rotate: 0,
          staggered: false,
          font: { textAlign },
        },
      });
      cy.window().then((win) => expect(textX).to.equal(expectedX * (win.devicePixelRatio || 1)));
    });
  }
});
