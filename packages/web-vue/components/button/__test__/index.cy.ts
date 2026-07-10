import { configProviderInjectionKey } from '../../config-provider/context';
import Button from '../index';

describe('Button', () => {
  it('should emit click event', () => {
    cy.mount(Button);
    cy.get('button').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('click')).to.have.length(1);
    });
  });

  it('should not emit click event when disabled', () => {
    cy.mount(Button, { props: { disabled: true } });
    cy.get('button').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('click')).to.equal(undefined);
    });
  });

  it('should add loading fixed width class when loadingFixedWidth is true', () => {
    cy.mount(Button, { props: { loading: true, loadingFixedWidth: true } });
    cy.get('button').should('have.class', 'sd-btn-loading-fixed-width');
  });

  it('should add two chinese chars class when autoInsertSpaceInButton is enabled', () => {
    cy.mount(Button, {
      global: {
        provide: {
          [configProviderInjectionKey as symbol]: {
            autoInsertSpaceInButton: true,
          },
        },
      },
      slots: {
        default: '测试',
      },
    });
    cy.get('button').should('have.class', 'sd-btn-two-chinese-chars');
  });
});
