import InputTag from '../index';

describe('InputTag', () => {
  it('should emit change on enter', () => {
    cy.mount(InputTag);
    cy.get('input').type('test{enter}');
    cy.get('@vue').should(({ wrapper }) => {
      const emits = wrapper.emitted('change');
      expect(emits).to.have.length(1);
      expect(emits![0][0]).to.deep.equal(['test']);
    });
  });

  it('should remove a tag and clear all', () => {
    cy.mount(InputTag, {
      props: { defaultValue: ['test', 'test-2', 'test-3'], allowClear: true },
    });
    cy.get('.sd-tag').should('have.length', 3);
    cy.get('.sd-tag-close-btn').eq(1).click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('remove')).to.have.length(1);
    });
    cy.get('.sd-input-tag-clear-btn').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('clear')).to.have.length(1);
    });
  });

  it('responsive mode collapses overflow tags into the counter', () => {
    cy.mount({
      components: { InputTag },
      template: `
        <div style="width: 150px;">
          <InputTag :default-value="['one', 'two', 'three']" max-tag-count="responsive" />
        </div>
      `,
    });
    cy.wait(300);
    cy.get('.sd-input-tag-tag-counter:visible').should('have.text', '+2');
    cy.document().then((doc) => {
      const normalTags = [...doc.querySelectorAll('.sd-input-tag-inner .sd-input-tag-tag')].filter(
        (el) =>
          (el as HTMLElement).offsetParent !== null &&
          !el.classList.contains('sd-input-tag-tag-counter'),
      );
      expect(normalTags, 'only the fitting tag remains visible').to.have.length(1);
      normalTags.forEach((el) => {
        const text = el.textContent ?? '';
        expect(el.scrollWidth <= el.clientWidth + 1, `tag "${text}" not middle-truncated`).to.equal(
          true,
        );
      });
    });
  });

  it('responsive mode keeps per-item holders for enter/leave transitions', () => {
    cy.mount({
      components: { InputTag },
      template: `
        <div style="width: 400px;">
          <InputTag :default-value="['one', 'two']" max-tag-count="responsive" />
        </div>
      `,
    });
    cy.wait(300);
    cy.get('.sd-input-tag-item-holder').should('have.length', 2);
    cy.get('.sd-tag-close-btn').first().click({ force: true });
    cy.wait(300);
    cy.get('.sd-input-tag-item-holder').should('have.length', 1);
  });

  it('updates the responsive counter after values change', () => {
    cy.mount({
      components: { InputTag },
      template: `
        <div style="width: 150px;">
          <InputTag v-model="value" max-tag-count="responsive" />
          <button class="append-value" @click="value.push('four')">append</button>
        </div>
      `,
      data: () => ({ value: ['one', 'two', 'three'] }),
    });

    cy.get('.sd-input-tag-tag-counter:visible').should('have.text', '+2');
    cy.get('.append-value').click();
    cy.get('.sd-input-tag-tag-counter:visible').should('have.text', '+3');
  });
});
