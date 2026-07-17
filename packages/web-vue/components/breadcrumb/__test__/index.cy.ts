import Breadcrumb from '../index';

const BreadcrumbItem = Breadcrumb.Item;

describe('Breadcrumb', () => {
  it('exposes a labeled list (role=list + aria-label) and listitem roles', () => {
    cy.mount(Breadcrumb, {
      global: { components: { BreadcrumbItem } },
      slots: {
        default:
          '<breadcrumb-item>Home</breadcrumb-item>' +
          '<breadcrumb-item>List</breadcrumb-item>' +
          '<breadcrumb-item>Detail</breadcrumb-item>',
      },
    });
    cy.get('.sd-breadcrumb').should('have.attr', 'role', 'list');
    cy.get('.sd-breadcrumb').should('have.attr', 'aria-label', 'Breadcrumb');
    cy.get('.sd-breadcrumb-item').should('have.attr', 'role', 'listitem');
    // 分隔符对 SR 隐藏
    cy.get('.sd-breadcrumb-item-separator').should('have.attr', 'aria-hidden', 'true');
  });
});
