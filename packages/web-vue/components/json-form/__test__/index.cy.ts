import { defineComponent, h } from 'vue';

import type { ValidatedError } from '../../form';
import type { JsonFormInstance } from '../index';

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

  it('renders inputMask schemas and updates the masked model value', () => {
    const model = { date: '' };
    cy.mount(JsonForm, {
      props: {
        modelValue: model,
        schemas: [
          {
            field: 'date',
            label: '日期',
            type: 'inputMask',
            componentProps: { mask: '9999-99-99', maskChar: null },
          },
        ],
      },
    });

    cy.get('.sd-input-mask')
      .should('have.class', 'sd-json-form-control')
      .find('input')
      .should('have.attr', 'placeholder', '请输入日期')
      .type('20260806')
      .should('have.value', '2026-08-06');
    cy.wrap(model).should((value) => {
      expect(value.date).to.equal('2026-08-06');
    });
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

  const getJsonFormVm = (wrapper: { vm: unknown }) => wrapper.vm as JsonFormInstance;

  it('exposed validate()/validateField() 应用 schema.required 规则并返回字段错误', () => {
    cy.mount(JsonForm, {
      props: {
        modelValue: { user: { name: '' }, email: '' },
        schemas: [
          { field: 'user.name', label: '用户名', type: 'input', required: true },
          { field: 'email', label: '邮箱', type: 'input' },
        ],
      },
    });
    cy.get('.sd-form-item-message').should('not.exist');
    cy.get('@vue').then(async ({ wrapper }) => {
      const errors = await getJsonFormVm(wrapper).validate();
      expect(errors).to.not.equal(undefined);
      expect(Object.keys(errors as Record<string, ValidatedError>)).to.deep.equal(['user.name']);
      expect((errors as Record<string, ValidatedError>)['user.name'].message).to.equal(
        '用户名不能为空',
      );
    });
    cy.get('.sd-form-item-message').should('have.text', '用户名不能为空');
    cy.get('input').eq(0).type('Alice');
    cy.get('@vue').then(async ({ wrapper }) => {
      const errors = await getJsonFormVm(wrapper).validateField('user.name');
      expect(errors).to.equal(undefined);
    });
  });

  it('formItemRules 替代 schema.required 生成的默认规则', () => {
    cy.mount(JsonForm, {
      props: {
        modelValue: { name: '' },
        schemas: [
          {
            field: 'name',
            label: '名称',
            type: 'input',
            required: true,
            formItemRules: [{ minLength: 5, message: '至少 5 个字符' }],
          },
        ],
      },
    });
    cy.get('input').eq(0).type('ab');
    cy.get('@vue').then(async ({ wrapper }) => {
      const errors = await getJsonFormVm(wrapper).validate();
      expect(errors).to.not.equal(undefined);
      expect(errors!['name'].message).to.equal('至少 5 个字符');
    });
    cy.get('.sd-form-item-message').should('have.text', '至少 5 个字符');
    cy.get('input').eq(0).type('cde');
    cy.get('@vue').then(async ({ wrapper }) => {
      const errors = await getJsonFormVm(wrapper).validate();
      expect(errors).to.equal(undefined);
    });
  });

  it('exposed resetFields() 还原初始值并清除校验状态', () => {
    cy.mount(
      defineComponent({
        name: 'JsonFormResetHarness',
        data: () => ({
          model: { user: { name: 'initial' } },
          schemas: [{ field: 'user.name', label: '用户名', type: 'input', required: true }],
        }),
        template: `<sd-json-form ref="jf" v-model="model" :schemas="schemas" />`,
      }),
    );
    cy.get('input').eq(0).should('have.value', 'initial');
    cy.get('input').eq(0).clear();
    cy.get('@vue').then(async ({ wrapper }) => {
      const form = (wrapper.vm.$refs.jf ?? {}) as JsonFormInstance;
      await form.validate();
    });
    cy.get('.sd-form-item-message').should('have.text', '用户名不能为空');
    cy.get('@vue').then(({ wrapper }) => {
      (wrapper.vm.$refs.jf as unknown as JsonFormInstance).resetFields();
    });
    cy.get('input').eq(0).should('have.value', 'initial');
    cy.get('.sd-form-item-message').should('not.exist');
  });

  it('exposed clearValidate() 清除校验提示且不改变字段值', () => {
    const model = { name: '' };
    cy.mount(JsonForm, {
      props: {
        modelValue: model,
        schemas: [{ field: 'name', label: '名称', type: 'input', required: true }],
      },
    });
    cy.get('@vue').then(async ({ wrapper }) => {
      await getJsonFormVm(wrapper).validate();
    });
    cy.get('.sd-form-item-message').should('have.text', '名称不能为空');
    cy.get('@vue').then(({ wrapper }) => {
      getJsonFormVm(wrapper).clearValidate();
    });
    cy.get('.sd-form-item-message').should('not.exist');
    cy.get('input').eq(0).should('have.value', '');
  });

  it('hidden 字段默认不渲染，hidden 插槽可自定义渲染并透传 record/value', () => {
    cy.mount(JsonForm, {
      props: {
        modelValue: { name: '', secret: 's3cret' },
        schemas: [
          { field: 'name', label: '名称', type: 'input' },
          { field: 'secret', hidden: true },
        ],
      },
    });
    cy.get('input').should('have.length', 1);
    cy.get('.sd-form-item').should('have.length', 1);

    cy.mount(
      defineComponent({
        name: 'JsonFormHiddenSlotHarness',
        data: () => ({
          model: { name: '', secret: 's3cret' },
          schemas: [
            { field: 'name', label: '名称', type: 'input' },
            { field: 'secret', hidden: true },
          ],
        }),
        template: `
          <sd-json-form v-model="model" :schemas="schemas">
            <template #hidden="{ record, value }">[{{ record.field }}={{ value }}]</template>
          </sd-json-form>
        `,
      }),
    );
    cy.get('.sd-json-form').should('contain.text', '[secret=s3cret]');
    cy.get('input').should('have.length', 1);
  });

  it('noFormItem 类型经 slotName 渲染插槽内容且不包裹 FormItem', () => {
    cy.mount(
      defineComponent({
        name: 'JsonFormNoFormItemHarness',
        data: () => ({
          model: { tip: 'ignored', name: '' },
          schemas: [
            { field: 'tip', type: 'noFormItem', slotName: 'tip' },
            { field: 'name', label: '名称', type: 'input' },
          ],
        }),
        template: `
          <sd-json-form v-model="model" :schemas="schemas">
            <template #tip="{ record, value }">[{{ record.field }}={{ value }}]</template>
          </sd-json-form>
        `,
      }),
    );
    cy.get('.sd-json-form').should('contain.text', '[tip=ignored]');
    cy.get('.sd-form-item').should('have.length', 1);
    cy.get('input').should('have.length', 1);
  });

  it('slotName 在 FormItem 内替换默认控件并透传 record/value', () => {
    cy.mount(
      defineComponent({
        name: 'JsonFormSlotNameHarness',
        data: () => ({
          model: { name: 'hello' },
          schemas: [{ field: 'name', label: '名称', type: 'input', slotName: 'custom' }],
        }),
        template: `
          <sd-json-form v-model="model" :schemas="schemas">
            <template #custom="{ record, value }">
              <em class="custom-control">{{ record.field }}={{ value }}</em>
            </template>
          </sd-json-form>
        `,
      }),
    );
    cy.get('.custom-control').should('have.text', 'name=hello');
    cy.get('.sd-form-item').find('input').should('not.exist');
    cy.get('.sd-form-item-label').should('contain.text', '名称');
  });

  it('schema.render 在 FormItem 内渲染自定义内容', () => {
    cy.mount(JsonForm, {
      props: {
        modelValue: { name: '' },
        schemas: [
          {
            field: 'name',
            label: '名称',
            render: () => h('div', { class: 'render-marker' }, 'rendered-content'),
          },
        ],
      },
    });
    cy.get('.render-marker').should('have.text', 'rendered-content');
    cy.get('.sd-form-item-label').should('contain.text', '名称');
  });

  it('row 类型渲染子字段并应用 span/colProps 列宽', () => {
    const model = { a: '', b: '' };
    cy.mount(JsonForm, {
      props: {
        modelValue: model,
        schemas: [
          {
            field: 'row-1',
            type: 'row',
            componentProps: { gutter: 8 },
            children: [
              { field: 'a', label: 'A', type: 'input', span: 12 },
              { field: 'b', label: 'B', type: 'input', colProps: { span: 12 } },
            ],
          },
        ],
      },
    });
    cy.get('.sd-json-form-row').should('exist');
    cy.get('.sd-json-form-row .sd-col-12').should('have.length', 2);
    cy.get('.sd-json-form-row input').eq(0).type('va');
    cy.wrap(model).should((m) => {
      expect(m.a).to.equal('va');
    });
    cy.get('.sd-json-form-row input').eq(1).type('vb');
    cy.wrap(model).should((m) => {
      expect(m.b).to.equal('vb');
    });
  });

  it('按 type/label 生成默认 placeholder 且 componentProps.placeholder 优先', () => {
    cy.mount(JsonForm, {
      props: {
        modelValue: { name: '', city: '', code: '' },
        schemas: [
          { field: 'name', label: '用户名', type: 'input' },
          { field: 'city', label: '城市', type: 'select', componentProps: { options: [] } },
          {
            field: 'code',
            label: '编码',
            type: 'input',
            componentProps: { placeholder: '自定义' },
          },
        ],
      },
    });
    cy.get('input').eq(0).should('have.attr', 'placeholder', '请输入用户名');
    cy.get('input').eq(1).should('have.attr', 'placeholder', '请选择城市');
    cy.get('input').eq(2).should('have.attr', 'placeholder', '自定义');
  });

  it('未指定 type 默认渲染 input，未知 type 回退到 input', () => {
    const model = { a: '', b: '' };
    cy.mount(JsonForm, {
      props: {
        modelValue: model,
        schemas: [
          { field: 'a', label: '甲' },
          { field: 'b', label: '乙', type: 'noSuchType' },
        ],
      },
    });
    cy.get('input').should('have.length', 2);
    cy.get('input').eq(0).should('have.attr', 'placeholder', '请输入甲');
    cy.get('input').eq(1).should('not.have.attr', 'placeholder');
    cy.get('input').eq(1).type('x');
    cy.wrap(model).should((m) => {
      expect(m.b).to.equal('x');
    });
  });

  it('componentEvents 绑定到实际控件事件', () => {
    const model = { agree: false };
    cy.mount(JsonForm, {
      props: {
        modelValue: model,
        schemas: [
          {
            field: 'agree',
            label: '同意',
            type: 'checkbox',
            componentEvents: { change: cy.stub().as('agreeChange') },
          },
        ],
      },
    });
    cy.get('.sd-checkbox').click();
    cy.get('@agreeChange').should('have.been.called');
    cy.wrap(model).should((m) => {
      expect(m.agree).to.equal(true);
    });
  });

  it('A2UI 0.9.1 TextField 变体映射控件类型并透传 validationRegexp', () => {
    cy.mount(JsonForm, {
      props: {
        adapter: A2UI_0_9_1,
        modelValue: { longText: '', number: 0, password: '', code: '' },
        schemas: [
          { id: 'root', component: 'Column', children: ['a', 'b', 'c', 'd'] },
          {
            id: 'a',
            component: 'TextField',
            label: '简介',
            variant: 'longText',
            value: { path: '/longText' },
          },
          {
            id: 'b',
            component: 'TextField',
            label: '数量',
            variant: 'number',
            value: { path: '/number' },
          },
          {
            id: 'c',
            component: 'TextField',
            label: '密码',
            variant: 'obscured',
            value: { path: '/password' },
          },
          {
            id: 'd',
            component: 'TextField',
            label: '口令',
            value: { path: '/code' },
            validationRegexp: '^\\d{4}$',
          },
        ],
      },
    });
    cy.get('textarea').should('exist');
    cy.get('.sd-input-number').should('exist');
    cy.get('input[type="password"]').should('have.length', 1);
    cy.get('input[pattern]').should('have.attr', 'pattern', '^\\d{4}$');
  });

  it('A2UI 0.9.1 Slider 应用 min/max 且 Row 容器生成 row 布局', () => {
    cy.mount(JsonForm, {
      props: {
        adapter: A2UI_0_9_1,
        modelValue: { level: 50 },
        schemas: [
          { id: 'root', component: 'Row', children: ['s'] },
          {
            id: 's',
            component: 'Slider',
            label: '等级',
            min: 0,
            max: 100,
            value: { path: '/level' },
          },
        ],
      },
    });
    cy.get('.sd-json-form-row').should('exist');
    cy.get('.sd-slider-btn').should('have.attr', 'style').and('contain', '50%');
  });

  it('A2UI 0.9.1 DateTimeInput 按 enableDate/enableTime 映射为日期/时间选择器', () => {
    cy.mount(JsonForm, {
      props: {
        adapter: A2UI_0_9_1,
        modelValue: { d: '', t: '' },
        schemas: [
          { id: 'root', component: 'Column', children: ['a', 'b'] },
          {
            id: 'a',
            component: 'DateTimeInput',
            label: '日期',
            enableDate: true,
            value: { path: '/d' },
          },
          {
            id: 'b',
            component: 'DateTimeInput',
            label: '时间',
            enableTime: true,
            value: { path: '/t' },
          },
        ],
      },
    });
    cy.get('.sd-icon-calendar').should('have.length', 1);
    cy.get('.sd-icon-clock-circle').should('have.length', 1);
  });

  it('model prop 未受控用法渲染初始值并就地更新', () => {
    const model = { name: 'preset' };
    cy.mount(JsonForm, {
      props: {
        model,
        schemas: [{ field: 'name', label: '名称', type: 'input' }],
      },
    });
    cy.get('input').eq(0).should('have.value', 'preset');
    cy.get('input').eq(0).type('-v2');
    cy.wrap(model).should((m) => {
      expect(m.name).to.equal('preset-v2');
    });
  });

  it('component prop 自定义根元素，default 插槽替换 schema 渲染', () => {
    const model = { name: '' };
    cy.mount(JsonForm, {
      props: {
        component: 'div',
        modelValue: model,
        schemas: [{ field: 'name', label: '名称', type: 'input' }],
      },
    });
    cy.get('div.sd-json-form').should('exist');
    cy.get('input').eq(0).type('ok');
    cy.wrap(model).should((m) => {
      expect(m.name).to.equal('ok');
    });

    cy.mount(
      defineComponent({
        name: 'JsonFormDefaultSlotHarness',
        data: () => ({
          model: { name: '' },
          schemas: [{ field: 'name', label: '名称', type: 'input' }],
        }),
        template: `
          <sd-json-form v-model="model" :schemas="schemas">
            <div class="custom-default">custom-content</div>
          </sd-json-form>
        `,
      }),
    );
    cy.get('.custom-default').should('contain.text', 'custom-content');
    cy.get('.sd-form-item').should('not.exist');
  });

  it('hideLabel/hideAsterisk/showColon 透传并影响 label 渲染', () => {
    const schemas = [{ field: 'name', label: '名称', type: 'input', required: true }];
    cy.mount(JsonForm, {
      props: { modelValue: { name: '' }, schemas },
    });
    cy.get('.sd-form-item-label').should('contain.text', '名称');
    cy.get('.sd-form-item-label-required-symbol').should('exist');
    cy.get('.sd-form-item-label').should('not.contain.text', ':');

    cy.mount(JsonForm, {
      props: { modelValue: { name: '' }, schemas, hideAsterisk: true },
    });
    cy.get('.sd-form-item-label-required-symbol').should('not.exist');

    cy.mount(JsonForm, {
      props: { modelValue: { name: '' }, schemas, showColon: true },
    });
    cy.get('.sd-form-item-label').should('contain.text', '名称 :');

    cy.mount(JsonForm, {
      props: { modelValue: { name: '' }, schemas, hideLabel: true },
    });
    cy.get('.sd-form-item-label').should('not.exist');
  });

  it('checkbox 字段把 label 渲染为复选框内容并双向绑定', () => {
    const model = { agree: false };
    cy.mount(JsonForm, {
      props: {
        modelValue: model,
        schemas: [{ field: 'agree', label: '同意', type: 'checkbox' }],
      },
    });
    cy.get('.sd-checkbox').should('contain.text', '同意');
    cy.get('.sd-checkbox').click();
    cy.wrap(model).should((m) => {
      expect(m.agree).to.equal(true);
    });
  });

  it('submit 事件经 $attrs 转发并携带校验结果', () => {
    cy.mount(
      defineComponent({
        name: 'JsonFormSubmitHarness',
        data: () => ({
          model: { user: { name: '' } },
          schemas: [
            { field: 'user.name', label: '用户名', type: 'input', required: true },
            { field: 'actions', type: 'noFormItem', slotName: 'actions' },
          ],
          onSubmit: cy.stub().as('formSubmit'),
        }),
        template: `
          <sd-json-form v-model="model" :schemas="schemas" @submit="onSubmit">
            <template #actions>
              <button type="submit" class="submit-btn">提交</button>
            </template>
          </sd-json-form>
        `,
      }),
    );
    cy.get('.submit-btn').click();
    cy.get('@formSubmit').should('have.been.calledOnce');
    cy.get('@formSubmit').should((stub) => {
      const [data] = stub.getCall(0).args;
      expect(data.errors).to.not.equal(undefined);
      expect(Object.keys(data.errors as Record<string, ValidatedError>)).to.deep.equal([
        'user.name',
      ]);
    });
  });
});
