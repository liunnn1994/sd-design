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

  it('emits update:modelValue when a tag is added', () => {
    cy.mount(InputTag, { props: { modelValue: ['a'] } });
    cy.get('input').type('b{enter}');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:modelValue')![0][0]).to.deep.equal(['a', 'b']);
    });
  });

  it('v-model syncs the tag list', () => {
    cy.mount({
      components: { InputTag },
      template: `<InputTag v-model="value" />`,
      data: () => ({ value: ['a'] }),
    });
    cy.get('input').type('b{enter}');
    cy.get('.sd-input-tag-tag').should('have.length', 2);
  });

  it('emits inputValueChange and pressEnter while typing', () => {
    cy.mount(InputTag);
    cy.get('input').type('hi{enter}');
    cy.get('@vue').should(({ wrapper }) => {
      const inputValueChange = wrapper.emitted('inputValueChange');
      expect(inputValueChange![0][0]).to.equal('h');
      expect(inputValueChange![1][0]).to.equal('hi');
      // enter adds the tag and then clears the input
      expect(inputValueChange![2][0]).to.equal('');
      expect(wrapper.emitted('update:inputValue')).to.have.length(inputValueChange!.length);
      expect(wrapper.emitted('pressEnter')![0][0]).to.equal('hi');
    });
  });

  it('enter with an empty input adds nothing', () => {
    cy.mount(InputTag);
    cy.get('input').type('{enter}');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.equal(undefined);
      expect(wrapper.emitted('pressEnter')).to.equal(undefined);
    });
  });

  it('backspace removes the last closable tag when the input is empty', () => {
    cy.mount(InputTag, { props: { defaultValue: ['a', 'b'] } });
    cy.get('input').type('{backspace}');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('remove')![0][0]).to.equal('b');
      expect(wrapper.emitted('change')![0][0]).to.deep.equal(['a']);
    });
    cy.get('.sd-input-tag-tag').should('have.length', 1);
  });

  it('backspace does not remove a tag while the input has text', () => {
    cy.mount(InputTag, { props: { defaultValue: ['a', 'b'] } });
    cy.get('input').type('x{backspace}');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('remove')).to.equal(undefined);
      expect(wrapper.emitted('change')).to.equal(undefined);
    });
    cy.get('.sd-input-tag-tag').should('have.length', 2);
  });

  it('uniqueValue blocks duplicate tags but still emits pressEnter', () => {
    cy.mount(InputTag, { props: { defaultValue: ['test'], uniqueValue: true } });
    cy.get('input').type('test{enter}');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('pressEnter')).to.have.length(1);
      expect(wrapper.emitted('change')).to.equal(undefined);
    });
    cy.get('.sd-input-tag-tag').should('have.length', 1);
  });

  it('retainInputValue.create keeps input text after creating a tag', () => {
    cy.mount(InputTag, { props: { retainInputValue: { create: true } } });
    cy.get('input').type('test{enter}');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.have.length(1);
    });
    cy.get('input').should('have.value', 'test');
  });

  it('retainInputValue.blur keeps input text on blur', () => {
    cy.mount(InputTag, { props: { retainInputValue: { blur: true } } });
    cy.get('input').type('abc');
    cy.get('input').blur();
    cy.get('input').should('have.value', 'abc');
  });

  it('blur clears pending input text by default', () => {
    cy.mount(InputTag);
    cy.get('input').type('abc');
    cy.get('input').blur();
    cy.get('input').should('have.value', '');
  });

  it('disabled blocks editing and hides closers and clear button', () => {
    cy.mount(InputTag, {
      props: { defaultValue: ['a'], allowClear: true, disabled: true },
    });
    cy.get('.sd-input-tag').should('have.class', 'sd-input-tag-disabled');
    cy.get('input').should('have.attr', 'disabled');
    cy.get('.sd-tag-close-btn').should('not.exist');
    cy.get('.sd-input-tag-clear-btn').should('not.exist');
  });

  it('readonly hides close buttons and makes the input readonly', () => {
    cy.mount(InputTag, { props: { defaultValue: ['a'], readonly: true } });
    cy.get('.sd-input-tag').should('have.class', 'sd-input-tag-readonly');
    cy.get('input').should('have.attr', 'readonly');
    cy.get('.sd-tag-close-btn').should('not.exist');
  });

  it('maxTagCount truncates tags and shows a counter', () => {
    cy.mount(InputTag, {
      props: { defaultValue: ['a', 'b', 'c', 'd'], maxTagCount: 2 },
    });
    cy.get('.sd-input-tag-tag').should('have.length', 3);
    // 测量副本会重复文本，用 contain 断言
    cy.get('.sd-input-tag-tag-counter').should('contain.text', '+2');
    // the counter tag itself is not closable
    cy.get('.sd-tag-close-btn').should('have.length', 2);
  });

  it('fieldNames maps custom object tag data', () => {
    cy.mount(InputTag, {
      props: {
        defaultValue: [
          { id: 1, name: 'One', canClose: false },
          { id: 2, name: 'Two', canClose: true },
        ],
        fieldNames: { value: 'id', label: 'name', closable: 'canClose' },
      },
    });
    cy.get('.sd-input-tag-tag').should('have.length', 2);
    cy.get('.sd-input-tag-tag').eq(0).should('contain', 'One');
    cy.get('.sd-tag-close-btn').should('have.length', 1);
    cy.get('.sd-tag-close-btn').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('remove')![0][0]).to.equal(2);
    });
  });

  it('formatTag formats the tag label', () => {
    cy.mount(InputTag, {
      props: { defaultValue: ['test'], formatTag: (data: { value: string }) => `#${data.value}` },
    });
    cy.get('.sd-input-tag-tag').should('contain', '#test');
  });

  it('tag slot customizes tag content', () => {
    cy.mount({
      components: { InputTag },
      template: `
        <InputTag :default-value="['test']">
          <template #tag="{ data }"><b class="custom-tag">{{ data.value }}!</b></template>
        </InputTag>
      `,
    });
    cy.get('.custom-tag').should('have.text', 'test!');
  });

  it('prefix and suffix slots render', () => {
    cy.mount({
      components: { InputTag },
      template: `
        <InputTag>
          <template #prefix><span class="my-prefix">P:</span></template>
          <template #suffix><span class="my-suffix">S:</span></template>
        </InputTag>
      `,
    });
    cy.get('.sd-input-tag-prefix .my-prefix').should('have.text', 'P:');
    cy.get('.sd-input-tag-suffix .my-suffix').should('have.text', 'S:');
    cy.get('.sd-input-tag').should('have.class', 'sd-input-tag-has-prefix');
    cy.get('.sd-input-tag').should('have.class', 'sd-input-tag-has-suffix');
  });

  it('emits focus and blur', () => {
    cy.mount(InputTag);
    cy.get('input').focus();
    cy.get('.sd-input-tag').should('have.class', 'sd-input-tag-focus');
    cy.get('input').blur();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('focus')).to.have.length(1);
      expect(wrapper.emitted('blur')).to.have.length(1);
    });
  });

  it('focused prop forces the focus class', () => {
    cy.mount(InputTag, { props: { focused: true } });
    cy.get('.sd-input-tag').should('have.class', 'sd-input-tag-focus');
  });

  it('placeholder is removed once a tag exists', () => {
    cy.mount(InputTag, { props: { placeholder: 'please input' } });
    cy.get('input').should('have.attr', 'placeholder', 'please input');
    cy.get('input').type('a{enter}');
    cy.get('input').should('not.have.attr', 'placeholder');
  });

  it('disabledInput renders the input readonly', () => {
    cy.mount(InputTag, { props: { disabledInput: true } });
    cy.get('.sd-input-tag').should('have.class', 'sd-input-tag-disabled-input');
    cy.get('input').should('have.attr', 'readonly');
  });

  it('inputAttrs are forwarded to the input element', () => {
    cy.mount(InputTag, { props: { inputAttrs: { maxlength: '5' } } });
    cy.get('input').should('have.attr', 'maxlength', '5');
  });

  it('size and error apply modifier classes', () => {
    cy.mount(InputTag, { props: { size: 'mini', error: true } });
    cy.get('.sd-input-tag').should('have.class', 'sd-input-tag-size-mini');
    cy.get('.sd-input-tag').should('have.class', 'sd-input-tag-error');
  });

  it('exposed focus() focuses the inner input', () => {
    cy.mount({
      components: { InputTag },
      template: `<InputTag ref="tagRef" />`,
    });
    cy.get('@vue')
      .then(({ wrapper }) => {
        (wrapper.vm.$refs.tagRef as unknown as { focus: () => void }).focus();
      })
      .then(() => {
        cy.focused().should('have.class', 'sd-input-tag-input');
      });
  });
});
