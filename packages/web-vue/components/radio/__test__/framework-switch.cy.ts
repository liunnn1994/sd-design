import FrameworkSwitch from '../../../../sd-vue-docs/src/components/starlight/FrameworkSwitch.vue';

const links = { vueHref: '/components/button/', reactHref: '/react/components/button/' };

describe('Docs framework switch', () => {
  it('renders an accessible button-style radio group with Vue selected', () => {
    cy.mount(FrameworkSwitch, { props: { ...links, isReact: false } });

    cy.get('[role="radiogroup"]')
      .should('have.attr', 'aria-label', '文档框架')
      .and('have.class', 'sd-radio-group-button');
    cy.get('.sd-radio-button').should('have.length', 2);
    cy.get('input[type="radio"][value="vue"]').should('be.checked');
    cy.get('input[type="radio"][value="react"]').should('not.be.checked');
    cy.contains('.sd-radio-button', 'Vue').should('be.visible');
    cy.contains('.sd-radio-button', 'React').should('be.visible');
    cy.get('.framework-switch a').should('not.exist');
  });

  it('reflects React routes and subsequent route changes', () => {
    cy.mount(FrameworkSwitch, { props: { ...links, isReact: true } });
    cy.get('input[value="react"]').should('be.checked');
    cy.get('input[value="vue"]').should('not.be.checked');

    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ isReact: false }));
    cy.get('input[value="vue"]').should('be.checked');
    cy.get('input[value="react"]').should('not.be.checked');
  });

  it('does not navigate when the current framework is clicked again', () => {
    cy.mount(FrameworkSwitch, { props: { ...links, isReact: false } });
    cy.contains('.sd-radio-button', 'Vue').click();
    cy.get('input[value="vue"]').should('be.checked');
    cy.get('input[value="react"]').should('not.be.checked');
  });

  it('gives both framework buttons equal width', () => {
    cy.mount(FrameworkSwitch, { props: { ...links, isReact: false } });
    cy.get('.sd-radio-button').should(($buttons) => {
      expect($buttons[0]!.getBoundingClientRect().width).to.be.closeTo(
        $buttons[1]!.getBoundingClientRect().width,
        1,
      );
    });
  });
});
