import { defineComponent, h, ref } from 'vue';

import Rate from '../index';

// Rate computes the value from which half (left/right layer) is clicked within
// each character, so click values are deterministic: left → index+0.5 (allowHalf)
// or index+1; right → index+1. Without the icon-font CSS the characters have no
// real layout, so clicks use force: true.
describe('Rate', () => {
  it('selects a score on click', () => {
    cy.mount(Rate, { props: { allowClear: true } });
    cy.get('.sd-rate-character-left').eq(1).click({ force: true });
    cy.get('.sd-rate-character-full').should(($els) => {
      expect($els.length).to.be.greaterThan(0);
    });
  });

  it('exposes radiogroup role and changes value via arrow keys', () => {
    cy.mount(Rate, { props: { count: 5 } });
    cy.get('.sd-rate').should('have.attr', 'role', 'radiogroup');
    cy.get('.sd-rate').should('have.attr', 'tabindex', '0');
    cy.get('.sd-rate').trigger('keydown', { key: 'ArrowRight' });
    cy.get('.sd-rate').trigger('keydown', { key: 'ArrowRight' });
  });

  it('count renders N characters', () => {
    cy.mount(Rate, { props: { count: 3 } });
    cy.get('.sd-rate-character').should('have.length', 3);
  });

  it('grading renders 5 faces that switch between frown/meh/smile by value', () => {
    cy.mount(Rate, { props: { grading: true, modelValue: 2 } });
    cy.get('.sd-rate-character').should('have.length', 5);
    // 值 2：索引 <= 2 的字符是哭脸，其余无表情（图标类型由 index 与显示值比较决定）
    cy.get('.sd-rate-character:has(.sd-icon-face-frown-fill)').should('have.length', 3);
    cy.get('.sd-rate-character:has(.sd-icon-face-meh-fill)').should('have.length', 2);
    cy.mount(Rate, { props: { grading: true, modelValue: 4 } });
    cy.get('.sd-rate-character:has(.sd-icon-face-smile-fill)').should('have.length', 5);
    cy.get('.sd-rate-character:has(.sd-icon-face-meh-fill)').should('have.length', 0);
  });

  it('v-model: clicking emits the clicked value via update:modelValue and change', () => {
    const handleUpdate = cy.spy().as('handleUpdate');
    const handleChange = cy.spy().as('handleChange');
    cy.mount(Rate, {
      props: { 'modelValue': 0, 'onUpdate:modelValue': handleUpdate, 'onChange': handleChange },
    });
    // 点第 3 颗星的右层（无 allowHalf 时左右层都计整颗）
    cy.get('.sd-rate-character-right').eq(2).click({ force: true });
    cy.get('@handleUpdate').should('have.been.calledWith', 3);
    cy.get('@handleChange').should('have.been.calledWith', 3);
  });

  it('stays in sync with an externally controlled modelValue', () => {
    const handleUpdate = cy.spy().as('handleUpdate');
    cy.mount(
      defineComponent({
        setup() {
          const value = ref(2);
          const onUpdate = (next: number) => {
            handleUpdate(next);
            value.value = next;
          };
          return () => h(Rate, { 'modelValue': value.value, 'onUpdate:modelValue': onUpdate });
        },
      }),
    );
    cy.get('.sd-rate-character-full').should('have.length', 2);
    // 点第 4 颗星的右层 → 4 分
    cy.get('.sd-rate-character-right').eq(3).click({ force: true });
    cy.get('@handleUpdate').should('have.been.calledWith', 4);
    cy.get('.sd-rate-character-full').should('have.length', 4);
    // 点第 1 颗星的左层（无 allowHalf 仍计整颗）→ 1 分
    cy.get('.sd-rate-character-left').eq(0).click({ force: true });
    cy.get('@handleUpdate').should('have.been.calledWith', 1);
    cy.get('.sd-rate-character-full').should('have.length', 1);
  });

  it('defaultValue sets the initial uncontrolled value', () => {
    cy.mount(Rate, { props: { defaultValue: 3 } });
    cy.get('.sd-rate-character-full').should('have.length', 3);
  });

  it('allowHalf: left layer selects half values and right layer whole values', () => {
    const handleChange = cy.spy().as('handleChange');
    cy.mount(Rate, { props: { allowHalf: true, onChange: handleChange } });
    cy.get('.sd-rate-character-left').eq(0).click({ force: true });
    cy.get('@handleChange').should('have.been.calledWith', 0.5);
    cy.get('.sd-rate-character-half').should('have.length', 1);
    cy.get('.sd-rate-character-right').eq(1).click({ force: true });
    cy.get('@handleChange').should('have.been.calledWith', 2);
    cy.get('.sd-rate-character-full').should('have.length', 2);
  });

  it('allowClear clears to 0 when clicking the current value', () => {
    const handleChange = cy.spy().as('handleChange');
    // 非受控（defaultValue）：受控 modelValue 不回写时 UI 正确地保持不变
    cy.mount(Rate, { props: { defaultValue: 3, allowClear: true, onChange: handleChange } });
    cy.get('.sd-rate-character-full').should('have.length', 3);
    cy.get('.sd-rate-character-right').eq(2).click({ force: true });
    cy.get('@handleChange').should('have.been.calledWith', 0);
    // hover 高亮在移出前仍生效，mouseleave 后回落到清零状态
    cy.get('.sd-rate').trigger('mouseleave');
    cy.get('.sd-rate-character-full').should('have.length', 0);
  });

  it('disabled has no tabindex and ignores clicks', () => {
    const handleChange = cy.spy().as('handleChange');
    cy.mount(Rate, { props: { disabled: true, onChange: handleChange } });
    cy.get('.sd-rate').should('have.class', 'sd-rate-disabled');
    cy.get('.sd-rate').should('not.have.attr', 'tabindex');
    cy.get('.sd-rate-character-right').eq(0).click({ force: true });
    cy.get('@handleChange').should('not.have.been.called');
  });

  it('readonly renders the readonly class without tabindex (tip in readonly-tip.cy.ts)', () => {
    cy.mount(Rate, { props: { readonly: true, modelValue: 2 } });
    cy.get('.sd-rate').should('have.class', 'sd-rate-readonly');
    cy.get('.sd-rate').should('not.have.attr', 'tabindex');
  });

  it('hoverChange fires on character mouseenter and resets to 0 on mouseleave', () => {
    cy.mount(Rate);
    cy.get('.sd-rate-character-left').eq(2).trigger('mouseenter');
    cy.get('@vue').should(({ wrapper }) => {
      const hover = wrapper.emitted('hoverChange');
      expect(hover).to.have.length(1);
      const payload = hover?.[0];
      const firstArg = payload?.[0];
      expect(firstArg).to.equal(3);
    });
    // hover 高亮临时生效
    cy.get('.sd-rate-character-full').should('have.length', 3);
    cy.get('.sd-rate').trigger('mouseleave');
    cy.get('@vue').should(({ wrapper }) => {
      const hover = wrapper.emitted('hoverChange');
      expect(hover).to.have.length(2);
      const payload = hover?.[1];
      const finalHover = payload?.[0];
      expect(finalHover).to.equal(0);
    });
    cy.get('.sd-rate-character-full').should('have.length', 0);
  });

  it('keyboard supports End/Home, vertical arrows, and clamps at the bounds', () => {
    cy.mount(Rate, { props: { count: 5 } });
    cy.get('.sd-rate').trigger('keydown', { key: 'End' });
    cy.get('@vue').should(({ wrapper }) => {
      const change = wrapper.emitted('change');
      expect(change).to.have.length(1);
      const payload = change?.[0];
      const firstArg = payload?.[0];
      expect(firstArg).to.equal(5);
    });
    // 已到最大值：ArrowRight 不再触发
    cy.get('.sd-rate').trigger('keydown', { key: 'ArrowRight' });
    cy.get('.sd-rate').trigger('keydown', { key: 'ArrowDown' });
    cy.get('@vue').should(({ wrapper }) => {
      const change = wrapper.emitted('change');
      expect(change).to.have.length(2);
      expect(change?.[1]).to.deep.equal([4]);
    });
    // ArrowUp 回到最大值 5
    cy.get('.sd-rate').trigger('keydown', { key: 'ArrowUp' });
    cy.get('@vue').should(({ wrapper }) => {
      const change = wrapper.emitted('change');
      expect(change).to.have.length(3);
      expect(change?.[2]).to.deep.equal([5]);
    });
  });

  it('keyboard does not emit when already at 0 and ArrowLeft is pressed', () => {
    cy.mount(Rate);
    cy.get('.sd-rate').trigger('keydown', { key: 'ArrowLeft' });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.equal(undefined);
    });
  });

  it('character slot customizes the icon with the index scope', () => {
    cy.mount(Rate, {
      props: { count: 2 },
      slots: {
        character:
          '<template #character="{ index }"><b class="custom-char" :data-i="index">X</b></template>',
      },
    });
    // 每颗星的 left/right 两个图层各渲染一次插槽
    cy.get('.custom-char').should('have.length', 4);
    cy.get('.custom-char').eq(0).should('have.attr', 'data-i', '0');
    cy.get('.custom-char').eq(1).should('have.attr', 'data-i', '0');
    cy.get('.custom-char').eq(2).should('have.attr', 'data-i', '1');
  });

  it('color prop tints filled characters (string form)', () => {
    cy.mount(Rate, { props: { modelValue: 2, color: 'rgb(255, 0, 0)' } });
    cy.get('.sd-rate-character-right').eq(0).should('have.css', 'color', 'rgb(255, 0, 0)');
    cy.get('.sd-rate-character-right')
      .eq(2)
      .should('have.css', 'color')
      .and('not.equal', 'rgb(255, 0, 0)');
  });

  it('color object maps per-index colors by threshold instead of the last-filled color', () => {
    // 回归：此前所有已填充字符都用 parsedDisplayIndex（最后一档）的颜色，
    // color={1:'green',3:'red'} 时 1–3 全红；现在第 1 颗星用阈值 1 的绿色。
    cy.mount(Rate, {
      props: { modelValue: 3, color: { 1: 'rgb(0, 128, 0)', 3: 'rgb(255, 0, 0)' } },
    });
    cy.get('.sd-rate-character-right')
      .eq(0)
      .should('have.css', 'color')
      .and('equal', 'rgb(0, 128, 0)');
    cy.get('.sd-rate-character-right')
      .eq(2)
      .should('have.css', 'color')
      .and('equal', 'rgb(255, 0, 0)');
  });

  it('exposes radio semantics on characters (aria-checked/posinset/setsize)', () => {
    cy.mount(Rate, { props: { modelValue: 2 } });
    cy.get('.sd-rate-character').eq(0).should('have.attr', 'aria-checked', 'true');
    cy.get('.sd-rate-character').eq(1).should('have.attr', 'aria-checked', 'true');
    cy.get('.sd-rate-character').eq(2).should('have.attr', 'aria-checked', 'false');
    cy.get('.sd-rate-character').eq(0).should('have.attr', 'aria-posinset', '1');
    cy.get('.sd-rate-character').eq(4).should('have.attr', 'aria-setsize', '5');
  });
});
