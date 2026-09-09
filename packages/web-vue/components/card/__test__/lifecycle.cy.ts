import { defineComponent, ref } from 'vue';

import Card, { CardMeta, CardGrid } from '../index';

describe('Card child lifecycle', () => {
  it('updates Meta when title and description slots change', () => {
    cy.mount(
      defineComponent({
        components: { Card, CardMeta },
        setup: () => ({ visible: ref(false) }),
        template:
          '<button @click="visible = !visible">Toggle</button><Card><CardMeta><template v-if="visible" #title>Title</template><template v-if="visible" #description>Description</template></CardMeta></Card>',
      }),
    );
    cy.get('.sd-card-meta-content').should('not.exist');
    cy.contains('button', 'Toggle').click();
    cy.get('.sd-card-meta-title').should('have.text', 'Title');
    cy.get('.sd-card-meta-description').should('have.text', 'Description');
    cy.contains('button', 'Toggle').click();
    cy.get('.sd-card-meta-content').should('not.exist');
  });

  it('updates the header when named slots are added and removed', () => {
    cy.mount(
      defineComponent({
        components: { Card },
        setup: () => ({ visible: ref(false) }),
        template:
          '<button @click="visible = !visible">Toggle</button><Card><template v-if="visible" #title>Title</template><template v-if="visible" #extra>Extra</template>Body</Card>',
      }),
    );
    cy.get('.sd-card-header').should('not.exist');
    cy.contains('button', 'Toggle').click();
    cy.get('.sd-card-header-title').should('have.text', 'Title');
    cy.get('.sd-card-header-extra').should('have.text', 'Extra');
    cy.contains('button', 'Toggle').click();
    cy.get('.sd-card-header').should('not.exist');
  });

  it('restores card actions when Meta is removed', () => {
    cy.mount(
      defineComponent({
        components: { Card, CardMeta },
        setup: () => ({ visible: ref(true) }),
        template:
          '<button @click="visible = !visible">Toggle</button><Card><CardMeta v-if="visible" title="Meta"/><template #actions><button>Action</button></template></Card>',
      }),
    );
    cy.get('.sd-card-meta-footer .sd-card-actions').should('exist');
    cy.contains('button', 'Toggle').click();
    cy.get('.sd-card-meta').should('not.exist');
    cy.get('.sd-card-body > .sd-card-actions').should('contain.text', 'Action');
    cy.contains('button', 'Toggle').click();
    cy.get('.sd-card-meta-footer .sd-card-actions').should('contain.text', 'Action');
    cy.get('.sd-card-body > .sd-card-actions').should('not.exist');
  });

  it('keeps actions in Meta until the last Meta is removed', () => {
    cy.mount(
      defineComponent({
        components: { Card, CardMeta },
        setup: () => ({ count: ref(2) }),
        template:
          '<button @click="count--">Remove</button><Card><CardMeta v-for="i in count" :key="i" title="Meta"/><template #actions><button>Action</button></template></Card>',
      }),
    );
    cy.get('.sd-card-meta').should('have.length', 2);
    cy.contains('button', 'Remove').click();
    cy.get('.sd-card-meta').should('have.length', 1);
    cy.get('.sd-card-meta-footer .sd-card-actions').should('contain.text', 'Action');
    cy.get('.sd-card-body > .sd-card-actions').should('not.exist');
    cy.contains('button', 'Remove').click();
    cy.get('.sd-card-meta').should('not.exist');
    cy.get('.sd-card-body > .sd-card-actions').should('contain.text', 'Action');
  });

  it('clears grid layout only after the last Grid is removed', () => {
    cy.mount(
      defineComponent({
        components: { Card, CardGrid },
        setup: () => ({ count: ref(2) }),
        template:
          '<button @click="count--">Remove</button><Card><CardGrid v-for="i in count" :key="i">Grid</CardGrid></Card>',
      }),
    );
    cy.get('.sd-card-grid').should('have.length', 2);
    cy.contains('button', 'Remove').click();
    cy.get('.sd-card-grid').should('have.length', 1);
    cy.get('.sd-card').should('have.class', 'sd-card-contain-grid');
    cy.contains('button', 'Remove').click();
    cy.get('.sd-card-grid').should('not.exist');
    cy.get('.sd-card').should('not.have.class', 'sd-card-contain-grid');
  });
});
