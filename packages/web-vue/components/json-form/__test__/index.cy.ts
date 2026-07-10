import { defineComponent } from 'vue';

import ConfigProvider from '../../config-provider';
import JsonForm, { A2UI_0_8 } from '../index';

describe('JsonForm', () => {
  it('renders the default schema and updates a nested model', () => {
    const model = { user: { name: '' } };
    cy.mount(JsonForm, {
      props: {
        modelValue: model,
        schemas: [{ field: 'user.name', label: '用户名', type: 'input', required: true }],
      },
    });
    cy.get('input').should('exist');
    cy.get('input').type('Alice');
    cy.wrap(model).should((m) => {
      expect(m.user.name).to.equal('Alice');
    });
  });

  it('translates an a2ui schema before rendering', () => {
    const model = { form: { name: '', enabled: false, channels: [] } };
    cy.mount(JsonForm, {
      props: {
        adapter: A2UI_0_8,
        modelValue: model,
        schemas: [
          {
            id: 'form-layout',
            component: {
              Row: {
                children: { explicitList: ['name-input', 'enabled-switch', 'channel-select'] },
              },
            },
          },
          {
            id: 'name-input',
            component: {
              TextField: { label: { literalString: '姓名' }, text: { path: '/form/name' } },
            },
          },
          {
            id: 'enabled-switch',
            component: {
              Switch: { label: { literalString: '启用' }, value: { path: '/form/enabled' } },
            },
          },
          {
            id: 'channel-select',
            component: {
              Select: {
                label: { literalString: '渠道' },
                value: { path: '/form/channels' },
                options: [
                  { label: { literalString: '短信' }, value: 'sms' },
                  { label: { literalString: '邮件' }, value: 'email' },
                ],
                multiple: true,
              },
            },
          },
        ],
      },
    });
    cy.get('input').should('exist');
    cy.get('input').first().type('Bob');
    cy.wrap(model).should((m) => {
      expect(m.form.name).to.equal('Bob');
    });
    cy.get('.sd-switch').should('exist');
    cy.get('.sd-select').should('exist');
  });

  it('reads custom components from the config provider', () => {
    const model = { script: '' };
    const FakeCodeEditor = defineComponent({
      name: 'FakeCodeEditor',
      props: { modelValue: String, language: String },
      emits: ['update:modelValue'],
      template:
        '<button class="fake-code-editor" type="button" @click="$emit(\'update:modelValue\', \'const answer = 42;\')">{{ language }} {{ modelValue }}</button>',
    });
    cy.mount(
      defineComponent({
        components: { ConfigProvider, JsonForm },
        setup() {
          return {
            model,
            schemas: [
              {
                field: 'script',
                label: '脚本',
                type: 'codeEditor',
                componentProps: { language: 'ts' },
              },
            ],
            jsonForm: { components: { codeEditor: FakeCodeEditor } },
          };
        },
        template: `
          <sd-config-provider :json-form="jsonForm">
            <sd-json-form v-model="model" :schemas="schemas" />
          </sd-config-provider>
        `,
      }),
    );
    cy.get('.fake-code-editor').should('exist').and('contain.text', 'ts');
    cy.get('.fake-code-editor').click();
    cy.wrap(model).should((m) => {
      expect(m.script).to.equal('const answer = 42;');
    });
  });
});
