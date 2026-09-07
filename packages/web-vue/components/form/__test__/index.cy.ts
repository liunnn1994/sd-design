import { defineComponent } from 'vue';

import Input from '../../input';
import Form, { FormInstance, ValidatedError } from '../index';
import Demo from './demo.vue';

const FormItem = Form.Item;

describe('Form', () => {
  it('should show an error message for invalid input', () => {
    cy.mount(Demo);
    cy.get('#name input').focus();
    cy.get('#name input').type('test');
    cy.get('#name input').blur();
    cy.get('.sd-form-item-message').should('have.text', 'name should up 6 chars');
  });

  it('should emit submit with validation errors', () => {
    cy.mount(Demo);
    cy.get('@vue').then(({ wrapper }) => {
      const form = wrapper.findComponent({ name: 'Form' });
      return cy.wrap(form.trigger('submit'));
    });
    cy.get('@vue').should(({ wrapper }) => {
      const form = wrapper.findComponent({ name: 'Form' });
      const emitted = form.emitted<{ errors: Record<string, string[]> }[]>('submit');
      expect(emitted).to.not.equal(undefined);
      expect(emitted![0][0].errors).to.have.property('name');
    });
  });

  it('associates the label with its control via matching for/id', () => {
    const TestApp = defineComponent({
      name: 'LabelAssocDemo',
      components: { SdForm: Form, SdFormItem: FormItem, SdInput: Input },
      data: () => ({ form: { name: '' } }),
      template: `
        <sd-form :model="form">
          <sd-form-item field="name" label="Username">
            <sd-input v-model="form.name" />
          </sd-form-item>
        </sd-form>
      `,
    });
    cy.mount(TestApp);
    cy.get('.sd-form-item-label')
      .eq(0)
      .then(($label) => {
        const forAttr = $label.attr('for');
        expect(forAttr, 'label has for').to.not.equal(undefined);
        cy.get('input')
          .eq(0)
          .then(($input) => {
            expect($input.attr('id'), 'input id matches label for').to.equal(forAttr);
          });
      });
  });

  const MethodsHarness = defineComponent({
    name: 'FormMethodsHarness',
    components: { SdForm: Form, SdFormItem: FormItem, SdInput: Input },
    data: () => ({
      form: { name: 'initial', post: '' },
      rules: {
        name: [{ required: true, message: 'name is required' }],
        post: [{ required: true, message: 'post is required' }],
      },
    }),
    template: `
      <sd-form :model="form" :rules="rules">
        <sd-form-item field="name" label="Name">
          <sd-input id="f-name" v-model="form.name" />
        </sd-form-item>
        <sd-form-item field="post" label="Post">
          <sd-input id="f-post" v-model="form.post" />
        </sd-form-item>
      </sd-form>
    `,
  });

  const getFormVm = (wrapper: { findComponent: (o: { name: string }) => { vm: unknown } }) =>
    wrapper.findComponent({ name: 'Form' }).vm as FormInstance;

  it('exposed validate() resolves field errors for an invalid form', () => {
    cy.mount(MethodsHarness);
    cy.get('@vue').then(async ({ wrapper }) => {
      const errors = await getFormVm(wrapper).validate();
      expect(errors).to.not.equal(undefined);
      expect(Object.keys(errors as Record<string, ValidatedError>)).to.deep.equal(['post']);
      expect(errors!.post.field).to.equal('post');
      expect(errors!.post.isRequiredError).to.equal(true);
      expect(errors!.post.message).to.equal('post is required');
    });
    cy.get('.sd-form-item-message').should('have.text', 'post is required');
  });

  it('exposed validate() resolves undefined for a valid form', () => {
    cy.mount(MethodsHarness);
    cy.get('#f-post input').type('engineer');
    cy.get('#f-post input').blur();
    cy.get('@vue').then(async ({ wrapper }) => {
      const errors = await getFormVm(wrapper).validate();
      expect(errors).to.equal(undefined);
    });
    cy.get('.sd-form-item-message').should('not.exist');
  });

  it('exposed validateField() validates only the requested field(s)', () => {
    cy.mount(MethodsHarness);
    cy.get('@vue').then(async ({ wrapper }) => {
      const errors = await getFormVm(wrapper).validateField('post');
      expect(errors).to.not.equal(undefined);
      expect(Object.keys(errors as Record<string, ValidatedError>)).to.deep.equal(['post']);
    });
    cy.get('.sd-form-item-message').should('have.length', 1);
    cy.get('.sd-form-item-message').should('have.text', 'post is required');

    cy.get('@vue').then(async ({ wrapper }) => {
      const errors = await getFormVm(wrapper).validateField(['name', 'post']);
      expect(errors).to.not.equal(undefined);
      // "name" is still valid, so only "post" fails
      expect(Object.keys(errors as Record<string, ValidatedError>)).to.deep.equal(['post']);
    });
    cy.get('.sd-form-item-message').should('have.length', 1);
  });

  it('exposed resetFields() restores initial values and clears validation state', () => {
    cy.mount(MethodsHarness);
    cy.get('#f-name input').clear();
    cy.get('#f-name input').blur();
    cy.get('.sd-form-item-message').should('have.text', 'name is required');

    cy.get('@vue').then(({ wrapper }) => {
      getFormVm(wrapper).resetFields();
    });
    cy.get('#f-name input').should('have.value', 'initial');
    cy.get('.sd-form-item-message').should('not.exist');
  });

  it('exposed clearValidate() clears error state without changing values', () => {
    cy.mount(MethodsHarness);
    cy.get('#f-name input').clear();
    cy.get('#f-name input').blur();
    cy.get('.sd-form-item-message').should('have.text', 'name is required');

    cy.get('@vue').then(({ wrapper }) => {
      getFormVm(wrapper).clearValidate();
    });
    cy.get('.sd-form-item-message').should('not.exist');
    cy.get('#f-name input').should('have.value', '');
  });

  it('exposed setFields() updates the model value and validation status', () => {
    cy.mount(MethodsHarness);
    cy.get('@vue').then(({ wrapper }) => {
      getFormVm(wrapper).setFields({ post: { value: 'engineer', status: 'success' } });
    });
    cy.get('#f-post input').should('have.value', 'engineer');
    cy.get('.sd-form-item').eq(1).should('have.class', 'sd-form-item-status-success');
  });

  it('emits submitFailed with errors on invalid submit', () => {
    cy.mount(Demo);
    cy.get('@vue').then(({ wrapper }) => {
      const form = wrapper.findComponent({ name: 'Form' });
      return cy.wrap(form.trigger('submit'));
    });
    cy.get('@vue').should(({ wrapper }) => {
      const form = wrapper.findComponent({ name: 'Form' });
      const failed = form.emitted('submitFailed') as unknown as
        | Array<[{ errors: Record<string, unknown> }, Event]>
        | undefined;
      expect(failed).to.not.equal(undefined);
      expect(failed![0][0].errors).to.have.property('name');
      expect(failed![0][0].errors).to.have.property('post');
    });
  });

  it('emits submitSuccess and submit without errors on valid submit', () => {
    const ValidHarness = defineComponent({
      name: 'FormSubmitValidHarness',
      components: { SdForm: Form, SdFormItem: FormItem, SdInput: Input },
      data: () => ({ form: { name: 'ok' } }),
      template: `
        <sd-form :model="form">
          <sd-form-item
            field="name"
            label="Name"
            :rules="[{ required: true, message: 'name is required' }]"
          >
            <sd-input v-model="form.name" />
          </sd-form-item>
        </sd-form>
      `,
    });
    cy.mount(ValidHarness);
    cy.get('@vue').then(({ wrapper }) => {
      const form = wrapper.findComponent({ name: 'Form' });
      return cy.wrap(form.trigger('submit'));
    });
    cy.get('@vue').should(({ wrapper }) => {
      const form = wrapper.findComponent({ name: 'Form' });
      const success = form.emitted('submitSuccess') as unknown as
        | Array<[Record<string, unknown>, Event]>
        | undefined;
      expect(success).to.not.equal(undefined);
      expect(success![0][0]).to.deep.equal({ name: 'ok' });

      const submitted = form.emitted('submit') as unknown as
        | Array<[{ errors: Record<string, unknown> | undefined }, Event]>
        | undefined;
      expect(submitted).to.not.equal(undefined);
      expect(submitted![0][0].errors).to.equal(undefined);
    });
  });

  it('applies layout, size and labelAlign classes', () => {
    const ClassHarness = defineComponent({
      name: 'FormClassHarness',
      components: { SdForm: Form, SdFormItem: FormItem, SdInput: Input },
      data: () => ({ form: { name: '' } }),
      template: `
        <sd-form :model="form" layout="vertical" size="small" label-align="left">
          <sd-form-item field="name" label="Name">
            <sd-input v-model="form.name" />
          </sd-form-item>
        </sd-form>
      `,
    });
    cy.mount(ClassHarness);
    cy.get('form.sd-form').should('have.class', 'sd-form-layout-vertical');
    cy.get('form.sd-form').should('have.class', 'sd-form-size-small');
    cy.get('.sd-form-item-label-col').should('have.class', 'sd-form-item-label-col-left');
  });

  it('prefixes field wrapper ids with the form id for nested field paths', () => {
    const IdHarness = defineComponent({
      name: 'FormIdHarness',
      components: { SdForm: Form, SdFormItem: FormItem, SdInput: Input },
      data: () => ({ form: { profile: { name: '' } } }),
      template: `
        <sd-form id="user-form" :model="form">
          <sd-form-item field="profile.name" label="Name">
            <sd-input v-model="form.profile.name" />
          </sd-form-item>
        </sd-form>
      `,
    });
    cy.mount(IdHarness);
    cy.get('form#user-form').should('exist');
    cy.get('#user-form-profile_name').should('exist');
  });

  it('disables nested inputs via form disabled with item-level override', () => {
    const DisabledHarness = defineComponent({
      name: 'FormDisabledHarness',
      components: { SdForm: Form, SdFormItem: FormItem, SdInput: Input },
      data: () => ({ form: { name: '', post: '' } }),
      template: `
        <sd-form :model="form" disabled>
          <sd-form-item field="name" label="Name">
            <sd-input v-model="form.name" />
          </sd-form-item>
          <sd-form-item field="post" label="Post" :disabled="false">
            <sd-input v-model="form.post" />
          </sd-form-item>
        </sd-form>
      `,
    });
    cy.mount(DisabledHarness);
    cy.get('input').eq(0).should('be.disabled');
    cy.get('input').eq(1).should('not.be.disabled');
  });

  it('item-level rules take priority over form-level rules', () => {
    const RulesHarness = defineComponent({
      name: 'FormRulesPriorityHarness',
      components: { SdForm: Form, SdFormItem: FormItem, SdInput: Input },
      data: () => ({
        form: { name: '' },
        formRules: { name: { minLength: 6, message: 'form rule' } },
      }),
      template: `
        <sd-form :model="form" :rules="formRules">
          <sd-form-item field="name" label="Name" :rules="[{ required: true, message: 'item rule' }]">
            <sd-input v-model="form.name" />
          </sd-form-item>
        </sd-form>
      `,
    });
    cy.mount(RulesHarness);
    cy.get('@vue').then(async ({ wrapper }) => {
      const errors = await getFormVm(wrapper).validate();
      expect(errors).to.not.equal(undefined);
      expect(errors!.name.message).to.equal('item rule');
    });
    cy.get('.sd-form-item-message').should('have.text', 'item rule');
  });

  it('renders required asterisk with start/end positions and supports hideAsterisk and showColon', () => {
    const AsteriskHarness = defineComponent({
      name: 'FormAsteriskHarness',
      components: { SdForm: Form, SdFormItem: FormItem, SdInput: Input },
      data: () => ({ form: { a: '', b: '', c: '' } }),
      template: `
        <sd-form :model="form">
          <sd-form-item field="a" label="A" required show-colon>
            <sd-input v-model="form.a" />
          </sd-form-item>
          <sd-form-item field="b" label="B" required asterisk-position="end">
            <sd-input v-model="form.b" />
          </sd-form-item>
          <sd-form-item field="c" label="C" required hide-asterisk>
            <sd-input v-model="form.c" />
          </sd-form-item>
        </sd-form>
      `,
    });
    cy.mount(AsteriskHarness);
    cy.get('.sd-form-item').eq(0).find('.sd-form-item-label-required-symbol').should('exist');
    cy.get('.sd-form-item').eq(0).find('.sd-form-item-label').should('contain.text', ':');
    cy.get('.sd-form-item').eq(1).find('.sd-form-item-label-required-symbol').should('exist');
    cy.get('.sd-form-item').eq(2).find('.sd-form-item-label-required-symbol').should('not.exist');
  });

  it('renders label, help and extra slots', () => {
    const SlotsHarness = defineComponent({
      name: 'FormSlotsHarness',
      components: { SdForm: Form, SdFormItem: FormItem, SdInput: Input },
      data: () => ({ form: { name: '' } }),
      template: `
        <sd-form :model="form">
          <sd-form-item field="name">
            <template #label>Custom Label</template>
            <sd-input v-model="form.name" />
            <template #help>Help text</template>
            <template #extra>Extra text</template>
          </sd-form-item>
        </sd-form>
      `,
    });
    cy.mount(SlotsHarness);
    cy.get('.sd-form-item-label').should('contain.text', 'Custom Label');
    cy.get('.sd-form-item-message-help').should('have.text', 'Help text');
    cy.get('.sd-form-item-extra').should('have.text', 'Extra text');
  });

  it('applies manual validateStatus to the form item', () => {
    const StatusHarness = defineComponent({
      name: 'FormStatusHarness',
      components: { SdForm: Form, SdFormItem: FormItem, SdInput: Input },
      data: () => ({ form: { name: '', post: '' } }),
      template: `
        <sd-form :model="form">
          <sd-form-item field="name" label="Name" validate-status="warning">
            <sd-input v-model="form.name" />
          </sd-form-item>
          <sd-form-item field="post" label="Post" validate-status="error">
            <sd-input v-model="form.post" />
          </sd-form-item>
        </sd-form>
      `,
    });
    cy.mount(StatusHarness);
    cy.get('.sd-form-item').eq(0).should('have.class', 'sd-form-item-status-warning');
    cy.get('.sd-form-item').eq(1).should('have.class', 'sd-form-item-status-error');
    cy.get('.sd-form-item').eq(1).should('have.class', 'sd-form-item-error');
  });

  it('renders a tooltip icon next to the label', () => {
    const TooltipHarness = defineComponent({
      name: 'FormTooltipHarness',
      components: { SdForm: Form, SdFormItem: FormItem, SdInput: Input },
      data: () => ({ form: { name: '' } }),
      template: `
        <sd-form :model="form">
          <sd-form-item field="name" label="Name" tooltip="Some hint">
            <sd-input v-model="form.name" />
          </sd-form-item>
        </sd-form>
      `,
    });
    cy.mount(TooltipHarness);
    cy.get('.sd-form-item-label-tooltip').should('exist');
  });

  it('hideLabel removes the label column', () => {
    const HideLabelHarness = defineComponent({
      name: 'FormHideLabelHarness',
      components: { SdForm: Form, SdFormItem: FormItem, SdInput: Input },
      data: () => ({ form: { name: '' } }),
      template: `
        <sd-form :model="form">
          <sd-form-item field="name" label="Name" hide-label>
            <sd-input v-model="form.name" />
          </sd-form-item>
        </sd-form>
      `,
    });
    cy.mount(HideLabelHarness);
    cy.get('.sd-form-item-label-col').should('not.exist');
    cy.get('.sd-form-item-content-wrapper').should('exist');
  });

  it('noStyle renders the bare slot without layout wrapper', () => {
    const NoStyleHarness = defineComponent({
      name: 'FormNoStyleHarness',
      components: { SdForm: Form, SdFormItem: FormItem, SdInput: Input },
      data: () => ({ form: { name: '' } }),
      template: `
        <sd-form :model="form">
          <sd-form-item field="name" no-style>
            <sd-input v-model="form.name" />
          </sd-form-item>
        </sd-form>
      `,
    });
    cy.mount(NoStyleHarness);
    cy.get('.sd-form-item').should('not.exist');
    cy.get('.sd-input').should('exist');
  });

  it('labelAttrs overrides the default for attribute', () => {
    const LabelAttrsHarness = defineComponent({
      name: 'FormLabelAttrsHarness',
      components: { SdForm: Form, SdFormItem: FormItem, SdInput: Input },
      data: () => ({ form: { name: '' } }),
      template: `
        <sd-form :model="form">
          <sd-form-item field="name" label="Name" :label-attrs="{ for: 'custom-id' }">
            <sd-input v-model="form.name" />
          </sd-form-item>
        </sd-form>
      `,
    });
    cy.mount(LabelAttrsHarness);
    cy.get('.sd-form-item-label').should('have.attr', 'for', 'custom-id');
  });
});
