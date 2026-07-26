import { defineComponent } from 'vue';

import ConfigProvider from '../../config-provider';
import JsonForm, { A2UI_0_9_1 } from '../index';

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

  it('forwards per-component fit width props without a form-level option', () => {
    cy.mount(JsonForm, {
      props: {
        modelValue: { name: '' },
        schemas: [
          {
            field: 'name',
            label: '名称',
            type: 'input',
            componentProps: { fitWidth: true, maxWFull: false },
          },
        ],
      },
    });

    cy.get('.sd-input-wrapper')
      .should('have.class', 'sd-input-fit-width')
      .and('not.have.class', 'sd-input-max-w-full');
  });

  it('按 A2UI 0.9.1 的 root 邻接表和 JSON Pointer 渲染并更新表单', () => {
    const model = {
      contact: {
        name: '',
        enabled: false,
        channels: [] as string[],
      },
    };

    cy.mount(JsonForm, {
      props: {
        adapter: A2UI_0_9_1,
        modelValue: model,
        schemas: [
          {
            id: 'name-field',
            component: 'TextField',
            label: '姓名',
            value: { path: '/contact/name' },
            variant: 'shortText',
          },
          {
            id: 'root',
            component: 'Column',
            children: ['name-field', 'enabled-field', 'channel-field'],
          },
          {
            id: 'enabled-field',
            component: 'CheckBox',
            label: '启用',
            value: { path: '/contact/enabled' },
          },
          {
            id: 'channel-field',
            component: 'ChoicePicker',
            label: '通知渠道',
            options: [
              { label: '短信', value: 'sms' },
              { label: '邮件', value: 'email' },
            ],
            value: { path: '/contact/channels' },
          },
        ],
      },
    });

    cy.get('input').first().type('Alice');
    cy.wrap(model).should((value) => {
      expect(value.contact.name).to.equal('Alice');
    });

    cy.get('.sd-checkbox').first().click();
    cy.wrap(model).should((value) => {
      expect(value.contact.enabled).to.equal(true);
    });

    cy.contains('.sd-checkbox', '短信').click();
    cy.contains('.sd-checkbox', '邮件').should('have.class', 'sd-checkbox-disabled');
    cy.wrap(model).should((value) => {
      expect(value.contact.channels).to.deep.equal(['sms']);
    });
  });

  it('A2UI 0.9.1 缺少 root 时不渲染游离节点', () => {
    cy.mount(JsonForm, {
      props: {
        adapter: A2UI_0_9_1,
        modelValue: { contact: { name: '' } },
        schemas: [
          {
            id: 'name-field',
            component: 'TextField',
            label: '姓名',
            value: { path: '/contact/name' },
          },
        ],
      },
    });

    cy.get('input').should('not.exist');
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

  it('switch 字段保留固有宽度并双向绑定布尔值', () => {
    // 回归：sd-json-form-control--inline 曾设 min-width: 0，覆盖 switch 自身的
    // min-width，把无文档流内容的 switch 根元素压成 0 宽度（不可见、不可点）。
    const model = { status: true };
    cy.mount(JsonForm, {
      props: {
        modelValue: model,
        schemas: [{ field: 'status', label: '启用', type: 'switch' }],
      },
    });
    cy.get('.sd-switch').should('be.visible').and('have.class', 'sd-switch-checked');
    cy.get('.sd-switch').click();
    cy.wrap(model).should((m) => {
      expect(m.status).to.equal(false);
    });
  });
});
