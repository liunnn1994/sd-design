import { h, nextTick, reactive, ref } from 'vue';

import Select from '../index';

describe('Select robustness', () => {
  it('treats an initial controlled null as empty', () => {
    cy.mount(Select, { props: { modelValue: null, defaultValue: 'Old', options: ['Old'] } });
    cy.get('.sd-select-view-value').should('not.contain.text', 'Old');
  });

  it('refreshes a fallback object with the same value key', () => {
    cy.mount(Select, {
      props: {
        modelValue: { id: 1, label: 'Old' },
        valueKey: 'id',
        fallbackOption: (value) => ({ value, label: String((value as { label: string }).label) }),
      },
    });
    cy.get('.sd-select-view-value').should('contain.text', 'Old');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ modelValue: { id: 1, label: 'New' } }));
    cy.get('.sd-select-view-value').should('contain.text', 'New').and('not.contain.text', 'Old');
  });

  it('opens with defaultShow when defaultPopupVisible is omitted', () => {
    cy.mount(Select, { props: { defaultShow: true, options: ['One'] } });
    cy.get('input').should('have.attr', 'aria-expanded', 'true');
  });

  for (const slot of ['header', 'footer']) {
    it(`updates the dropdown class when the ${slot} slot appears`, () => {
      const show = ref(false);
      cy.mount({
        setup: () => () =>
          h(
            Select,
            { defaultPopupVisible: true, options: ['One'] },
            show.value ? { [slot]: () => h('span', 'Extra') } : {},
          ),
      });
      cy.get('.sd-select-dropdown').should('not.have.class', `sd-select-dropdown-has-${slot}`);
      cy.then(() => {
        show.value = true;
      });
      cy.get(`.sd-select-dropdown-${slot}`).should('have.text', 'Extra');
      cy.get('.sd-select-dropdown').should('have.class', `sd-select-dropdown-has-${slot}`);
    });
  }

  for (const method of ['mouse', 'keyboard']) {
    it(`blocks ${method} selection after switching an open popup to readonly`, () => {
      const change = cy.spy().as('change');
      cy.mount(Select, {
        props: { defaultPopupVisible: true, options: ['One', 'Two'], onChange: change },
      });
      cy.get('.sd-select-dropdown').should('be.visible');
      cy.contains('.sd-select-option', 'One').trigger('mouseenter');
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ readonly: true }));
      if (method === 'mouse') cy.contains('.sd-select-option', 'Two').click({ force: true });
      else cy.get('input').trigger('keydown', { key: 'Enter' });
      cy.get('@change').should('not.have.been.called');
    });
  }

  it('stops tracking fallback object keys when unmounted', () => {
    const state = reactive({ id: 'One' });
    const read = cy.spy(() => state.id).as('read');
    const value = {
      get id() {
        return read();
      },
    };
    cy.mount(Select, { props: { defaultValue: value, valueKey: 'id' } });
    cy.get('.sd-select-view-value').should('contain.text', 'One');
    cy.get('@vue').then(({ wrapper }) => {
      wrapper.unmount();
      read.resetHistory();
      state.id = 'Two';
      return nextTick();
    });
    cy.get('@read').should('not.have.been.called');
  });

  for (const action of ['clear', 'remove']) {
    it(`blocks ${action} for a readonly selection`, () => {
      const change = cy.spy().as('change');
      cy.mount(Select, {
        props: {
          readonly: true,
          multiple: true,
          defaultValue: ['One'],
          options: ['One'],
          onChange: change,
        },
      });
      if (action === 'clear') cy.get('.sd-select-view-clear-btn').click({ force: true });
      else cy.get('.sd-select-view-tag .sd-tag-close-btn').click({ force: true });
      cy.get('@change').should('not.have.been.called');
      cy.get('.sd-select-view-tag').should('contain.text', 'One');
    });
  }
});
