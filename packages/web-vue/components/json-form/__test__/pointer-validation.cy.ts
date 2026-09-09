import { defineComponent, h, reactive, ref } from 'vue';

import Form, { type FormInstance } from '../../form';
import JsonFormItem from '../json-form-item.vue';
import { jsonFormBuiltInComponents } from '../utils';

describe('JsonForm JSON Pointer validation', () => {
  for (const example of [
    { key: 'a/b', path: '/a~1b' },
    { key: 'a~b', path: '/a~0b' },
  ]) {
    it(`validates the decoded field ${example.key}`, () => {
      cy.mount(
        defineComponent({
          setup() {
            const model = reactive({ [example.key]: 'filled' });
            const form = ref<FormInstance>();
            const result = ref('');
            return () =>
              h('div', [
                h(Form, { ref: form, model }, () =>
                  h(JsonFormItem, {
                    modelValue: model,
                    schema: { field: example.path, label: 'Value', required: true },
                    adapter: 'a2ui-0.9.1',
                    components: jsonFormBuiltInComponents,
                    prefixCls: 'sd-json-form',
                  }),
                ),
                h(
                  'button',
                  {
                    onClick: async () => {
                      result.value = (await form.value?.validate()) ? 'invalid' : 'valid';
                    },
                  },
                  'Validate',
                ),
                h('output', result.value),
              ]);
          },
        }),
      );
      cy.get('input').should('have.value', 'filled');
      cy.contains('button', 'Validate').click();
      cy.get('output').should('have.text', 'valid');
      cy.get('input').clear();
      cy.contains('button', 'Validate').click();
      cy.get('output').should('have.text', 'invalid');
      cy.get('input').type('restored');
      cy.contains('button', 'Validate').click();
      cy.get('output').should('have.text', 'valid');
    });
  }
});
