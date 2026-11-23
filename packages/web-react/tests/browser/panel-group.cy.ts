import { moveMouseAway, moveMouseTo } from '../../../web-core/tests/browser/hover-intent';

describe('PanelGroup React', { scrollBehavior: false }, () => {
  const main = '[data-testid="panel-main"]';
  const grip = `${main} [role="separator"]`;
  const sized = `${main} > .sd-panel`;
  const button = (name = '') => cy.get(`[data-testid="panel-${name}"]`).click();
  const drag = (dx = 0, dy = 0) =>
    cy
      .get(grip)
      .trigger('pointerdown', { clientX: 400, clientY: 150, pointerId: 1 })
      .trigger('pointermove', { clientX: 400 + dx, clientY: 150 + dy, pointerId: 1 })
      .trigger('pointerup', { clientX: 400 + dx, clientY: 150 + dy, pointerId: 1 });
  beforeEach(() => {
    cy.visit('/panel-group.html');
    cy.get(main).scrollIntoView();
    cy.get(sized).should('have.css', 'width', '200px');
  });
  it('renders native roots, nested groups and accessible grips with shared appearance', () => {
    cy.get(main).should('have.prop', 'tagName', 'SECTION');
    cy.get(grip).should('have.attr', 'aria-label', 'Resize workspace');
    cy.get(grip)
      .should('have.attr', 'aria-orientation', 'vertical')
      .and('have.css', 'cursor', 'col-resize');
    cy.get(`${grip} .sd-resizebox-trigger-icon-wrapper`)
      .should('have.css', 'width', '1px')
      .and('be.empty');
    cy.get('[data-testid="panel-nested"]').should('have.css', 'overflow', 'visible');
    button('read-refs');
    cy.get('[data-testid="panel-refs"]').should('have.text', 'SECTION|sd-panel-content|separator');
    button('custom');
    cy.get('[data-testid="panel-custom-grip"]').should('be.visible');
    cy.get(`${grip} .sd-resizebox-trigger-icon-wrapper`).should('not.exist');
  });
  it('widens only the divider while the pointer is over its grip', () => {
    const divider = `${grip} .sd-resizebox-trigger-icon-wrapper`;
    cy.window().should((win) => {
      expect(win.matchMedia('(hover: hover)').matches).to.equal(true);
    });
    moveMouseTo(grip);
    cy.get(divider).should(($divider) => {
      expect($divider[0].getBoundingClientRect().width).to.equal(1.5);
    });
    cy.get(sized).should('have.css', 'width', '200px');
    cy.get(`${main} > .sd-panel-fill`).should('have.css', 'width', '400px');
    moveMouseAway();
    cy.get(divider).should(($divider) => {
      expect($divider[0].getBoundingClientRect().width).to.equal(1);
    });
  });
  it('resizes by arrow and shifted arrow keys and clamps at both bounds', () => {
    cy.get(grip).trigger('keydown', { key: 'ArrowRight' });
    cy.get('[data-testid="panel-size"]').should('have.text', '210');
    cy.get(grip).trigger('keydown', { key: 'ArrowRight', shiftKey: true });
    cy.get('[data-testid="panel-size"]').should('have.text', '260');
    cy.get(grip).trigger('keydown', { key: 'End' });
    cy.get('[data-testid="panel-size"]').should('have.text', '400');
    cy.get(grip).trigger('keydown', { key: 'Home' });
    cy.get('[data-testid="panel-size"]').should('have.text', '80');
    cy.get(grip).trigger('keydown', { key: 'ArrowLeft' });
    cy.get('[data-testid="panel-size"]').should('have.text', '80');
  });
  it('publishes live pointer updates and both panel and group lifecycle callbacks', () => {
    cy.get(grip).trigger('pointerdown', { clientX: 400, clientY: 150, pointerId: 1 });
    cy.get('[data-testid="panel-events"]')
      .should('contain.text', 'panel:start')
      .and('contain.text', 'group:start');
    cy.get(grip).trigger('pointermove', { clientX: 460, clientY: 150, pointerId: 1 });
    cy.get('[data-testid="panel-size"]').should('have.text', '260');
    cy.get('[data-testid="panel-state"]').should('contain.text', '"dragging":true');
    cy.get(grip).trigger('pointerup', { clientX: 480, clientY: 150, pointerId: 1 });
    cy.get('[data-testid="panel-size"]').should('have.text', '280');
    cy.get('[data-testid="panel-events"]')
      .should('contain.text', 'panel:moving')
      .and('contain.text', 'group:moving')
      .and('contain.text', 'panel:end')
      .and('contain.text', 'group:end');
    cy.get('[data-testid="panel-state"]').should('contain.text', '"dragging":false');
    cy.get('body').should('not.have.css', 'user-select', 'none');
  });
  it('commits the final position when pointer release outruns movement rendering', () => {
    cy.window().then((win) =>
      cy.get(grip).then(($grip) => {
        const node = $grip[0];
        for (const [type, clientX] of [
          ['pointerdown', 400],
          ['pointermove', 410],
          ['pointerup', 520],
        ]) {
          node.dispatchEvent(
            new win.PointerEvent(String(type), {
              clientX: Number(clientX),
              clientY: 150,
              pointerId: 1,
              bubbles: true,
            }),
          );
        }
      }),
    );
    cy.get('[data-testid="panel-size"]').should('have.text', '320');
    cy.get(sized).should('have.css', 'width', '320px');
  });
  it('publishes press and release without moving the panel', () => {
    const point = { clientX: 400, clientY: 150, pointerId: 1 };
    cy.get(grip).trigger('pointerdown', point);
    cy.get('[data-testid="panel-events"]').should('have.text', 'panel:start|group:start');
    cy.get(grip).trigger('pointerup', point);
    cy.get('[data-testid="panel-events"]').should(
      'have.text',
      'panel:start|group:start|panel:end|group:end',
    );
    cy.get(sized).should('have.css', 'width', '200px');
    cy.get('body').should('not.have.css', 'user-select', 'none');
  });
  it('releases the fill panel layout when the sized panel is removed by its final resize', () => {
    button('remove-sized');
    const point = { clientX: 400, clientY: 150, pointerId: 1 };
    cy.get(grip).trigger('pointerdown', point);
    cy.get(grip).trigger('pointermove', { ...point, clientX: 480 });
    cy.get('[data-testid="panel-size"]').should('have.text', '280');
    cy.get(grip).trigger('pointerup', { ...point, clientX: 520 });
    cy.get(sized).should('not.exist');
    cy.get(grip).should('not.exist');
    cy.get(`${main} > .sd-panel-fill`).should('have.css', 'overflow', 'visible');
    cy.get('[data-testid="panel-fill-content"]').should('have.css', 'width', '600px');
    cy.get('body').should('not.have.css', 'user-select', 'none');
  });
  it('refreshes accessible bounds after layout changes outside React', () => {
    const group = '[data-testid="panel-uncontrolled"]';
    const edge = `${group} > .sd-panel > .sd-panel-separator-edge [role="separator"]`;
    cy.get(edge).should('have.attr', 'aria-valuemax', '500');
    cy.get(group).invoke('css', 'width', '320px');
    cy.get(`${group} > .sd-panel-fill`).should('have.css', 'width', '160px');
    cy.get(edge).should('have.attr', 'aria-valuemax', '320');
  });
  it('restores the controlled size on Escape and releases the document lock', () => {
    cy.get(grip).trigger('pointerdown', { clientX: 400, clientY: 150, pointerId: 1 });
    cy.get(grip).trigger('pointermove', { clientX: 460, clientY: 150, pointerId: 1 });
    cy.get('[data-testid="panel-size"]').should('have.text', '260');
    cy.get(grip).trigger('keydown', { key: 'Escape' });
    cy.get('[data-testid="panel-size"]').should('have.text', '200');
    cy.get(grip).trigger('pointermove', { clientX: 500, clientY: 150, pointerId: 1 });
    cy.get(grip).trigger('pointerup', { clientX: 500, clientY: 150, pointerId: 1 });
    cy.get(sized).should('have.css', 'width', '200px');
    cy.get('body').should('not.have.css', 'user-select', 'none');
  });
  it('retains content and pins fill dimensions while collapsing and opening', () => {
    cy.get('[data-testid="panel-input"]').type(' value');
    cy.get(grip).trigger('keydown', { key: 'Enter' });
    cy.get('[data-testid="panel-state"]').should('contain.text', '"collapsed":true');
    cy.get('[data-testid="panel-fill-content"]').should(($el) =>
      expect($el[0].style.width).to.match(/px$/),
    );
    cy.get(sized).should('have.css', 'width', '0px');
    cy.get('[data-testid="panel-input"]').should('have.value', 'preserved value');
    cy.get('[data-testid="panel-fill-content"]').should(($el) =>
      expect($el[0].style.width).to.equal('100%'),
    );
    button('collapse');
    cy.get(sized).should('have.css', 'width', '200px');
    cy.get('[data-testid="panel-content"]').should('have.css', 'width', '200px');
  });
  it('waits for the hidden-pose exit animation then rebinds recreated content dimensions', () => {
    button('presence');
    button('collapse');
    cy.get('[data-testid="panel-content"]').should('exist');
    cy.get('[data-testid="panel-content"]').should('not.exist');
    button('collapse');
    cy.get('[data-testid="panel-content"]').should('have.css', 'width', '200px');
    cy.get('[data-testid="panel-input"]').should('have.value', 'preserved');
  });
  it('supports uncontrolled sizes and uses changed defaults only when resetting', () => {
    const uncontrolled = '[data-testid="panel-uncontrolled"] > .sd-panel';
    const edge = `${uncontrolled} > .sd-panel-separator-edge [role="separator"]`;
    cy.get(uncontrolled).should('have.css', 'width', '160px');
    cy.get(edge).trigger('keydown', { key: 'ArrowRight' });
    cy.get(uncontrolled).should('have.css', 'width', '170px');
    button('default');
    cy.get(uncontrolled).should('have.css', 'width', '170px');
    cy.get(edge).trigger('dblclick');
    cy.get(uncontrolled).should('have.css', 'width', '220px');
    cy.get(grip).trigger('dblclick');
    cy.get('[data-testid="panel-size"]').should('have.text', '220');
  });
  it('refits percentage dimensions when the group resizes', () => {
    button('percent');
    cy.get(sized).should('have.css', 'width', '180px');
    button('width');
    cy.get(sized).should('have.css', 'width', '240px');
    cy.get('[data-testid="panel-content"]').should('have.css', 'width', '240px');
    cy.get('[data-testid="panel-size"]').should('have.text', '30%');
  });
  it('binds dimensions when initially collapsed content first mounts', () => {
    cy.get('[data-testid="panel-initial-content"]').should('not.exist');
    button('initial-open');
    cy.get('[data-testid="panel-initial-content"]').should('have.css', 'width', '140px');
  });
  it('resizes using logical directions in RTL layouts', () => {
    button('rtl');
    cy.get(grip).trigger('keydown', { key: 'ArrowLeft' });
    cy.get('[data-testid="panel-size"]').should('have.text', '210');
    cy.get(sized).should('have.css', 'width', '210px');
    drag(-20);
    cy.get('[data-testid="panel-size"]').should('have.text', '230');
  });
  it('changes orientation in place and switches the resize axis and cursor', () => {
    cy.get('[data-testid="panel-input"]').type(' retained');
    button('orientation');
    cy.get(grip)
      .should('have.attr', 'aria-orientation', 'horizontal')
      .and('have.css', 'cursor', 'row-resize');
    cy.get(sized).should('have.css', 'height', '200px');
    cy.get('[data-testid="panel-content"]').should('have.css', 'width', '600px');
    cy.get('[data-testid="panel-input"]').should('have.value', 'preserved retained');
    cy.get(grip).trigger('keydown', { key: 'ArrowDown' });
    cy.get('[data-testid="panel-size"]').should('have.text', '210');
    cy.get(sized).should('have.css', 'height', '210px');
    drag(0, 20);
    cy.get('[data-testid="panel-size"]').should('have.text', '230');
  });
  it('reassociates keyed panels and separators after reordering', () => {
    button('reorder');
    cy.get(main).children().last().should('have.class', 'sd-panel');
    cy.get(grip).trigger('keydown', { key: 'ArrowLeft' });
    cy.get('[data-testid="panel-size"]').should('have.text', '210');
    cy.get(sized).should('have.css', 'width', '210px');
    drag(-20);
    cy.get('[data-testid="panel-size"]').should('have.text', '230');
  });
  for (const explicit of [true, false]) {
    it(`disables and reenables ${explicit ? 'explicit' : 'automatic'} grips`, () => {
      if (!explicit) button('explicit');
      cy.get(grip).should('be.visible');
      button('disable-toggle');
      cy.get(grip).should('not.be.visible');
      button('disable-toggle');
      cy.get(grip).should('be.visible').trigger('keydown', { key: 'ArrowRight' });
      cy.get('[data-testid="panel-size"]').should('have.text', '210');
    });
  }
  for (const change of ['disable', 'unmount', 'vertical']) {
    it(`cancels an active gesture on ${change} and releases global styles`, () => {
      cy.get(grip).trigger('pointerdown', { clientX: 400, clientY: 150, pointerId: 1 });
      cy.get(grip).trigger('pointermove', { clientX: 460, clientY: 150, pointerId: 1 });
      cy.get('[data-testid="panel-size"]').should('have.text', '260');
      cy.window().then((win) => win.dispatchEvent(new win.Event(`panel-${change}`)));
      cy.get('body').should('not.have.css', 'user-select', 'none');
      if (change !== 'unmount') cy.get('[data-testid="panel-size"]').should('have.text', '200');
      else cy.get(main).should('not.exist');
    });
  }
});
