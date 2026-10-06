import { h, ref } from 'vue';

import type { PanelSize } from '../types';

import PanelGroup, { Panel, PanelSeparator } from '../index';

const point = { clientX: 200, clientY: 100, pointerId: 1, button: 0 };

const pressAndMove = (x = 280) =>
  cy
    .get('.sd-panel-separator-grip')
    .trigger('pointerdown', point)
    .trigger('pointermove', { ...point, clientX: x });

const release = (x = 280) =>
  cy.get('.sd-panel-separator-grip').trigger('pointerup', { ...point, clientX: x });

describe('PanelGroup split capabilities', () => {
  it('supports custom group tags and uncontrolled default sizes', () => {
    cy.mount(PanelGroup, {
      props: { component: 'section' },
      attrs: { style: 'width:800px;height:400px' },
      slots: { default: () => [h(Panel, { defaultSize: '50%' }), h(Panel)] },
    });
    cy.get('section.sd-panel-group').should('exist');
    cy.get('.sd-panel').should('have.css', 'width', '400px');
    pressAndMove(300);
    release(300);
    cy.get('.sd-panel').should('have.css', 'width', '500px');
    cy.get('.sd-panel-separator-grip').trigger('keydown', { key: 'ArrowRight' });
    cy.get('.sd-panel').should('have.css', 'width', '510px');
    cy.get('.sd-panel-separator-grip').dblclick();
    cy.get('.sd-panel').should('have.css', 'width', '400px');
  });

  it('keeps the uncontrolled current size when defaultSize changes, and resets to the new default', () => {
    const defaultSize = ref(200);
    cy.mount({
      setup: () => () =>
        h(PanelGroup, { style: 'width:800px;height:400px' }, () => [
          h(Panel, { defaultSize: defaultSize.value }),
          h(Panel),
        ]),
    });
    pressAndMove();
    release();
    cy.then(() => {
      defaultSize.value = 300;
    });
    cy.get('.sd-panel').should('have.css', 'width', '280px');
    cy.get('.sd-panel-separator-grip').dblclick();
    cy.get('.sd-panel').should('have.css', 'width', '300px');
  });

  it('reports live controlled sizes and pointer lifecycle events on the panel and group', () => {
    const size = ref<PanelSize>(200);
    const events: { owner: string; name: string; event: PointerEvent }[] = [];
    const handlers = (owner: string) => ({
      onMoveStart: (event: PointerEvent) => events.push({ owner, name: 'start', event }),
      onMoving: (event: PointerEvent) => events.push({ owner, name: 'moving', event }),
      onMoveEnd: (event: PointerEvent) => events.push({ owner, name: 'end', event }),
    });
    cy.mount({
      setup: () => () =>
        h(PanelGroup, { style: 'width:800px;height:400px', ...handlers('group') }, () => [
          h(Panel, {
            'size': size.value,
            'onUpdate:size': (value: PanelSize) => {
              size.value = value;
            },
            ...handlers('panel'),
          }),
          h(PanelSeparator),
          h(Panel),
        ]),
    });
    pressAndMove();
    cy.then(() => {
      expect(size.value).to.equal(280);
      expect(events.map(({ owner, name }) => `${owner}:${name}`)).to.deep.equal([
        'panel:start',
        'group:start',
        'panel:moving',
        'group:moving',
      ]);
      expect(events[0].event.type).to.equal('pointerdown');
      expect(events[2].event.clientX).to.equal(280);
    });
    release(320);
    cy.then(() => {
      expect(size.value).to.equal(320);
      expect(events.slice(-2).map(({ name, event }) => [name, event.type])).to.deep.equal([
        ['end', 'pointerup'],
        ['end', 'pointerup'],
      ]);
    });
    cy.get('.sd-panel').should('have.css', 'width', '320px');
  });

  it('emits start on press and end on release even without moving', () => {
    const events: string[] = [];
    cy.mount(PanelGroup, {
      props: {
        onMoveStart: (event: PointerEvent) => events.push(event.type),
        onMoveEnd: (event: PointerEvent) => events.push(event.type),
      },
      attrs: { style: 'width:800px;height:400px' },
      slots: { default: () => [h(Panel, { defaultSize: 200 }), h(Panel)] },
    });
    cy.get('.sd-panel-separator-grip').trigger('pointerdown', point);
    cy.then(() => expect(events).to.deep.equal(['pointerdown']));
    release(200);
    cy.then(() => expect(events).to.deep.equal(['pointerdown', 'pointerup']));
    cy.get('.sd-panel').should('have.css', 'width', '200px');
  });

  it('restores the controlled size on Escape after live updates', () => {
    const size = ref<PanelSize>(200);
    cy.mount({
      setup: () => () =>
        h(PanelGroup, { style: 'width:800px;height:400px' }, () => [
          h(Panel, {
            'size': size.value,
            'onUpdate:size': (value: PanelSize) => {
              size.value = value;
            },
          }),
          h(Panel),
        ]),
    });
    pressAndMove();
    cy.then(() => expect(size.value).to.equal(280));
    cy.window().trigger('keydown', { key: 'Escape' });
    release(350);
    cy.then(() => expect(size.value).to.equal(200));
    cy.get('.sd-panel').should('have.css', 'width', '200px');
    cy.document().its('body.style.userSelect').should('not.equal', 'none');
  });

  for (const explicit of [false, true]) {
    it(`disables ${explicit ? 'explicit' : 'built-in'} separators and restores interactions on enable`, () => {
      const disabled = ref(true);
      cy.mount({
        setup: () => () =>
          h(PanelGroup, { disabled: disabled.value, style: 'width:800px;height:400px' }, () => [
            h(Panel, { defaultSize: 200 }),
            explicit ? h(PanelSeparator) : null,
            h(Panel),
          ]),
      });
      cy.get('.sd-panel-separator-grip')
        .should('not.be.visible')
        .trigger('keydown', { key: 'ArrowRight', force: true })
        .trigger('dblclick', { force: true });
      cy.get('.sd-panel').should('have.css', 'width', '200px');
      cy.then(() => {
        disabled.value = false;
      });
      cy.get('.sd-panel-separator-grip').should('be.visible');
      pressAndMove();
      release();
      cy.get('.sd-panel').should('have.css', 'width', '280px');
    });
  }

  it('stops an active drag when disabled and releases the body lock', () => {
    const disabled = ref(false);
    cy.mount({
      setup: () => () =>
        h(PanelGroup, { disabled: disabled.value, style: 'width:800px;height:400px' }, () => [
          h(Panel, { defaultSize: 200 }),
          h(PanelSeparator),
          h(Panel),
        ]),
    });
    pressAndMove();
    cy.document().its('body.style.userSelect').should('equal', 'none');
    cy.then(() => {
      disabled.value = true;
    });
    cy.get('.sd-panel-separator-grip').should('not.be.visible');
    cy.document().its('body.style.userSelect').should('not.equal', 'none');
    cy.get('.sd-panel').should('have.css', 'width', '200px');
  });

  it('does not start a drag when a move-start listener disables the group', () => {
    const disabled = ref(false);
    cy.mount({
      setup: () => () =>
        h(
          PanelGroup,
          {
            disabled: disabled.value,
            onMoveStart: () => {
              disabled.value = true;
            },
            style: 'width:800px;height:400px',
          },
          () => [h(Panel, { defaultSize: 200 }), h(Panel)],
        ),
    });
    cy.get('.sd-panel-separator-grip').trigger('pointerdown', point);
    cy.get('.sd-panel-separator-grip').should('not.be.visible');
    cy.document().its('body.style.userSelect').should('not.equal', 'none');
    cy.get('.sd-panel').should('have.css', 'width', '200px');
  });

  it('switches orientation without remounting content and uses the new measurement and keyboard axes', () => {
    const orientation = ref<'horizontal' | 'vertical'>('horizontal');
    let content: HTMLElement;
    cy.mount({
      setup: () => () =>
        h(PanelGroup, { orientation: orientation.value, style: 'width:800px;height:400px' }, () => [
          h(Panel, { defaultSize: '50%' }, () => h('input', { id: 'persistent' })),
          h(PanelSeparator),
          h(Panel),
        ]),
    });
    cy.get('.sd-panel').should('have.css', 'width', '400px');
    cy.get('#persistent').then(($input) => {
      content = $input[0];
    });
    cy.then(() => {
      orientation.value = 'vertical';
    });
    cy.get('.sd-panel-group').should('have.css', 'flex-direction', 'column');
    cy.get('.sd-panel').should('have.css', 'height', '200px').and('have.css', 'width', '800px');
    cy.get('.sd-panel-content')
      .should('have.css', 'height', '200px')
      .and('have.css', 'width', '800px');
    cy.get('#persistent').then(($input) => expect($input[0]).to.equal(content));
    cy.get('.sd-panel-separator-grip')
      .should('have.attr', 'aria-orientation', 'horizontal')
      .and('have.class', 'sd-resizebox-trigger-horizontal')
      .and('not.have.class', 'sd-resizebox-trigger-vertical')
      .and('have.css', 'cursor', 'row-resize')
      .trigger('keydown', { key: 'ArrowDown' });
    cy.get('.sd-resizebox-trigger-icon-wrapper').should('have.css', 'height', '6px');
    cy.get('.sd-panel').should('have.css', 'height', '210px');
    cy.then(() => {
      orientation.value = 'horizontal';
    });
    cy.get('.sd-panel').should('have.css', 'width', '420px').and('have.css', 'height', '400px');
    cy.get('.sd-panel-separator-grip')
      .should('have.class', 'sd-resizebox-trigger-vertical')
      .and('not.have.class', 'sd-resizebox-trigger-horizontal');
    cy.get('.sd-resizebox-trigger-icon-wrapper').should('have.css', 'width', '6px');
    pressAndMove(220);
    release(220);
    cy.get('.sd-panel').should('have.css', 'width', '440px');
  });

  for (const moveAfterDisable of [false, true]) {
    it(`cancels a disabled linked group before ${moveAfterDisable ? 'moving and releasing' : 'releasing'}`, () => {
      const disabled = ref(false);
      let crossing: typeof point;
      cy.mount({
        setup: () => () =>
          h(PanelGroup, { style: 'width:800px;height:400px' }, () => [
            h(Panel, { id: 'outer-panel', defaultSize: 300 }, () =>
              h(PanelGroup, { orientation: 'vertical', disabled: disabled.value }, () => [
                h(Panel, { id: 'inner-panel', defaultSize: 150 }),
                h(PanelSeparator, { id: 'inner-grip' }),
                h(Panel),
              ]),
            ),
            h(PanelSeparator, { id: 'outer-grip' }),
            h(Panel),
          ]),
      });
      cy.get('#inner-panel').should('have.css', 'height', '150px');
      cy.get('#outer-grip').then(($outer) => {
        cy.get('#inner-grip').then(($inner) => {
          const outer = $outer[0].getBoundingClientRect();
          const inner = $inner[0].getBoundingClientRect();
          crossing = { ...point, clientX: outer.x, clientY: inner.y };
          cy.wrap($outer)
            .trigger('pointerdown', crossing)
            .trigger('pointermove', {
              ...crossing,
              clientX: crossing.clientX + 40,
              clientY: crossing.clientY + 30,
            });
        });
      });
      cy.get('#outer-panel').should('have.css', 'width', '340px');
      cy.get('#inner-panel').should('have.css', 'height', '180px');
      cy.then(() => {
        disabled.value = true;
      });
      cy.get('#inner-grip').should('not.be.visible');
      cy.get('#inner-panel').should('have.css', 'height', '150px');
      cy.get('#outer-grip').then(($grip) => {
        const next = {
          ...crossing,
          clientX: crossing.clientX + 80,
          clientY: crossing.clientY + 60,
        };
        if (moveAfterDisable) cy.wrap($grip).trigger('pointermove', next);
        cy.wrap($grip).trigger('pointerup', next);
      });
      cy.get('#outer-panel').should('have.css', 'width', '380px');
      cy.get('#inner-panel').should('have.css', 'height', '150px');
      cy.document().its('body.style.userSelect').should('not.equal', 'none');
    });
  }

  it('cancels an active drag before changing orientation', () => {
    const orientation = ref<'horizontal' | 'vertical'>('horizontal');
    cy.mount({
      setup: () => () =>
        h(PanelGroup, { orientation: orientation.value, style: 'width:800px;height:400px' }, () => [
          h(Panel, { defaultSize: 200 }),
          h(Panel),
        ]),
    });
    pressAndMove();
    cy.then(() => {
      orientation.value = 'vertical';
    });
    cy.document().its('body.style.userSelect').should('not.equal', 'none');
    cy.get('.sd-panel').should('have.css', 'height', '200px');
    cy.get('.sd-panel-separator-grip')
      .trigger('pointermove', { ...point, clientY: 190 })
      .trigger('pointerup', { ...point, clientY: 190 });
    cy.get('.sd-panel').should('have.css', 'height', '200px');
  });
});
