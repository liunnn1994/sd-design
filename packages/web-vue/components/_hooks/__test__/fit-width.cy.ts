import type { Component } from 'vue';
import { h } from 'vue';

import AutoComplete from '../../auto-complete';
import Cascader from '../../cascader';
import ConfigProvider from '../../config-provider';
import DatePicker, { RangePicker } from '../../date-picker';
import Input, { InputPassword, InputSearch } from '../../input';
import InputNumber from '../../input-number';
import InputTag from '../../input-tag';
import Mention from '../../mention';
import Select from '../../select';
import Textarea from '../../textarea';
import TimePicker from '../../time-picker';
import TreeSelect from '../../tree-select';
import { getFitWidthCssVar } from '../use-fit-width';

const fitWidthCssVar = getFitWidthCssVar('sd');

interface FitWidthCase {
  name: string;
  component: Component;
  selector: string;
  statePrefix: string;
  props?: Record<string, unknown>;
}

const cases: FitWidthCase[] = [
  {
    name: 'AutoComplete',
    component: AutoComplete,
    selector: '.sd-input-wrapper',
    statePrefix: 'sd-input',
  },
  {
    name: 'Cascader',
    component: Cascader,
    selector: '.sd-select-view-single',
    statePrefix: 'sd-select-view',
  },
  {
    name: 'DatePicker',
    component: DatePicker,
    selector: '.sd-picker',
    statePrefix: 'sd-picker',
  },
  { name: 'Input', component: Input, selector: '.sd-input-wrapper', statePrefix: 'sd-input' },
  {
    name: 'InputNumber',
    component: InputNumber,
    selector: '.sd-input-wrapper',
    statePrefix: 'sd-input',
  },
  {
    name: 'InputPassword',
    component: InputPassword,
    selector: '.sd-input-wrapper',
    statePrefix: 'sd-input',
  },
  {
    name: 'InputSearch',
    component: InputSearch,
    selector: '.sd-input-wrapper',
    statePrefix: 'sd-input',
  },
  {
    name: 'InputTag',
    component: InputTag,
    selector: '.sd-input-tag',
    statePrefix: 'sd-input-tag',
  },
  {
    name: 'Mention',
    component: Mention,
    selector: '.sd-input-wrapper',
    statePrefix: 'sd-input',
  },
  {
    name: 'RangePicker',
    component: RangePicker,
    selector: '.sd-picker-range',
    statePrefix: 'sd-picker',
  },
  {
    name: 'Select',
    component: Select,
    selector: '.sd-select-view-single',
    statePrefix: 'sd-select-view',
  },
  {
    name: 'Textarea',
    component: Textarea,
    selector: '.sd-textarea-wrapper',
    statePrefix: 'sd-textarea',
  },
  {
    name: 'TimePicker',
    component: TimePicker,
    selector: '.sd-picker',
    statePrefix: 'sd-picker',
  },
  {
    name: 'TreeSelect',
    component: TreeSelect,
    selector: '.sd-select-view-single',
    statePrefix: 'sd-select-view',
    props: { data: [] },
  },
];

const measuredCases: Array<FitWidthCase & { variableSelector?: string }> = [
  {
    name: 'InputTag',
    component: InputTag,
    selector: '.sd-input-tag',
    statePrefix: 'sd-input-tag',
    props: { defaultValue: ['标签'] },
  },
  {
    name: 'Select',
    component: Select,
    selector: '.sd-select-view-single',
    statePrefix: 'sd-select-view',
    props: { defaultValue: '短选项', options: ['短选项'] },
  },
  {
    name: 'Textarea',
    component: Textarea,
    selector: '.sd-textarea-wrapper',
    statePrefix: 'sd-textarea',
    props: { defaultValue: '短文本' },
  },
  {
    name: 'DatePicker',
    component: DatePicker,
    selector: '.sd-picker',
    statePrefix: 'sd-picker',
    variableSelector: '.sd-picker-input',
    props: { defaultValue: '2026-07-26' },
  },
];

describe('fit width public component support', () => {
  for (const item of cases) {
    it(`${item.name} forwards fitWidth and defaults maxWFull to true`, () => {
      cy.mount(item.component, {
        props: {
          ...item.props,
          fitWidth: true,
        },
      });

      cy.get(item.selector)
        .should('have.class', `${item.statePrefix}-fit-width`)
        .and('have.class', `${item.statePrefix}-max-w-full`);
    });
  }

  for (const item of measuredCases) {
    it(`${item.name} applies the measured width to its layout kernel`, () => {
      cy.mount(item.component, {
        props: {
          ...item.props,
          fitWidth: true,
        },
      });

      cy.get(item.variableSelector ?? item.selector).should(($target) => {
        expect($target[0].style.getPropertyValue(fitWidthCssVar)).to.match(/px$/);
      });
      cy.get(item.selector).should(($root) => {
        expect($root[0].getBoundingClientRect().width).to.be.lessThan(350);
      });
    });
  }

  it('supports the textarea Mention branch', () => {
    cy.mount(Mention, { props: { type: 'textarea', fitWidth: true } });
    cy.get('.sd-mention')
      .should('have.class', 'sd-mention-fit-width')
      .and('have.class', 'sd-mention-max-w-full');
    cy.get('.sd-textarea-wrapper')
      .should('have.class', 'sd-textarea-fit-width')
      .and('have.class', 'sd-textarea-max-w-full');
  });

  it('allows maxWFull to be disabled independently', () => {
    cy.mount(Input, { props: { fitWidth: true, maxWFull: false } });
    cy.get('.sd-input-wrapper')
      .should('have.class', 'sd-input-fit-width')
      .and('not.have.class', 'sd-input-max-w-full');
  });

  it('uses the ConfigProvider prefix for the fit width CSS variable', () => {
    const prefix = 'custom';
    const customFitWidthCssVar = getFitWidthCssVar(prefix);

    cy.mount({
      setup() {
        return () =>
          h(ConfigProvider, { prefixCls: prefix }, () =>
            h(Input, { defaultValue: 'configured prefix', fitWidth: true }),
          );
      },
    });

    cy.get(`.${prefix}-input-wrapper`).should(($root) => {
      expect($root[0].style.getPropertyValue(customFitWidthCssVar)).to.match(/px$/);
      expect($root[0].style.getPropertyValue(fitWidthCssVar)).to.equal('');
    });
    cy.get(`.${prefix}-input`).should(($input) => {
      expect($input[0].style.width).to.equal(`var(${customFitWidthCssVar})`);
    });
  });
});
