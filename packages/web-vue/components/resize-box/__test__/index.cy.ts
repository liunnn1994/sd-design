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

  it('renders the wrapper as the tag from the component prop', () => {
    cy.mount(ResizeBox, { props: { component: 'section' } });
    cy.get('section.sd-resizebox').should('exist');
  });

  it('renders one trigger per configured direction and drops invalid ones', () => {
    cy.mount(ResizeBox, {
      props: {
        directions: ['right', 'diagonal'] as unknown as ('left' | 'right' | 'top' | 'bottom')[],
      },
    });
    cy.get('.sd-resizebox-trigger').should('have.length', 1);
    cy.get('.sd-resizebox-direction-right').should('exist');
    cy.get('.sd-resizebox-direction-diagonal').should('not.exist');
  });

  it('labels horizontal triggers with horizontal aria-orientation', () => {
    cy.mount(ResizeBox, { props: { directions: ['top'] } });
    cy.get('.sd-resizebox-direction-top').should('have.attr', 'aria-orientation', 'horizontal');
  });

  it('emits update:width and moving sized from the live width plus the drag offset', () => {
    cy.mount(ResizeBox, { props: { width: 500, height: 200 } });
    // ResizeTrigger 内部的 ResizeObserver 在挂载时会异步上报一次真实尺寸，
    // 先等它落地（inline style 出现 padding-right）再读 live 尺寸并拖拽；否则
    // 异步回调可能落在读数与拖拽之间，改变 startWidth 的取值。
    cy.get('.sd-resizebox').invoke('attr', 'style').should('contain', 'padding-right');
    cy.get('.sd-resizebox').then(($el) => {
      const el = $el[0];
      const startWidth = el.clientWidth - parseFloat(el.style.paddingRight || '0');
      cy.get('.sd-resizebox-direction-right').then(($trigger) => mouseDown($trigger[0], 200, 0));
      windowMouse('mousemove', 100, 0);
      cy.get('@vue').should(({ wrapper }) => {
        const widthEvents = wrapper.emitted('update:width');
        expect(widthEvents, 'update:width emitted').to.not.equal(undefined);
        expect(widthEvents[0][0]).to.equal(startWidth - 100);
        const moving = wrapper.emitted('moving');
        expect(moving, 'moving emitted').to.have.length(1);
        expect(moving[0][0]).to.deep.equal({ width: startWidth - 100, height: 200 });
      });
    });
  });

  it('stops emitting moving after mouseup', () => {
    cy.mount(ResizeBox, { props: { width: 500 } });
    cy.get('.sd-resizebox-direction-right').then(($el) => mouseDown($el[0], 200, 0));
    windowMouse('mousemove', 100, 0);
    windowMouse('mouseup', 100, 0);
    windowMouse('mousemove', 50, 0);
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('moving')).to.have.length(1);
      expect(wrapper.emitted('update:width')).to.have.length(1);
    });
  });

  it('ends the drag and stops resizing on contextmenu', () => {
    cy.mount(ResizeBox, { props: { width: 500 } });
    cy.get('.sd-resizebox-direction-right').then(($el) => mouseDown($el[0], 200, 0));
    windowMouse('contextmenu', 0, 0);
    windowMouse('mousemove', 100, 0);
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('movingEnd')).to.have.length(1);
      expect(wrapper.emitted('moving')).to.equal(undefined);
    });
  });

  it('sets the body cursor during drag and resets it on mouseup', () => {
    cy.mount(ResizeBox, { props: { width: 500 } });
    cy.get('.sd-resizebox-direction-right').then(($el) => mouseDown($el[0], 200, 0));
    cy.get('body').should('have.css', 'cursor', 'col-resize');
    windowMouse('mouseup', 200, 0);
    cy.get('body').should('have.css', 'cursor', 'default');
  });

  it('steps keyboard resize by 10, by 20 with Shift, and shrinks with ArrowLeft', () => {
    cy.mount(ResizeBox, { props: { width: 500, directions: ['right'] } });
    cy.get('.sd-resizebox-direction-right')
      .trigger('keydown', { key: 'ArrowLeft', force: true })
      .trigger('keydown', { key: 'ArrowRight', shiftKey: true, force: true });
    cy.get('@vue').should(({ wrapper }) => {
      const ev = wrapper.emitted('update:width');
      expect(ev, 'update:width emitted').to.not.equal(undefined);
      // ArrowLeft = -10；Shift+ArrowRight = 基础步进 + 附加步进（+10+20）
      expect(ev.map((item) => item[0])).to.deep.equal([490, 520]);
    });
  });

  it('clamps mouse-drag resize at zero', () => {
    cy.mount(ResizeBox, { props: { width: 5 } });
    cy.get('.sd-resizebox-direction-right').then(($el) => mouseDown($el[0], 200, 0));
    // 向左拖出起点（delta -100）→ 负宽度被钳制为 0
    windowMouse('mousemove', 100, 0);
    cy.get('@vue').should(({ wrapper }) => {
      const ev = wrapper.emitted('update:width');
      expect(ev, 'update:width emitted').to.not.equal(undefined);
      expect(ev[0][0]).to.equal(0);
    });
  });

  it('clamps keyboard resize at zero', () => {
    cy.mount(ResizeBox, { props: { width: 5, directions: ['right'] } });
    cy.get('.sd-resizebox-direction-right').trigger('keydown', { key: 'ArrowLeft', force: true });
    cy.get('@vue').should(({ wrapper }) => {
      const ev = wrapper.emitted('update:width');
      expect(ev, 'update:width emitted').to.not.equal(undefined);
      expect(ev[0][0]).to.equal(0);
    });
  });

  it('ignores non-arrow keys on the trigger', () => {
    cy.mount(ResizeBox, { props: { width: 500, directions: ['right'] } });
    cy.get('.sd-resizebox-direction-right').trigger('keydown', { key: 'Home', force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:width')).to.equal(undefined);
    });
  });

  it('resizes height from the top and bottom triggers via arrow keys', () => {
    cy.mount(ResizeBox, { props: { height: 200, directions: ['top', 'bottom'] } });
    cy.get('.sd-resizebox-direction-top').trigger('keydown', { key: 'ArrowUp', force: true });
    cy.get('.sd-resizebox-direction-bottom').trigger('keydown', { key: 'ArrowUp', force: true });
    cy.get('@vue').should(({ wrapper }) => {
      const ev = wrapper.emitted('update:height');
      expect(ev, 'update:height emitted').to.not.equal(undefined);
      // 方向键跟随边缘方向：top 上 ArrowUp 增大，bottom 上 ArrowUp 缩小
      expect(ev.map((item) => item[0])).to.deep.equal([210, 190]);
    });
  });

  it('supports the resize-trigger slot with direction binding', () => {
    cy.mount(ResizeBox, {
      props: { directions: ['right', 'bottom'] },
      slots: {
        'resize-trigger':
          '<template #resize-trigger="{ direction }"><span class="custom-trigger">{{ direction }}</span></template>',
      },
    });

    cy.get('.custom-trigger').should('have.length', 2);
    cy.get('.custom-trigger').eq(0).should('have.text', 'right');
    cy.get('.custom-trigger').eq(1).should('have.text', 'bottom');
  });

  it('supports the resize-trigger-icon slot with direction binding', () => {
    cy.mount(ResizeBox, {
      props: { directions: ['left'] },
      slots: {
        'resize-trigger-icon':
          '<template #resize-trigger-icon="{ direction }"><i class="custom-icon" :data-direction="direction"></i></template>',
      },
    });

    cy.get('.custom-icon').should('have.attr', 'data-direction', 'left');
  });
});
