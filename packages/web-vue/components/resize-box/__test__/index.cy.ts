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
    // ResizeTrigger 内部的 ResizeObserver 在挂载时会异步上报一次真实尺寸，
    // 先等它落地（inline style 出现 padding-right），再做手动 emit；否则这次
    // 异步回调可能落在手动 emit 之后，把 100px 覆盖回真实尺寸（约 6px）。
    cy.get('.sd-resizebox').invoke('attr', 'style').should('contain', 'padding-right');
    cy.get('@vue').then(({ wrapper }) => {
      wrapper
        .findComponent({ name: 'ResizeTrigger' })
        .vm.$emit('resize', { contentRect: { width: 100 } });
    });
    cy.get('.sd-resizebox').invoke('attr', 'style').should('contain', 'padding-right: 100px');
  });

  it('resizes via keyboard on the separator (role + arrow keys)', () => {
    cy.mount(ResizeBox, { props: { width: 500, directions: ['right'] } });
    cy.get('.sd-resizebox-direction-right').as('trigger');
    cy.get('@trigger').should('have.attr', 'role', 'separator');
    cy.get('@trigger').should('have.attr', 'tabindex', '0');
    cy.get('@trigger').should('have.attr', 'aria-orientation', 'vertical');
    cy.get('@trigger').should('have.attr', 'aria-label', '调整大小');
    // trigger has 0 height with no styled content — force past visibility check
    cy.get('@trigger').trigger('keydown', { key: 'ArrowRight', force: true });
    cy.get('@vue').should(({ wrapper }) => {
      const ev = wrapper.emitted('update:width');
      expect(ev, 'update:width emitted on ArrowRight').to.not.equal(undefined);
      expect(ev[0][0]).to.equal(510);
    });
  });
});
