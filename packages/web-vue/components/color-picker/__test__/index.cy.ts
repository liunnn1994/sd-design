import { defineComponent, h } from 'vue';

import ConfigProvider from '../../config-provider';
import ColorPicker from '../index';
import Palette from '../palette.vue';

const gradientValue = 'linear-gradient(45deg, rgba(79, 172, 254, 1) 0%, rgba(0, 242, 254, 1) 100%)';
const threeStopGradient =
  'linear-gradient(90deg, rgb(255, 0, 0) 0%, rgb(0, 255, 0) 50%, rgb(0, 0, 255) 100%)';

describe('ColorPicker', () => {
  it('opens the panel from the named trigger slot', () => {
    cy.mount(ColorPicker, {
      props: { defaultValue: '#165dff' },
      slots: {
        trigger: (scope: any) =>
          h(
            'button',
            { class: 'custom-trigger' },
            `${scope.displayValue}|${scope.color.hex}|${scope.popupVisible}`,
          ),
      },
    });
    cy.get('.sd-color-picker input').should('not.exist');
    cy.get('.custom-trigger').should('have.text', 'rgb(22, 93, 255)|#165DFF|false');
    cy.get('.custom-trigger').click();
    cy.get('.custom-trigger').should('have.text', 'rgb(22, 93, 255)|#165DFF|true');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('popup-visible-change')?.at(-1)?.[0]).to.equal(true);
    });
  });

  it('renders the size class', () => {
    cy.mount(ColorPicker, { props: { size: 'mini' } });
    cy.get('.sd-color-picker').should('have.class', 'sd-color-picker-size-mini');
  });

  it('renders the disabled class', () => {
    cy.mount(ColorPicker, { props: { disabled: true } });
    cy.get('.sd-color-picker').should('have.class', 'sd-color-picker-disabled');
  });

  it('trigger input exposes aria-haspopup=dialog and aria-expanded', () => {
    cy.mount(ColorPicker);
    cy.get('.sd-color-picker input').should('have.attr', 'aria-haspopup', 'dialog');
    cy.get('.sd-color-picker input').should('have.attr', 'aria-expanded', 'false');
  });

  it('bridges panel changes via an onChange handler on the Panel', () => {
    cy.mount(ColorPicker, {
      props: { hideTrigger: true, format: 'RGBA', enableAlpha: true },
    });
    cy.get('@vue').should(({ wrapper }) => {
      const panel = wrapper.findComponent({ name: 'Panel' });
      expect(panel.exists()).to.equal(true);
      expect(typeof panel.props('onChange')).to.equal('function');
    });
  });

  it('uses an empty system swatch by default', () => {
    cy.mount(ColorPicker, { props: { hideTrigger: true } });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findComponent({ name: 'Panel' }).props('swatchColors')).to.deep.equal([]);
    });
  });

  it('uses system swatches from ConfigProvider', () => {
    cy.mount(
      defineComponent({
        render() {
          return h(
            ConfigProvider,
            { colorPicker: { swatchColors: ['#123456'] } },
            { default: () => h(ColorPicker, { hideTrigger: true }) },
          );
        },
      }),
    );
    cy.get('@vue').should(({ wrapper }) => {
      expect(
        wrapper.findComponent(ColorPicker).findComponent({ name: 'Panel' }).props('swatchColors'),
      ).to.deep.equal(['#123456']);
    });
  });

  it('prefers explicit swatch colors over ConfigProvider defaults', () => {
    cy.mount(
      defineComponent({
        render() {
          return h(
            ConfigProvider,
            { colorPicker: { swatchColors: ['#123456'] } },
            {
              default: () => h(ColorPicker, { hideTrigger: true, swatchColors: ['#abcdef'] }),
            },
          );
        },
      }),
    );
    cy.get('@vue').should(({ wrapper }) => {
      expect(
        wrapper.findComponent(ColorPicker).findComponent({ name: 'Panel' }).props('swatchColors'),
      ).to.deep.equal(['#abcdef']);
    });
  });

  it('passes null through when swatchColors is null', () => {
    cy.mount(ColorPicker, { props: { hideTrigger: true, swatchColors: null } });
    cy.get('@vue').should(({ wrapper }) => {
      expect(
        wrapper.findComponent(ColorPicker).findComponent({ name: 'Panel' }).props('swatchColors'),
      ).to.equal(null);
    });
  });

  it('renders the gradient mode panel', () => {
    cy.mount(ColorPicker, {
      props: {
        hideTrigger: true,
        colorModes: ['monochrome', 'linear-gradient'],
        modelValue: gradientValue,
      },
    });
    cy.get('.sd-color-picker-gradient-panel').should('exist');
    cy.get('.sd-color-picker-gradient-thumb').should('have.length', 2);
  });

  it('adds a recent color from the current selection', () => {
    cy.mount(ColorPicker, {
      props: {
        hideTrigger: true,
        recentColors: [],
        modelValue: gradientValue,
        colorModes: ['linear-gradient'],
      },
    });
    cy.get('.sd-color-picker-colors-action').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('recent-colors-change')?.[0]?.[0]).to.deep.equal([
        'linear-gradient(45deg, rgb(79, 172, 254) 0%, rgb(0, 242, 254) 100%)',
      ]);
    });
  });

  it('adds a gradient stop when multiple gradient is enabled', () => {
    cy.mount(ColorPicker, {
      props: {
        hideTrigger: true,
        enableMultipleGradient: true,
        colorModes: ['linear-gradient'],
        modelValue: gradientValue,
      },
    });
    cy.get('.sd-color-picker-gradient-bar').click('center');
    cy.get('.sd-color-picker-gradient-thumb').should('have.length', 3);
  });

  it('does not add a gradient stop when multiple gradient is disabled', () => {
    cy.mount(ColorPicker, {
      props: {
        hideTrigger: true,
        enableMultipleGradient: false,
        colorModes: ['linear-gradient'],
        modelValue: gradientValue,
      },
    });
    cy.get('.sd-color-picker-gradient-bar').click('center');
    cy.get('.sd-color-picker-gradient-thumb').should('have.length', 2);
  });

  it('opens the panel and exposes the format select', () => {
    cy.mount(ColorPicker, {
      props: { format: 'HEX', enableAlpha: true },
    });
    cy.get('.sd-color-picker').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('popup-visible-change')?.at(-1)?.[0]).to.equal(true);
    });
    cy.get('.sd-select-view').should('exist');
  });

  it('emits change and update:modelValue when dragging the palette', () => {
    cy.mount(ColorPicker, { props: { hideTrigger: true, defaultValue: '#165DFF' } });
    cy.get('.sd-color-picker-palette').then(($palette) => {
      const rect = $palette[0].getBoundingClientRect();
      cy.get('.sd-color-picker-palette').trigger('mousedown', 'left');
      cy.window().then((win) => {
        win.dispatchEvent(
          new MouseEvent('mousemove', {
            clientX: rect.right,
            clientY: rect.bottom,
            buttons: 1,
          }),
        );
        win.dispatchEvent(new MouseEvent('mouseup'));
      });
    });
    cy.get('@vue').should(({ wrapper }) => {
      const change = wrapper.emitted('change') as Array<[string, { trigger: string }]> | undefined;
      expect(change?.length ?? 0).to.be.greaterThan(0);
      expect(change?.at(-1)?.[0]).to.equal('rgb(0, 0, 0)');
      expect(change?.at(-1)?.[1]?.trigger).to.equal('palette-saturation-brightness');
      expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).to.equal('rgb(0, 0, 0)');
    });
  });

  it('emits palette-bar-change when the hue bar changes', () => {
    cy.mount(ColorPicker, { props: { hideTrigger: true, defaultValue: '#165DFF' } });
    cy.get('.sd-color-picker-control-bar-hue').trigger('mousedown', 'right');
    cy.window().then((win) => win.dispatchEvent(new MouseEvent('mouseup')));
    cy.get('@vue').should(({ wrapper }) => {
      const change = wrapper.emitted('change') as Array<[string, { trigger: string }]> | undefined;
      expect(change?.at(-1)?.[1]?.trigger).to.equal('palette-hue-bar');
      const paletteBar = wrapper.emitted('palette-bar-change') as
        | Array<[{ color: { isGradient: boolean; hex: string } }]>
        | undefined;
      expect(paletteBar?.length ?? 0).to.be.greaterThan(0);
      const context = paletteBar?.at(-1)?.[0]?.color;
      expect(context?.isGradient).to.equal(false);
      expect(typeof context?.hex).to.equal('string');
    });
  });

  it('renders the alpha bar only with enableAlpha and emits alpha changes', () => {
    cy.mount(ColorPicker, { props: { hideTrigger: true, defaultValue: '#165DFF' } });
    cy.get('.sd-color-picker-control-bar-alpha').should('not.exist');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ enableAlpha: true })));
    cy.get('.sd-color-picker-control-bar-alpha').should('exist');
    cy.get('.sd-color-picker-control-bar-alpha').trigger('mousedown', 'left');
    cy.window().then((win) => win.dispatchEvent(new MouseEvent('mouseup')));
    cy.get('@vue').should(({ wrapper }) => {
      const change = wrapper.emitted('change') as Array<[string, { trigger: string }]> | undefined;
      expect(change?.at(-1)?.[0]).to.equal('rgba(22, 93, 255, 0)');
      expect(change?.at(-1)?.[1]?.trigger).to.equal('palette-alpha-bar');
    });
  });

  it('clears the value from the trigger clear button', () => {
    cy.mount(ColorPicker, { props: { clearable: true, defaultValue: '#165DFF' } });
    cy.get('.sd-input-clear-btn').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      // clear 只走 Input @clear 一个通道（change('') 不再触发 clear），
      // 因此 clear/update:modelValue/change 各只 emit 一次
      expect(wrapper.emitted('clear')?.length).to.equal(1);
      expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).to.equal('');
      const change = wrapper.emitted('change') as Array<[string, { trigger: string }]> | undefined;
      expect(change?.length).to.equal(1);
      expect(change?.at(-1)?.[0]).to.equal('');
      expect(change?.at(-1)?.[1]?.trigger).to.equal('clear');
    });
  });

  it('displays the trigger input value in the configured format', () => {
    cy.mount(ColorPicker, { props: { format: 'HEX', defaultValue: '#165DFF' } });
    cy.get('.sd-color-picker-trigger-input input').should('have.value', '#165DFF');
  });

  it('allows typing in the trigger input', () => {
    cy.mount(ColorPicker, { props: { format: 'HEX', defaultValue: '#165DFF' } });
    cy.get('.sd-color-picker-trigger-input input')
      .clear()
      .type('#00B42A')
      .should('have.value', '#00B42A');
    cy.get('.sd-color-picker-trigger-input input').type('{enter}');
    cy.get('@vue').should(({ wrapper }) => {
      const change = wrapper.emitted('change') as Array<[string, { trigger: string }]> | undefined;
      expect(change?.at(-1)?.[0]).to.equal('#00B42A');
      expect(change?.at(-1)?.[1]?.trigger).to.equal('input');
    });
  });

  it('reads the latest color value during palette drags (stale closure regression)', () => {
    cy.mount(Palette, {
      props: {
        color: { hsv: { h: 0, s: 1, v: 1, a: 1 } },
        onChange: cy.spy().as('onChange'),
      },
      attrs: { style: 'width: 200px; height: 200px;' },
    });
    // value getter 初始化捕获 [1, 0]（s=1, v=1）。把颜色切换为白色（s=0）后，
    // 拖到右下角应产生 [1, 0] 的更新并发射 change；陈旧闭包会因 newValue 等于
    // 捕获值而吞掉这次更新。
    cy.get('@vue').then(({ wrapper }) =>
      cy.wrap(wrapper.setProps({ color: { hsv: { h: 0, s: 0, v: 1, a: 1 } } })),
    );
    // 拖到右上角：hook 内部坐标为 [1, 0]——恰好等于初始捕获值 [s=1, v=1 的 1-v=0]，
    // 陈旧闭包会因 newValue 等于捕获值而吞掉这次更新；getter 修复后 [1, 0] 与当前
    // 白色 [0, 0] 不同，正常发射。Palette 的 onChange 输出 (s, 1-v) = (1, 1)。
    cy.get('.sd-color-picker-palette')
      .then(($palette) => {
        const rect = $palette[0].getBoundingClientRect();
        cy.wrap($palette).trigger('mousedown', rect.width, 0, { force: true });
      })
      .then(() => {
        cy.window().then((win) => win.dispatchEvent(new MouseEvent('mouseup')));
      });
    cy.get('@onChange').should('have.been.calledOnce');
    cy.get('@onChange').should('have.been.calledWith', 1, 1);
  });

  it('renders the default slot as the trigger element', () => {
    cy.mount(ColorPicker, {
      slots: { default: () => h('button', { class: 'custom-default-trigger' }, 'pick') },
    });
    cy.get('.sd-color-picker').should('not.exist');
    cy.get('.custom-default-trigger').should('exist');
    cy.get('.custom-default-trigger').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('popup-visible-change')?.at(-1)?.[0]).to.equal(true);
    });
  });

  it('emits popup-visible-change false when clicking outside', () => {
    cy.mount(ColorPicker, { props: { defaultValue: '#165DFF' } });
    cy.get('.sd-color-picker').click();
    cy.get('.sd-color-picker input').should('have.attr', 'aria-expanded', 'true');
    // body 高度为 0 时中心点不可见，需 force 并指定坐标
    cy.get('body').click(600, 300, { force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('popup-visible-change')?.at(-1)?.[0]).to.equal(false);
    });
  });

  it('renders recent colors from the recentColors prop and selects one', () => {
    cy.mount(ColorPicker, {
      props: { hideTrigger: true, recentColors: ['#165DFF', '#00B42A'], defaultValue: '#F53F3F' },
    });
    cy.get('.sd-color-picker-color-block').should('have.length', 2);
    cy.get('.sd-color-picker-color-block').eq(0).click();
    cy.get('@vue').should(({ wrapper }) => {
      const change = wrapper.emitted('change') as Array<[string, { trigger: string }]> | undefined;
      expect(change?.at(-1)?.[0]).to.equal('rgb(22, 93, 255)');
      expect(change?.at(-1)?.[1]?.trigger).to.equal('recent');
    });
  });

  it('seeds recent colors from defaultRecentColors', () => {
    cy.mount(ColorPicker, { props: { hideTrigger: true, defaultRecentColors: ['#165DFF'] } });
    cy.get('.sd-color-picker-color-block').should('have.length', 1);
  });

  it('selects a system swatch color with the preset trigger', () => {
    cy.mount(ColorPicker, { props: { hideTrigger: true, swatchColors: ['#F53F3F'] } });
    cy.get('.sd-color-picker-color-block').eq(0).click();
    cy.get('@vue').should(({ wrapper }) => {
      const change = wrapper.emitted('change') as Array<[string, { trigger: string }]> | undefined;
      expect(change?.at(-1)?.[0]).to.equal('rgb(245, 63, 63)');
      expect(change?.at(-1)?.[1]?.trigger).to.equal('preset');
    });
  });

  it('commits edited format inputs as a color change', () => {
    cy.mount(ColorPicker, { props: { hideTrigger: true, defaultValue: '#165DFF' } });
    cy.get('.sd-color-picker-format-input input').should('have.length', 3);
    cy.get('.sd-color-picker-format-input input').eq(0).clear().type('0{enter}');
    cy.get('@vue').should(({ wrapper }) => {
      const change = wrapper.emitted('change') as Array<[string, { trigger: string }]> | undefined;
      expect(change?.at(-1)?.[0]).to.equal('rgb(0, 93, 255)');
      expect(change?.at(-1)?.[1]?.trigger).to.equal('input');
    });
  });

  it('switches the input format from the format select', () => {
    cy.mount(ColorPicker, { props: { hideTrigger: true, defaultValue: '#165DFF' } });
    cy.get('.sd-color-picker-format-input input').should('have.length', 3);
    cy.get('.sd-color-picker-select').click();
    cy.get('.sd-select-option').contains('CMYK').click();
    cy.get('.sd-color-picker-format-input input').should('have.length', 4);
  });

  it('re-renders format inputs when the format prop changes', () => {
    cy.mount(ColorPicker, { props: { hideTrigger: true, format: 'RGB', defaultValue: '#165DFF' } });
    cy.get('.sd-color-picker-format-input input').should('have.length', 3);
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ format: 'HEX' })));
    cy.get('.sd-color-picker-format-input input').should('have.length', 1);
    cy.get('.sd-color-picker-format-input input').eq(0).should('have.value', '165DFF');
  });

  it('renders the borderless class', () => {
    cy.mount(ColorPicker, { props: { borderless: true } });
    cy.get('.sd-color-picker').should('have.class', 'sd-color-picker-borderless');
  });

  it('disables the trigger input when disabled', () => {
    cy.mount(ColorPicker, { props: { disabled: true } });
    cy.get('.sd-color-picker-trigger-input input').should('be.disabled');
  });

  it('does not emit change from panel interaction when disabled', () => {
    cy.mount(ColorPicker, { props: { hideTrigger: true, disabled: true } });
    cy.get('.sd-color-picker-panel-disabled').should('exist');
    cy.get('.sd-color-picker-palette').trigger('mousedown', 'left');
    cy.window().then((win) => win.dispatchEvent(new MouseEvent('mouseup')));
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.equal(undefined);
    });
  });

  it('switches to gradient mode from the mode radio group', () => {
    cy.mount(ColorPicker, {
      props: { hideTrigger: true, colorModes: ['monochrome', 'linear-gradient'] },
    });
    cy.get('.sd-color-picker-gradient-panel').should('not.exist');
    cy.get('.sd-radio-button').contains('渐变').click();
    cy.get('.sd-color-picker-gradient-panel').should('exist');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.at(-1)?.[0]).to.equal(
        'linear-gradient(90deg, rgb(255, 0, 0) 0%, rgb(255, 255, 255) 100%)',
      );
    });
  });

  it('adds a gradient stop with keyboard Enter', () => {
    cy.mount(ColorPicker, {
      props: { hideTrigger: true, colorModes: ['linear-gradient'], modelValue: gradientValue },
    });
    cy.get('.sd-color-picker-gradient-thumb').should('have.length', 2);
    cy.get('.sd-color-picker-gradient-bar').trigger('keydown', { key: 'Enter' });
    cy.get('.sd-color-picker-gradient-thumb').should('have.length', 3);
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.at(-1)?.[0]).to.contain('rgb(79, 172, 254) 50%');
    });
  });

  it('removes a gradient stop with the Delete key', () => {
    cy.mount(ColorPicker, {
      props: { hideTrigger: true, colorModes: ['linear-gradient'], modelValue: threeStopGradient },
    });
    cy.get('.sd-color-picker-gradient-thumb').should('have.length', 3);
    cy.get('.sd-color-picker-gradient-thumb').eq(0).trigger('keydown', { key: 'Delete' });
    cy.get('.sd-color-picker-gradient-thumb').should('have.length', 2);
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.at(-1)?.[0]).to.equal(
        'linear-gradient(90deg, rgb(0, 255, 0) 50%, rgb(0, 0, 255) 100%)',
      );
    });
  });

  it('updates the gradient degree from the angle input', () => {
    cy.mount(ColorPicker, {
      props: { hideTrigger: true, colorModes: ['linear-gradient'], modelValue: gradientValue },
    });
    cy.get('.sd-color-picker-gradient-degree input').clear().type('180{enter}');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.at(-1)?.[0]).to.equal(
        'linear-gradient(180deg, rgb(79, 172, 254) 0%, rgb(0, 242, 254) 100%)',
      );
    });
  });

  it('toggles the primary color preview in the panel', () => {
    cy.mount(ColorPicker, { props: { hideTrigger: true } });
    cy.get('.sd-color-picker-preview').should('have.length', 1);
    cy.get('@vue').then(({ wrapper }) =>
      cy.wrap(wrapper.setProps({ showPrimaryColorPreview: false })),
    );
    cy.get('.sd-color-picker-preview').should('have.length', 0);
  });

  it('passes inputProps through to the trigger input', () => {
    cy.mount(ColorPicker, { props: { inputProps: { placeholder: 'pick color' } } });
    cy.get('.sd-color-picker-trigger-input input').should('have.attr', 'placeholder', 'pick color');
  });
});
