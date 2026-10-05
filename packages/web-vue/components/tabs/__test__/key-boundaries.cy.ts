import { h } from 'vue';

import Tabs, { TabPane } from '../index';

describe('Tabs key boundaries', () => {
  it('supports a prototype-named key', () => {
    cy.mount(Tabs, {
      slots: { default: () => h(TabPane, { key: '__proto__', title: 'Tab' }, () => 'Panel') },
    });
    cy.get('.sd-tabs-nav-ink').should('exist');
    cy.get('.sd-tabs-tab').should('have.attr', 'aria-selected', 'true');
  });

  it('focuses the numeric key without confusing it with the string key', () => {
    cy.mount(Tabs, {
      props: { defaultActiveKey: '1' },
      slots: {
        default: () => [
          h(TabPane, { key: 1, title: 'Numeric' }, () => 'Numeric panel'),
          h(TabPane, { key: '1', title: 'String' }, () => 'String panel'),
        ],
      },
    });
    cy.get('.sd-tabs-tab').eq(1).focus().trigger('keydown', { key: 'Home' });
    cy.get('.sd-tabs-tab').eq(0).should('have.attr', 'aria-selected', 'true');
    cy.get('.sd-tabs-tab').eq(0).should('be.focused');
  });

  it('keeps focus references when the parent leaves a closed tab mounted', () => {
    cy.mount(Tabs, {
      props: { editable: true, activeKey: 'a' },
      slots: {
        default: () => [
          h(TabPane, { key: 'a', title: 'A' }, () => 'Panel A'),
          h(TabPane, { key: 'b', title: 'B' }, () => 'Panel B'),
        ],
      },
    });
    cy.get('.sd-tabs-tab').eq(1).find('.sd-tabs-tab-close-btn').click();
    cy.get('.sd-tabs-tab').eq(0).focus();
    cy.get('.sd-tabs-nav-tab-list').trigger('keydown', { key: 'ArrowRight' });
    cy.get('.sd-tabs-tab').eq(1).should('be.focused');
  });

  it('does not emit an undefined active key when adding to an empty list', () => {
    const onChange = cy.spy().as('change');
    const onUpdate = cy.spy().as('update');
    cy.mount(Tabs, {
      props: {
        'editable': true,
        'showAddButton': true,
        'autoSwitch': true,
        onChange,
        'onUpdate:activeKey': onUpdate,
      },
    });
    cy.get('.sd-tabs-nav-add-btn').click();
    cy.get('@vue').then(() => Promise.resolve());
    cy.get('@change').should('not.have.been.called');
    cy.get('@update').should('not.have.been.called');
  });

  it('accepts a numeric scroll position without a prop validation warning', () => {
    cy.window().then((win) => cy.spy(win.console, 'warn').as('warn'));
    cy.mount(Tabs, {
      props: { scrollPosition: 12 },
      slots: { default: () => h(TabPane, { key: 'a', title: 'A' }, () => 'Panel') },
    });
    cy.get('.sd-tabs-tab').should('exist');
    cy.get('@warn').should('not.have.been.calledWithMatch', /Invalid prop:.*scrollPosition/);
  });

  it('keeps ARIA identifiers distinct for numeric and string keys', () => {
    cy.mount(Tabs, {
      slots: {
        default: () => [
          h(TabPane, { key: 1, title: 'Numeric' }, () => 'Numeric panel'),
          h(TabPane, { key: '1', title: 'String' }, () => 'String panel'),
        ],
      },
    });
    cy.get('[role=tab], [role=tabpanel]').should(($elements) => {
      const ids = Array.from($elements, (element) => element.id);
      expect(new Set(ids).size).to.equal(ids.length);
    });
    cy.get('[role=tab]').each(($tab) => {
      cy.document().then((doc) => {
        const panel = doc.getElementById($tab.attr('aria-controls')!);
        expect(panel?.getAttribute('aria-labelledby')).to.equal($tab.attr('id'));
      });
    });
  });
});
