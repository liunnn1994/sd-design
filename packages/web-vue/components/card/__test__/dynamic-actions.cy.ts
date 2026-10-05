import { defineComponent, ref } from 'vue';

import Card, { CardMeta } from '../index';

describe('Card dynamic actions', () => {
  it('updates Meta actions when the parent actions slot is added and removed', () => {
    cy.mount(
      defineComponent({
        components: { Card, CardMeta },
        setup: () => ({ visible: ref(false) }),
        template:
          '<button @click="visible = !visible">Toggle</button><Card><CardMeta title="Meta"/><template v-if="visible" #actions><button>Action</button></template></Card>',
      }),
    );
    cy.get('.sd-card-meta-footer').should('not.exist');
    cy.contains('button', 'Toggle').click();
    cy.get('.sd-card-meta-footer .sd-card-actions').should('contain.text', 'Action');
    cy.contains('button', 'Toggle').click();
    cy.get('.sd-card-meta-footer').should('not.exist');
  });
});
