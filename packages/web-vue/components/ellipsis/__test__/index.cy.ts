import Ellipsis, { PerformantEllipsis } from '../index';

const overflowing =
  'A design is a plan or specification for the construction of an object or system.';

describe('Ellipsis', () => {
  it('delegates single-line clamping to LineClamp', () => {
    cy.mount(Ellipsis, {
      attrs: { style: 'max-width: 120px;' },
      slots: { default: 'ellipsis content' },
    });
    cy.get('.sd-ellipsis')
      .should('have.class', 'sd-ellipsis--single-line')
      .and('have.attr', 'data-part', 'root');
  });

  it('supports lineClamp', () => {
    cy.mount(Ellipsis, {
      props: { lineClamp: 2 },
      slots: { default: overflowing.repeat(2) },
    });
    cy.get('.sd-ellipsis')
      .should('have.class', 'sd-ellipsis--line-clamp')
      .and('have.attr', 'data-part', 'root');
  });

  it('falls back to native title when tooltip is disabled', () => {
    cy.mount(Ellipsis, {
      props: { tooltip: false },
      attrs: { style: 'max-width: 80px;' },
      slots: { default: overflowing },
    });
    cy.get('.sd-ellipsis').should('have.attr', 'title', overflowing);
  });

  it('shows the tooltip only when the content is clamped', () => {
    cy.mount(Ellipsis, {
      props: { tooltip: { mouseEnterDelay: 0, mouseLeaveDelay: 0 } },
      attrs: { style: 'width: 240px; display: block;' },
      slots: { default: 'short content' },
    });
    cy.get('.sd-ellipsis').trigger('mouseenter');
    cy.get('[role="tooltip"]').should('not.exist');

    cy.get('@vue').then(({ wrapper }) => {
      cy.wrap(wrapper.unmount());
    });
    cy.mount(Ellipsis, {
      props: { tooltip: { mouseEnterDelay: 0, mouseLeaveDelay: 0 } },
      attrs: { style: 'width: 80px; display: block;' },
      slots: { default: overflowing },
    });
    cy.get('.sd-ellipsis').trigger('mouseenter');
    cy.get('[role="tooltip"]').should('be.visible');
  });

  it('expands and collapses via expand-trigger click', () => {
    cy.mount(Ellipsis, {
      props: { expandTrigger: 'click' as const, tooltip: false },
      attrs: { style: 'max-width: 80px; display: block;' },
      slots: { default: overflowing },
    });
    // 等 clamp 状态稳定（title 出现 = isEllipsis 为 true）
    cy.get('.sd-ellipsis').should('have.attr', 'title', overflowing);
    cy.get('.sd-ellipsis').click();
    cy.get('.sd-ellipsis').should('have.class', 'sd-ellipsis--expanded');
    cy.get('.sd-ellipsis').should('not.have.attr', 'title');
    cy.get('.sd-ellipsis').click();
    cy.get('.sd-ellipsis').should('not.have.class', 'sd-ellipsis--expanded');
    cy.get('.sd-ellipsis').should('have.attr', 'title', overflowing);
  });

  it('resets expanded when lineClamp changes', () => {
    cy.mount(Ellipsis, {
      props: { lineClamp: 2, expandTrigger: 'click' as const, tooltip: false },
      attrs: { style: 'max-width: 120px;' },
      slots: { default: overflowing.repeat(3) },
    });
    cy.get('.sd-ellipsis').click();
    cy.get('.sd-ellipsis').should('have.class', 'sd-ellipsis--expanded');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ lineClamp: 3 })));
    cy.get('.sd-ellipsis').should('not.have.class', 'sd-ellipsis--expanded');
  });

  it('keeps slot DOM, attributes and interactions live', () => {
    cy.mount({
      components: { Ellipsis },
      data: () => ({ count: 0 }),
      template: `
        <Ellipsis :line-clamp="1" style="max-width: 120px;">
          <button
            data-testid="inner"
            data-marker="kept"
            aria-label="inner-label"
            style="color: rgb(1, 2, 3);"
            @click="count++"
          >live content {{ count }}</button>
        </Ellipsis>
      `,
    });
    cy.get('[data-testid="inner"]:visible')
      .should('have.attr', 'aria-label', 'inner-label')
      .and('have.attr', 'data-marker', 'kept')
      .invoke('attr', 'style')
      .should('contain', 'rgb(1, 2, 3)');
    cy.get('[data-testid="inner"]:visible').click();
    cy.get('[data-testid="inner"]:visible').should('contain.text', 'live content 1');
  });

  it('keeps performant ellipsis on a css-only first render until interaction', () => {
    cy.mount(PerformantEllipsis, {
      props: { tooltip: false },
      attrs: { style: 'max-width: 80px;' },
      slots: { default: 'performant ellipsis content' },
    });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findComponent({ name: 'Ellipsis' }).exists()).to.equal(false);
    });
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.trigger('mouseenter')));
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findComponent({ name: 'Ellipsis' }).exists()).to.equal(true);
    });
    cy.get('.sd-ellipsis').should('have.attr', 'data-part', 'root');
  });
});
