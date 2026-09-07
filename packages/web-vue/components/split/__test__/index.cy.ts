import Split from '../index';

// Split 读取 wrapper 的 clientWidth/clientHeight 和 window 上的 mouse 事件，
// 且 mousedown 处理是异步的。与 resize-box 一致：用带 pageX/pageY 的真实事件驱动。
const dragStart = (el: Element, pageX: number, pageY: number) => {
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

describe('Split', () => {
  it('exposes the separator and resizes via arrow keys', () => {
    cy.mount(Split, {
      props: { defaultSize: 0.5 },
      slots: { first: () => 'first pane', second: () => 'second pane' },
    });
    cy.get('.sd-split-trigger').as('trigger').focus();
    cy.get('@trigger').should('have.attr', 'role', 'separator');
    cy.get('@trigger').should('have.attr', 'tabindex', '0');
    cy.get('@trigger').should('have.attr', 'aria-orientation', 'vertical');
    cy.get('@trigger').should('have.attr', 'aria-label', '调整大小');
    cy.get('@trigger').trigger('keydown', { key: 'ArrowRight' });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:size'), 'update:size emitted on ArrowRight').to.not.equal(
        undefined,
      );
    });
  });

  it('renders both pane slots and drops the trigger when disabled', () => {
    cy.mount(Split, {
      slots: { first: () => 'first pane', second: () => 'second pane' },
    });
    cy.get('.sd-split-pane-first').should('contain', 'first pane');
    cy.get('.sd-split-pane-second').should('contain', 'second pane');

    cy.mount(Split, { props: { disabled: true } });
    cy.get('.sd-split-trigger').should('not.exist');
  });

  it('renders the wrapper as the tag from the component prop', () => {
    cy.mount(Split, { props: { component: 'section' } });
    cy.get('section.sd-split').should('exist');
  });

  it('switches to vertical direction with a horizontal separator', () => {
    cy.mount(Split, {
      props: { direction: 'vertical' },
      slots: { first: () => 'first', second: () => 'second' },
    });
    cy.get('.sd-split').should('have.class', 'sd-split-vertical');
    cy.get('.sd-split-trigger').should('have.attr', 'aria-orientation', 'horizontal');
  });

  it('sizes the first pane from a percentage or pixel size', () => {
    cy.mount(Split, {
      props: { defaultSize: 0.3 },
      attrs: { style: 'width: 400px' },
    });
    cy.get('.sd-split-pane-first').invoke('attr', 'style').should('contain', 'calc(30%');

    cy.mount(Split, {
      props: { defaultSize: '200px' },
      attrs: { style: 'width: 400px' },
    });
    cy.get('.sd-split-pane-first').invoke('attr', 'style').should('contain', 'calc(200px');
  });

  it('resizes via keyboard with min/max clamps (horizontal)', () => {
    cy.mount(Split, {
      props: { min: '150px', max: '350px', defaultSize: '340px' },
      attrs: { style: 'width: 400px' },
    });
    cy.get('.sd-split-trigger')
      .trigger('keydown', { key: 'ArrowRight' })
      .trigger('keydown', { key: 'ArrowRight' })
      .trigger('keydown', { key: 'ArrowLeft' });
    cy.get('@vue').should(({ wrapper }) => {
      const ev = wrapper.emitted('update:size');
      expect(ev, 'update:size emitted').to.not.equal(undefined);
      // +10 顶到 max 350 后不再重复 emit；ArrowLeft 退回 340
      expect(ev.map((item) => item[0])).to.deep.equal(['350px', '340px']);
    });
  });

  it('clamps keyboard resize at min and recovers (horizontal)', () => {
    cy.mount(Split, {
      props: { min: '150px', defaultSize: '160px' },
      attrs: { style: 'width: 400px' },
    });
    cy.get('.sd-split-trigger')
      .trigger('keydown', { key: 'ArrowLeft' })
      .trigger('keydown', { key: 'ArrowLeft' })
      .trigger('keydown', { key: 'ArrowRight' });
    cy.get('@vue').should(({ wrapper }) => {
      const ev = wrapper.emitted('update:size');
      expect(ev, 'update:size emitted').to.not.equal(undefined);
      // -10 触底 min 150 后不再重复 emit；ArrowRight 恢复 160
      expect(ev.map((item) => item[0])).to.deep.equal(['150px', '160px']);
    });
  });

  it('resizes via keyboard with ArrowDown/ArrowUp in vertical direction', () => {
    cy.mount(Split, {
      props: { direction: 'vertical', defaultSize: 0.5 },
      attrs: { style: 'height: 400px' },
    });
    cy.get('.sd-split-trigger')
      .trigger('keydown', { key: 'ArrowDown' })
      .trigger('keydown', { key: 'ArrowUp' });
    cy.get('@vue').should(({ wrapper }) => {
      const ev = wrapper.emitted('update:size');
      expect(ev, 'update:size emitted').to.not.equal(undefined);
      expect(ev.map((item) => item[0])).to.deep.equal([0.525, 0.5]);
    });
  });

  it('ignores non-arrow keys on the trigger', () => {
    cy.mount(Split, { attrs: { style: 'width: 400px' } });
    cy.get('.sd-split-trigger').trigger('keydown', { key: 'Home' });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:size')).to.equal(undefined);
    });
  });

  it('emits moveStart/moving/moveEnd and a ratio update:size across a drag', () => {
    cy.mount(Split, {
      props: { defaultSize: 0.5 },
      attrs: { style: 'width: 400px' },
      slots: { first: () => 'first', second: () => 'second' },
    });
    cy.get('.sd-split-trigger').then(($el) => dragStart($el[0], 200, 0));
    // mousedown 处理是异步的，等光标变为 col-resize 确认 window 监听已绑定
    cy.get('body').should('have.css', 'cursor', 'col-resize');
    windowMouse('mousemove', 300, 0);
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('moveStart')).to.have.length(1);
      expect(wrapper.emitted('moving')).to.have.length(1);
      expect(wrapper.emitted('update:size')).to.have.length(1);
      const ev = wrapper.emitted('update:size');
      expect(ev[0][0]).to.equal(0.75);
    });
    windowMouse('mouseup', 300, 0);
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('moveEnd')).to.have.length(1);
    });
    cy.get('body').should('have.css', 'cursor', 'default');
  });

  it('clamps drags to min and max', () => {
    cy.mount(Split, {
      props: { defaultSize: 0.5, min: 0.25, max: 0.75 },
      attrs: { style: 'width: 400px' },
    });
    cy.get('.sd-split-trigger').then(($el) => dragStart($el[0], 200, 0));
    cy.get('body').should('have.css', 'cursor', 'col-resize');
    windowMouse('mousemove', 350, 0);
    windowMouse('mousemove', 50, 0);
    cy.get('@vue').should(({ wrapper }) => {
      const ev = wrapper.emitted('update:size');
      expect(ev, 'update:size emitted').to.not.equal(undefined);
      // 200px ± 150px 分别被 max 0.75 / min 0.25 截断
      expect(ev.map((item) => item[0])).to.deep.equal([0.75, 0.25]);
    });
  });

  it('clamps an out-of-range defaultSize on mount and emits update:size', () => {
    cy.mount(Split, {
      props: { defaultSize: '50px', min: '150px' },
      attrs: { style: 'width: 400px' },
    });
    // flex-basis 会减去 trigger 宽度的一半（约 3px），用容差断言
    cy.get('.sd-split-pane-first').should(($el) => {
      const flex = $el[0].style.flex || '';
      const m = flex.match(/calc\((\d+(?:\.\d+)?)px/);
      const basis = m ? parseFloat(m[1]) : NaN;
      expect(basis, 'first pane basis clamped to min 150px').to.be.closeTo(150, 4);
    });
    cy.get('@vue').should(({ wrapper }) => {
      const ev = wrapper.emitted('update:size') ?? [];
      expect(ev.map((item) => item[0])).to.deep.equal(['150px']);
    });
  });
});
