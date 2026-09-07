import { getFitWidthCssVar } from '../../_hooks/use-fit-width';
import Input, { InputGroup, InputPassword, InputSearch } from '../index';

const fitWidthCssVar = getFitWidthCssVar('sd');

describe('Input', () => {
  it('should update value and emit on input', () => {
    cy.mount(Input);
    cy.get('input').type('test');
    cy.get('input').should('have.value', 'test');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('input')).to.have.length(4);
    });
  });

  it('should clear content', () => {
    cy.mount(Input, { props: { defaultValue: 'test', allowClear: true } });
    cy.get('input').should('have.value', 'test');
    cy.get('.sd-input-clear-btn').click({ force: true });
    cy.get('input').should('have.value', '');
  });

  it('exposes the clear button with a name and keyboard activation', () => {
    cy.mount(Input, { props: { defaultValue: 'test', allowClear: true } });
    cy.get('.sd-input-clear-btn').as('clear');
    cy.get('@clear').should('have.attr', 'role', 'button');
    cy.get('@clear').should('have.attr', 'tabindex', '0');
    cy.get('@clear').should('have.attr', 'aria-label', '清除');
    cy.get('input').should('have.value', 'test');
    cy.get('@clear').trigger('keydown', { key: 'Enter', force: true });
    cy.get('input').should('have.value', '');
  });

  it('fits the measured text and reacts to input changes', () => {
    cy.mount(Input, { props: { defaultValue: 'i', fitWidth: true } });

    cy.get('.sd-input-wrapper').then(($short) => {
      const shortWidth = $short[0].getBoundingClientRect().width;
      expect($short[0].style.getPropertyValue(fitWidthCssVar)).to.match(/px$/);

      cy.get('input').clear().type('a much longer input value');
      cy.get('.sd-input-wrapper').should(($long) => {
        expect($long[0].getBoundingClientRect().width).to.be.greaterThan(shortWidth);
      });
    });
  });

  it('uses the 4ch fallback when value and placeholder are empty', () => {
    cy.mount(Input, { props: { fitWidth: true } });
    cy.get('.sd-input-wrapper').should(($root) => {
      expect($root[0].style.getPropertyValue(fitWidthCssVar)).to.equal('4ch');
    });
  });

  it('emits focus and blur with the native events', () => {
    cy.mount(Input);
    cy.get('input').focus().blur();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('focus')).to.have.length(1);
      expect(wrapper.emitted('blur')).to.have.length(1);
    });
  });

  it('emits change on blur only when the value changed', () => {
    cy.mount(Input);
    cy.get('input').type('abc').blur();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[0]?.[0]).to.equal('abc');
      expect(wrapper.emitted('blur')).to.have.length(1);
    });
    cy.get('input').focus().blur();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.have.length(1);
    });
  });

  it('emits pressEnter and change when Enter is pressed', () => {
    cy.mount(Input);
    cy.get('input').type('a{enter}');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('pressEnter')).to.have.length(1);
      expect(wrapper.emitted('change')?.[0]?.[0]).to.equal('a');
    });
    cy.get('input').type('{enter}');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('pressEnter')).to.have.length(2);
      expect(wrapper.emitted('change')).to.have.length(1);
    });
  });

  it('emits clear and change when the clear button is clicked', () => {
    cy.mount(Input, { props: { defaultValue: 'test', allowClear: true } });
    cy.get('.sd-input-clear-btn').click({ force: true });
    cy.get('input').should('have.value', '');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('clear')).to.have.length(1);
      expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).to.equal('');
      expect(wrapper.emitted('change')?.[0]?.[0]).to.equal('');
    });
  });

  it('hides the clear button when readonly or disabled', () => {
    cy.mount(Input, { props: { defaultValue: 'test', allowClear: true, readonly: true } });
    cy.get('.sd-input-clear-btn').should('not.exist');
    cy.mount(Input, { props: { defaultValue: 'test', allowClear: true, disabled: true } });
    cy.get('.sd-input-clear-btn').should('not.exist');
    cy.get('input').should('be.disabled');
  });

  it('applies size and error classes with aria-invalid', () => {
    cy.mount(Input, { props: { size: 'small', error: true } });
    cy.get('input').should('have.class', 'sd-input-size-small');
    cy.get('.sd-input-wrapper').should('have.class', 'sd-input-error');
    cy.get('input').should('have.attr', 'aria-invalid', 'true');
  });

  it('renders prepend and append from slots and props with the outer wrapper', () => {
    cy.mount(Input, { slots: { prepend: 'http://', append: '.com' } });
    cy.get('.sd-input-prepend').should('have.text', 'http://');
    cy.get('.sd-input-append').should('have.text', '.com');
    cy.get('.sd-input-outer').should('exist');
    cy.mount(Input, { props: { prepend: 'PRO', append: 'APP' } });
    cy.get('.sd-input-prepend').should('have.text', 'PRO');
    cy.get('.sd-input-append').should('have.text', 'APP');
  });

  it('renders prefix and suffix slots', () => {
    cy.mount(Input, {
      slots: {
        prefix: '<span class="custom-prefix">P</span>',
        suffix: '<span class="custom-suffix">S</span>',
      },
    });
    cy.get('.sd-input-prefix .custom-prefix').should('have.text', 'P');
    cy.get('.sd-input-suffix .custom-suffix').should('have.text', 'S');
  });

  it('blocks typed characters beyond maxLength and shows the word limit', () => {
    cy.mount(Input, { props: { maxLength: 5, showWordLimit: true } });
    cy.get('input').type('abcdefghij');
    cy.get('input').should('have.value', 'abcde');
    cy.get('.sd-input-word-limit').should('have.text', '5/5');
  });

  it('marks the input invalid when maxLength errorOnly is exceeded', () => {
    cy.mount(Input, {
      props: {
        maxLength: { length: 5, errorOnly: true },
        showWordLimit: true,
        modelValue: 'hello world',
      },
    });
    cy.get('.sd-input-word-limit').should('have.text', '11/5');
    cy.get('.sd-input-wrapper').should('have.class', 'sd-input-error');
    cy.get('input').should('have.attr', 'aria-invalid', 'true');
  });

  it('applies wordSlice to over-limit values', () => {
    cy.mount(Input, {
      props: {
        maxLength: 4,
        wordSlice: (value: string, maxLength: number) => value.slice(0, maxLength).toUpperCase(),
      },
    });
    cy.get('input').then(($el) => {
      const el = $el[0] as HTMLInputElement;
      el.value = 'abcdef';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    cy.get('input').should('have.value', 'ABCD');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:modelValue')?.[0]).to.deep.equal(['ABCD']);
    });
  });

  it('uses wordLength for counting and default slicing', () => {
    cy.mount(Input, {
      props: {
        maxLength: 4,
        showWordLimit: true,
        wordLength: (value: string) => [...value].length * 2,
      },
    });
    cy.get('input').type('abcd');
    cy.get('input').should('have.value', 'ab');
    cy.get('.sd-input-word-limit').should('have.text', '4/4');
  });

  it('keeps a controlled modelValue when the parent ignores updates', () => {
    cy.mount(Input, { props: { modelValue: 'a' } });
    cy.get('input').type('b');
    cy.get('input').should('have.value', 'a');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:modelValue')?.[0]).to.deep.equal(['ab']);
    });
  });

  it('forwards inputAttrs to the native input and non-event attrs to the wrapper', () => {
    cy.mount(Input, {
      props: { inputAttrs: { 'id': 'custom-input', 'data-foo': 'bar' } },
      attrs: { 'data-wrapper-attr': 'yes' },
    });
    cy.get('#custom-input').should('have.attr', 'data-foo', 'bar');
    cy.get('.sd-input-wrapper').should('have.attr', 'data-wrapper-attr', 'yes');
  });

  it('renders a native password input when type is password', () => {
    cy.mount(Input, { props: { type: 'password', modelValue: 'secret' } });
    cy.get('input').should('have.attr', 'type', 'password');
  });

  it('exposes focus() and blur() methods', () => {
    cy.mount(Input).then(({ wrapper }) => {
      (wrapper.vm as unknown as { focus: () => void }).focus();
    });
    // focus() 只在 .then 中调用一次，避免 should 重试重复触发
    cy.get('.sd-input-wrapper').should('have.class', 'sd-input-focus');
    cy.get('@vue')
      .then(({ wrapper }) => {
        (wrapper.vm as unknown as { blur: () => void }).blur();
      })
      .then(() => {
        // headless 环境下原生 blur 事件可能不触发（class 不更新），断言 DOM 焦点转移
        cy.get('input').should('not.be.focused');
      });
  });
});

describe('InputSearch', () => {
  it('emits search with the current value when the icon is clicked', () => {
    cy.mount(InputSearch);
    cy.get('input').type('query');
    cy.get('.sd-input-search .sd-icon-hover').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('search')?.[0]?.[0]).to.equal('query');
    });
  });

  it('renders a search button with custom text in searchButton mode', () => {
    cy.mount(InputSearch, { props: { searchButton: true, buttonText: 'Search' } });
    cy.get('.sd-input-search .sd-input-search-btn').should('have.text', 'Search');
    cy.get('input').type('query');
    cy.get('.sd-input-search .sd-input-search-btn').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('search')?.[0]?.[0]).to.equal('query');
    });
  });

  it('shows a loading icon instead of the search icon while loading', () => {
    cy.mount(InputSearch, { props: { loading: true } });
    cy.get('.sd-input-search .sd-icon-loading').should('exist');
    cy.get('.sd-input-search .sd-icon-hover').should('not.exist');
  });

  it('disables both input and search button when disabled', () => {
    cy.mount(InputSearch, { props: { searchButton: true, disabled: true } });
    cy.get('input').should('be.disabled');
    cy.get('.sd-input-search .sd-input-search-btn').should('be.disabled');
  });
});

describe('InputPassword', () => {
  // NOTE: per current implementation (inherited from upstream), visibility=true
  // renders a MASKED input and shows icon-eye-invisible; visibility=false shows
  // plaintext with icon-eye. Tests encode the actual behavior.
  it('starts masked and toggles to plaintext, emitting visibility-change', () => {
    cy.mount(InputPassword);
    cy.get('input').should('have.attr', 'type', 'password');
    cy.get('.sd-icon-eye-invisible').should('exist');
    cy.get('.sd-icon-eye-invisible').click();
    cy.get('input').should('have.attr', 'type', 'text');
    cy.get('.sd-icon-eye').should('exist');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('visibility-change')?.[0]).to.deep.equal([false]);
      expect(wrapper.emitted('update:visibility')?.[0]).to.deep.equal([false]);
    });
  });

  it('starts as plaintext with defaultVisibility false', () => {
    cy.mount(InputPassword, { props: { defaultVisibility: false } });
    cy.get('input').should('have.attr', 'type', 'text');
    cy.get('.sd-icon-eye').should('exist');
  });

  it('keeps the controlled visibility when the parent ignores updates', () => {
    cy.mount(InputPassword, { props: { visibility: true } });
    cy.get('input').should('have.attr', 'type', 'password');
    cy.get('.sd-icon-eye-invisible').click();
    cy.get('input').should('have.attr', 'type', 'password');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:visibility')?.[0]).to.deep.equal([false]);
    });
  });
});

describe('InputGroup', () => {
  it('renders slotted content inside a group wrapper', () => {
    cy.mount(InputGroup, { slots: { default: '<input class="grouped-input" />' } });
    cy.get('.sd-input-group .grouped-input').should('exist');
  });
});
