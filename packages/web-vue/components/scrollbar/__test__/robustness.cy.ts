import Scrollbar from '../index';

describe('Scrollbar robustness', () => {
  it('forwards the initialized event once', () => {
    const initialized = cy.spy().as('initialized');
    cy.mount(Scrollbar, { props: { events: { initialized } } });
    cy.get('@initialized').should('have.been.calledOnce');
  });

  it('updates automatic height when maxHeight changes without resizing content', () => {
    cy.mount(Scrollbar, {
      props: { outerStyle: { maxHeight: '100px' } },
      slots: { default: '<div style="height: 300px">content</div>' },
    });
    cy.get('.sd-scrollbar').should('have.css', 'height', '100px');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ outerStyle: { maxHeight: '200px' } }));
    cy.get('.sd-scrollbar').should('have.css', 'height', '200px');
  });

  it('forwards initialized listener arrays', () => {
    const first = cy.spy().as('first');
    const second = cy.spy().as('second');
    cy.mount(Scrollbar, { props: { events: { initialized: [first, second] } } });
    cy.get('@first').should('have.been.calledOnce');
    cy.get('@second').should('have.been.calledOnce');
  });

  it('updates automatic width when maxWidth changes', () => {
    cy.mount(Scrollbar, {
      props: { outerStyle: { maxWidth: '100px', height: '80px' } },
      slots: { default: '<div style="width: 300px; height: 40px">content</div>' },
    });
    cy.get('.sd-scrollbar').should('have.css', 'width', '100px');
    cy.get('@vue').then(({ wrapper }) =>
      wrapper.setProps({ outerStyle: { maxWidth: '200px', height: '80px' } }),
    );
    cy.get('.sd-scrollbar').should('have.css', 'width', '200px');
  });

  it('removes automatic height when an explicit height is supplied', () => {
    cy.mount(Scrollbar, {
      props: { outerStyle: { maxHeight: '100px' } },
      slots: { default: '<div style="height: 300px">content</div>' },
    });
    cy.get('.sd-scrollbar').should('have.css', 'height', '100px');
    cy.get('@vue').then(({ wrapper }) =>
      wrapper.setProps({ outerStyle: { maxHeight: '200px', height: '80px' } }),
    );
    cy.get('.sd-scrollbar').should('have.css', 'height', '80px');
  });
});
