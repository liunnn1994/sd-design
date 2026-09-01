import { defineComponent } from 'vue';

import RegexVis from '../index';

describe('RegexVis', () => {
  it('renders groups, branches, assertions and quantified nodes as an SVG graph', () => {
    cy.mount(RegexVis, { props: { modelValue: '^(foo|bar)+\\d$' } });

    cy.get('[data-testid="regex-vis-graph"]').should('exist').and('have.attr', 'role', 'img');
    cy.get('.sd-regex-vis-node-group').should('exist');
    cy.get('.sd-regex-vis-node-choice').should('exist');
    cy.get('.sd-regex-vis-node-assertion').should('have.length', 2);
    cy.get('.sd-regex-vis-node-character').should('have.length.at.least', 3);
    cy.get('.sd-regex-vis-quantifier').should('exist');
  });

  it('matches vendor labels and renders quantifiers below their nodes', () => {
    cy.mount(RegexVis, { props: { modelValue: '/^\\d*\\.\\d+$/' } });

    cy.get('.sd-regex-vis-node-assertion').eq(0).should('have.text', '以...开始');
    cy.get('.sd-regex-vis-node-character').eq(0).should('have.text', '任意数字');
    cy.get('.sd-regex-vis-node-character').eq(1).should('have.text', '"."');
    cy.get('.sd-regex-vis-node-character').eq(2).should('have.text', '任意数字');
    cy.get('.sd-regex-vis-node-assertion').eq(1).should('have.text', '以...结束');
    cy.get('.sd-regex-vis-quantifier').should('have.length', 2);
    cy.get('.sd-regex-vis-quantifier').eq(0).should('have.text', '0 - ∞');
    cy.get('.sd-regex-vis-quantifier').eq(1).should('have.text', '1 - ∞');
    cy.get('.sd-regex-vis-quantifier')
      .eq(0)
      .within(() => {
        cy.get('svg').should('have.attr', 'width', '16').and('have.attr', 'height', '16');
        cy.get('text').should('have.css', 'font-size', '14px');
      });

    cy.get('.sd-regex-vis-node-character')
      .eq(0)
      .find('rect')
      .then(($rect) => {
        const rect = $rect[0] as SVGRectElement;
        const bottom = rect.y.baseVal.value + rect.height.baseVal.value;
        cy.get('.sd-regex-vis-quantifier')
          .eq(0)
          .invoke('attr', 'data-y')
          .then((y) => expect(Number(y)).to.be.greaterThan(bottom));
      });
  });

  it('updates the graph and flags through v-model', () => {
    cy.mount(
      defineComponent({
        components: { RegexVis },
        data: () => ({ value: 'foo', flags: [] }),
        template: `
          <div>
            <RegexVis v-model="value" v-model:flags="flags" />
            <output data-testid="value">{{ value }} / {{ flags.join('') }}</output>
          </div>
        `,
      }),
    );

    cy.get('.sd-regex-vis-input input').clear().type('[a-z]+');
    cy.get('.sd-regex-vis-name-label').should('have.text', '其一');
    cy.get('.sd-regex-vis-node-character').should('have.text', '"a" - "z"');
    cy.contains('.sd-regex-vis-flags label', 'i').click();
    cy.get('[data-testid="value"]').should('have.text', '[a-z]+ / i');
  });

  it('shows an accessible error and recovers after the pattern becomes valid', () => {
    const onError = cy.spy().as('onError');
    cy.mount(RegexVis, { props: { modelValue: '(', onError } });

    cy.get('.sd-regex-vis-error').should('have.attr', 'role', 'alert');
    cy.get('[data-testid="regex-vis-graph"]').should('not.exist');
    cy.get('@onError').should('have.been.calledOnce');

    cy.get('.sd-regex-vis-input input').clear().type('abc');
    cy.get('[data-testid="regex-vis-graph"]').should('exist');
    cy.get('@onError').should('have.been.calledWith', undefined);
  });

  it('selects nodes with pointer and keyboard interaction', () => {
    const onSelect = cy.spy().as('onSelect');
    cy.mount(RegexVis, { props: { modelValue: 'abc', onSelect } });

    cy.get('.sd-regex-vis-node-character')
      .should('have.attr', 'role', 'button')
      .and('have.attr', 'aria-pressed', 'false')
      .click()
      .should('have.attr', 'aria-pressed', 'true')
      .and('have.class', 'sd-regex-vis-node-selected');
    cy.get('@onSelect').should('have.been.calledWithMatch', { label: '"abc"' });

    cy.get('.sd-regex-vis-node-character').focus().type('{enter}');
    cy.get('@onSelect').should('have.been.calledTwice');
  });

  it('supports readonly controls and custom state slots', () => {
    cy.mount(RegexVis, {
      props: { modelValue: '(', readonly: true },
      slots: {
        error:
          '<template #error="{ error }"><strong class="custom-error">{{ error.message }}</strong></template>',
        footer:
          '<template #footer="{ value }"><span class="custom-footer">当前：{{ value }}</span></template>',
      },
    });

    cy.get('.sd-regex-vis-input input').should('have.attr', 'readonly');
    cy.get('.sd-regex-vis-flags input').should('be.disabled');
    cy.get('.custom-error').should('exist');
    cy.get('.custom-footer').should('have.text', '当前：(');
  });

  it('uses sd-design semantic tokens for SVG surfaces in dark mode', () => {
    cy.mount(
      defineComponent({
        components: { RegexVis },
        template: '<div sd-theme="dark"><RegexVis model-value="abc" /></div>',
      }),
    );

    cy.get('[sd-theme="dark"]').then(($theme) => {
      const expectedFill = getComputedStyle($theme[0])
        .getPropertyValue('--sd-color-primary-light-1')
        .trim();
      const probe = document.createElement('span');
      probe.style.color = expectedFill;
      document.body.append(probe);
      const normalizedFill = getComputedStyle(probe).color;
      probe.remove();
      cy.get('.sd-regex-vis-node-character rect').should(($rect) => {
        expect(getComputedStyle($rect[0]).fill).to.equal(normalizedFill);
      });
    });
  });

  it('renders character ranges with the vendor name and content layout', () => {
    cy.mount(RegexVis, { props: { modelValue: '[abc]' } });

    cy.get('.sd-regex-vis-name-label').should('have.text', '其一');
    cy.get('.sd-regex-vis-node-character').first().should('have.text', '"abc"');
  });

  it('labels negated character ranges like the vendor graph', () => {
    cy.mount(RegexVis, { props: { modelValue: '[^abc]' } });

    cy.get('.sd-regex-vis-name-label').should('have.text', '没有其一');
    cy.get('.sd-regex-vis-node-character').should('have.text', '"abc"');
  });

  it('renders complex URL character ranges as named multiline nodes', () => {
    cy.viewport(2200, 600);
    const modelValue = String.raw`/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#()?&//=]*)$/`;
    cy.mount(RegexVis, { props: { modelValue } });

    cy.get('.sd-regex-vis-name-label')
      .should('have.length', 3)
      .each(($label) => {
        expect($label.text()).to.equal('其一');
      });
    cy.get('.sd-regex-vis-node-character')
      .filter((_index, element) => element.querySelectorAll('tspan').length === 4)
      .first()
      .as('firstRange')
      .find('tspan')
      .then(($lines) => {
        expect([...$lines].map((line) => line.textContent?.trim())).to.deep.equal([
          '"a" - "z"',
          '"A" - "Z"',
          '"0" - "9"',
          '"-@:%._+~#="',
        ]);
      });
    cy.get('@firstRange')
      .find('rect')
      .then(($rect) => {
        const rectTop = ($rect[0] as SVGRectElement).y.baseVal.value;
        cy.get('.sd-regex-vis-name-label')
          .eq(0)
          .then(($label) => {
            expect(($label[0] as SVGTextElement).y.baseVal[0].value).to.be.lessThan(rectTop);
          });
      });
  });

  it('models an Annex-B lookahead quantifier without creating a literal character node', () => {
    cy.mount(RegexVis, { props: { modelValue: '(?=a)+' } });

    cy.get('.sd-regex-vis-node-group').first().should('contain.text', '肯定先行断言');
    cy.get('.sd-regex-vis-node-character').should('not.contain.text', '+');
    cy.get('.sd-regex-vis-quantifier').should('have.text', '1 - ∞');
  });

  it('preserves character-set escapes instead of converting them to range endpoints', () => {
    cy.mount(RegexVis, { props: { modelValue: '[a-\\d]' } });

    cy.get('.sd-regex-vis-node-character').first().should('have.text', '任意数字"a-"');
  });

  it('preserves escaped character-class source in labels', () => {
    cy.mount(RegexVis, { props: { modelValue: '[\\d\\^]' } });

    cy.get('.sd-regex-vis-node-character').first().should('have.text', '任意数字"^"');
  });

  it('keeps truncated group and backreference labels inside their rectangles', () => {
    const name = '超长命名组'.repeat(6);
    cy.mount(RegexVis, { props: { modelValue: `(?<${name}>x)\\k<${name}>` } });

    cy.get('.sd-regex-vis-node-group').first().should('contain.text', '…');
    cy.get('.sd-regex-vis-node-group, .sd-regex-vis-node-character').each(($node) => {
      const rect = $node.children('rect')[0] as SVGRectElement;
      const text = $node.children('text')[0] as SVGTextElement;
      const textBox = text.getBBox();
      const rectRight = rect.x.baseVal.value + rect.width.baseVal.value;

      expect(textBox.x + textBox.width).to.be.at.most(rectRight);
    });
  });

  it('parses Unicode named groups and backreferences', () => {
    cy.mount(RegexVis, { props: { modelValue: '(?<中文>a)\\k<中文>' } });

    cy.get('.sd-regex-vis-node-group').first().should('contain.text', '命名组 <中文>');
    cy.get('.sd-regex-vis-node-character').last().should('contain.text', '引用 中文');
  });

  it('revalidates flag-dependent syntax when the selected flags change', () => {
    cy.mount(RegexVis, { props: { modelValue: '[\\u{1F600}-\\u{1F64F}]' } });

    cy.get('.sd-regex-vis-error').should('exist');
    cy.contains('.sd-regex-vis-flags label', 'u').click();
    cy.get('[data-testid="regex-vis-graph"]').should('exist');
    cy.get('.sd-regex-vis-node-character').first().should('have.text', '😀 - 🙏');
  });

  it('keeps unicode code point escapes and their quantifiers intact', () => {
    cy.mount(RegexVis, { props: { modelValue: '\\u{1F600}+', flags: ['u'] } });

    cy.get('.sd-regex-vis-node-character').should('have.text', '\\u{1F600}');
    cy.get('.sd-regex-vis-quantifier').should('have.text', '1 - ∞');
  });

  it('decodes unicode code point range endpoints in the selected node', () => {
    const onSelect = cy.spy().as('onSelect');
    cy.mount(RegexVis, {
      props: { modelValue: '[\\u{1F600}-\\u{1F64F}]', flags: ['u'], onSelect },
    });

    cy.get('.sd-regex-vis-node-character').click();
    cy.get('@onSelect')
      .its('firstCall.args.0.node.ranges.0')
      .should('include', { from: '😀', to: '🙏' });
  });

  it('renders unicode property escapes as quantifiable character classes', () => {
    cy.mount(RegexVis, { props: { modelValue: '\\p{Script=Greek}+', flags: ['u'] } });

    cy.get('.sd-regex-vis-node-character').should('have.text', '\\p{Script=Greek}');
    cy.get('.sd-regex-vis-quantifier').should('have.text', '1 - ∞');
  });

  it('keeps unicode property syntax as ordinary text without the u flag', () => {
    const onSelect = cy.spy().as('onSelect');
    cy.mount(RegexVis, { props: { modelValue: '\\p{L}', onSelect } });

    cy.get('.sd-regex-vis-node-character').click();
    cy.get('@onSelect').should('have.been.calledWithMatch', {
      node: { type: 'character', kind: 'string', value: 'p{L}' },
    });
  });

  it('keeps unicode property escapes intact inside character classes', () => {
    cy.mount(RegexVis, { props: { modelValue: '[\\p{Script=Greek}\\d]', flags: ['u'] } });

    cy.get('.sd-regex-vis-node-character').first().should('have.text', '\\p{Script=Greek}任意数字');
  });

  it('preserves node selection when flags change', () => {
    cy.mount(RegexVis, { props: { modelValue: 'abc' } });

    cy.get('.sd-regex-vis-node-character').first().click();
    cy.get('.sd-regex-vis-node-selected').should('exist');

    cy.contains('.sd-regex-vis-flags label', 'i').click();
    cy.get('.sd-regex-vis-node-selected').should('exist');
  });

  it('syncs literal flags and rewrites the literal when flags change', () => {
    cy.mount(
      defineComponent({
        components: { RegexVis },
        data: () => ({ value: '/a/u', flags: ['g'] }),
        template: `
          <div>
            <RegexVis v-model="value" v-model:flags="flags" />
            <output data-testid="literal-value">{{ value }} / {{ flags.join('') }}</output>
          </div>
        `,
      }),
    );

    cy.get('[data-testid="literal-value"]').should('have.text', '/a/u / u');
    cy.contains('.sd-regex-vis-flags label', 'i').click();
    cy.get('[data-testid="literal-value"]').should('have.text', '/a/ui / ui');
  });

  it('reports duplicate flags supplied through v-model', () => {
    cy.mount(RegexVis, { props: { modelValue: 'a', flags: ['g', 'g'] } });

    cy.get('.sd-regex-vis-error').should('exist');
    cy.get('[data-testid="regex-vis-graph"]').should('not.exist');
  });
});
