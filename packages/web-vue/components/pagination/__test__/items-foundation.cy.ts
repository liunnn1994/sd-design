import EllipsisPager from '../page-item-ellipsis.vue';
import StepPager from '../page-item-step.vue';
import Pager from '../page-item.vue';
import PageOptions from '../page-options.vue';

describe('Pagination item foundation adapters', () => {
  it('preserves active state, keyboard event payload and disabled guards for a page item', () => {
    cy.mount(Pager, { props: { current: 3, pageNumber: 3 } });
    cy.get('li')
      .should('have.attr', 'aria-current', 'page')
      .focus()
      .trigger('keydown', { key: 'Enter' })
      .trigger('keydown', { key: ' ' });
    cy.get('@vue').should(({ wrapper }) => {
      const events = wrapper.emitted('click')!;
      expect(events).to.have.length(2);
      expect(
        events.every((event) => event[0] === 3 && (event[1] as Event).type === 'keydown'),
      ).to.equal(true);
    });
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ disabled: true }));
    cy.get('li').should('have.attr', 'tabindex', '-1').click().trigger('keydown', { key: 'Enter' });
    cy.get('@vue').should(({ wrapper }) => expect(wrapper.emitted('click')).to.have.length(2));
  });

  it('keeps the setup direction while the step class and current page update', () => {
    cy.mount(StepPager, { props: { pages: 5, current: 2, type: 'next' } });
    let label: string | undefined;
    cy.get('li')
      .invoke('attr', 'aria-label')
      .then((value) => {
        label = value;
      });
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ type: 'previous', current: 3 }));
    cy.get('li')
      .should('have.class', 'sd-pagination-item-previous')
      .and((element) => expect(element.attr('aria-label')).to.equal(label));
    cy.get('.sd-icon-right').should('exist');
    cy.get('li').trigger('keydown', { key: 'Enter' });
    cy.get('@vue').should(({ wrapper }) =>
      expect(wrapper.emitted('click')?.[0]).to.deep.equal([4]),
    );
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ current: 5, simple: true }));
    cy.get('span.sd-pagination-item')
      .should('have.attr', 'aria-disabled', 'true')
      .trigger('keydown', { key: ' ' });
    cy.get('@vue').should(({ wrapper }) => expect(wrapper.emitted('click')).to.have.length(1));
  });

  it('updates ellipsis target and blocks zero-page activation', () => {
    cy.mount(EllipsisPager, { props: { current: 2, step: 5, pages: 10 } });
    cy.get('li').trigger('keydown', { key: ' ' });
    cy.get('@vue').should(({ wrapper }) =>
      expect(wrapper.emitted('click')?.[0]).to.deep.equal([7]),
    );
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ current: 9 }));
    cy.get('li').click();
    cy.get('@vue').should(({ wrapper }) =>
      expect(wrapper.emitted('click')?.[1]).to.deep.equal([10]),
    );
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ pages: 0 }));
    cy.get('li').should('have.attr', 'aria-disabled', 'true').trigger('keydown', { key: 'Enter' });
    cy.get('@vue').should(({ wrapper }) => expect(wrapper.emitted('click')).to.have.length(2));
  });

  it('requests numeric page size and retains the rejected controlled value until external update', () => {
    cy.mount(PageOptions, { props: { sizeOptions: [5, 10, 20], pageSize: 10 } });
    cy.get('.sd-select-view').should('contain.text', '10').click();
    cy.contains('[role="option"]', /^5 /).click();
    cy.get('@vue').should(({ wrapper }) =>
      expect(wrapper.emitted('change')?.[0]).to.deep.equal([5]),
    );
    cy.get('.sd-select-view').should('contain.text', '10');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ pageSize: 5, sizeOptions: [5, 30] }));
    cy.get('.sd-select-view').should('contain.text', '5').click();
    cy.contains('[role="option"]', /^30 /).should('be.visible');
  });
});
