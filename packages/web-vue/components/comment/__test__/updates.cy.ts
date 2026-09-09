import { h } from 'vue';

import Comment from '../index';

describe('Comment updates and interaction', () => {
  it('updates and removes prop content without stale wrappers', () => {
    cy.mount(Comment, { props: { author: 'Before', content: 'Old', datetime: 'Yesterday' } });
    cy.get('@vue').then(({ wrapper }) =>
      wrapper.setProps({ author: 'After', content: 'New', datetime: 'Today' }),
    );
    cy.get('.sd-comment-author').should('contain.text', 'After');
    cy.get('.sd-comment-content').should('contain.text', 'New');
    cy.get('.sd-comment-datetime').should('contain.text', 'Today');
    cy.get('@vue').then(({ wrapper }) =>
      wrapper.setProps({ author: '', content: '', datetime: '' }),
    );
    cy.get('.sd-comment-title').should('not.exist');
    cy.get('.sd-comment-content').should('not.exist');
  });

  it('updates alignment and keeps action buttons interactive', () => {
    const action = cy.spy().as('reply');
    cy.mount(Comment, {
      props: { author: 'Author', datetime: 'Today' },
      slots: { actions: () => h('button', { onClick: action }, 'Reply') },
    });
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ align: 'right' }));
    cy.get('.sd-comment-title').should('have.css', 'justify-content', 'space-between');
    cy.get('.sd-comment-actions').should('have.css', 'justify-content', 'flex-end');
    cy.contains('button', 'Reply').click();
    cy.get('@reply').should('have.been.calledOnce');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ align: { datetime: 'left' } }));
    cy.get('.sd-comment-title').should('have.class', 'sd-comment-title-align-left');
    cy.get('.sd-comment-actions').should('have.class', 'sd-comment-actions-align-left');
  });

  it('falls back to its author slot when the prop is cleared', () => {
    cy.mount(Comment, { props: { author: 'Prop' }, slots: { author: () => h('span', 'Slot') } });
    cy.get('.sd-comment-author').should('contain.text', 'Prop');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ author: '' }));
    cy.get('.sd-comment-author').should('have.text', 'Slot');
  });
});
