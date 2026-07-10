import ResizeBox from '..';

// ResizeBox reads the box's clientWidth/clientHeight and window mouse events.
// Drive it with real window events (pageX/pageY on the MouseEvent) rather than
// mocking window.addEventListener.
const mouseDown = (el: Element, pageX: number, pageY: number) => {
  const evt = new MouseEvent('mousedown', { bubbles: true });
  Object.defineProperties(evt, {
    pageX: { configurable: true, get: () => pageX },
    pageY: { configurable: true, get: () => pageY },
  });
  el.dispatchEvent(evt);
};

const windowMouse = (type: string, pageX: number, pageY: number) =>
  cy.window().then((win) => {
    const evt = new MouseEvent(type);
    Object.defineProperties(evt, {
      pageX: { configurable: true, get: () => pageX },
      pageY: { configurable: true, get: () => pageY },
    });
    win.dispatchEvent(evt);
  });

describe('ResizeBox', () => {
  it('emits movingStart/moving/movingEnd across a drag', () => {
    cy.mount(ResizeBox, { props: { width: 500, height: 200 } });
    cy.get('.sd-resizebox-direction-right').then(($el) => mouseDown($el[0], 200, 0));
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('movingStart')).to.have.length(1);
    });
    windowMouse('mousemove', 100, 0);
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('moving')).to.have.length(1);
      expect(wrapper.emitted('update:width')).to.have.length(1);
    });
    windowMouse('mouseup', 100, 0);
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('movingEnd')).to.have.length(1);
    });
  });

  ['top', 'right', 'bottom', 'left'].forEach((direction) => {
    const isHorizontal = direction === 'right' || direction === 'left';
    it(`emits ${isHorizontal ? 'update:width' : 'update:height'} from the ${direction} trigger`, () => {
      cy.mount(ResizeBox, { props: { directions: [direction] } });
      cy.get(`.sd-resizebox-direction-${direction}`).then(($el) =>
        mouseDown($el[0], isHorizontal ? 200 : 0, isHorizontal ? 0 : 200),
      );
      windowMouse('mousemove', isHorizontal ? 100 : 0, isHorizontal ? 0 : 100);
      cy.get('@vue').should(({ wrapper }) => {
        expect(wrapper.emitted(isHorizontal ? 'update:width' : 'update:height')).to.have.length(1);
      });
    });
  });

  it('updates padding when the ResizeTrigger reports a new size', () => {
    cy.mount(ResizeBox);
    cy.get('@vue').then(({ wrapper }) => {
      wrapper
        .findComponent({ name: 'ResizeTrigger' })
        .vm.$emit('resize', { contentRect: { width: 100 } });
    });
    cy.get('.sd-resizebox').invoke('attr', 'style').should('contain', 'padding-right: 100px');
  });
});
