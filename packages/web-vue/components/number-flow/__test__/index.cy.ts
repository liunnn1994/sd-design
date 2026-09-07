import { createApp, h, shallowRef } from 'vue';

import NumberFlow, { continuous, NumberFlowGroup } from '../index';

describe('NumberFlow', () => {
  it('formats the value and exposes an accessible label', () => {
    cy.mount(NumberFlow, {
      props: {
        value: 1234.5,
        locales: 'zh-CN',
        format: { minimumFractionDigits: 2 },
        prefix: '¥',
        suffix: ' 元',
        animated: false,
      },
    });
    cy.get('.sd-number-flow')
      .should('have.attr', 'role', 'img')
      .and('have.attr', 'aria-label', '¥1,234.50 元');
    cy.get('.sd-number-flow-content').should('contain.text', '¥1,234.50 元');
  });

  it('updates digits and emits animation lifecycle events', () => {
    cy.clock();
    cy.mount(NumberFlow, {
      props: {
        value: 19,
        respectMotionPreference: false,
        spinTiming: { duration: 100, easing: 'linear' },
      },
    });
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ value: 20 })));
    cy.get('.sd-number-flow-animating').should('exist');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('animationsstart')).to.have.length(1);
    });
    cy.tick(151);
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('animationsfinish')).to.have.length(1);
    });
  });

  it('only rolls changed digits upward when incrementing', () => {
    cy.mount(NumberFlow, {
      props: {
        value: 98,
        format: { minimumIntegerDigits: 3 },
        plugins: [continuous],
        respectMotionPreference: false,
      },
    });
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ value: 99 })));
    cy.get('.sd-number-flow-animating').should('exist');

    cy.get('.sd-number-flow-digit-track').then((tracks) => {
      expect(tracks.eq(0).children()).to.have.length(1);
      expect(tracks.eq(1).children()).to.have.length(1);
      expect(tracks.eq(2).children()).to.have.length(2);
    });
    cy.get('.sd-number-flow > style')
      .invoke('text')
      .should(
        'match',
        /data-number-flow-part="2"[^}]*--sd-number-flow-start:0;--sd-number-flow-end:-1/,
      );
  });

  it('rolls changed digits downward when decrementing', () => {
    cy.mount(NumberFlow, {
      props: {
        value: 99,
        format: { minimumIntegerDigits: 3 },
        plugins: [continuous],
        respectMotionPreference: false,
      },
    });
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ value: 98 })));
    cy.get('.sd-number-flow-animating').should('exist');

    cy.get('.sd-number-flow-digit-track').then((tracks) => {
      expect(tracks.eq(0).children()).to.have.length(1);
      expect(tracks.eq(1).children()).to.have.length(1);
      expect(tracks.eq(2).children()).to.have.length(2);
    });
    cy.get('.sd-number-flow > style')
      .invoke('text')
      .should(
        'match',
        /data-number-flow-part="2"[^}]*--sd-number-flow-start:-1;--sd-number-flow-end:0/,
      );
  });

  it('restarts reliably across rapid consecutive updates', () => {
    cy.clock();
    cy.mount(NumberFlow, {
      props: {
        value: 98,
        format: { minimumIntegerDigits: 3 },
        plugins: [continuous],
        respectMotionPreference: false,
        spinTiming: { duration: 100, easing: 'linear' },
      },
    });

    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ value: 99 })));
    cy.get('.sd-number-flow-animating').should('exist');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ value: 100 })));
    cy.get('.sd-number-flow-animating').should('exist');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ value: 97 })));
    cy.get('.sd-number-flow-animating').should('exist');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('animationsstart')).to.have.length(3);
      expect(wrapper.emitted('animationsfinish')).to.equal(undefined);
    });

    cy.tick(151);
    cy.get('.sd-number-flow-animating').should('not.exist');
    cy.get('.sd-number-flow-digit-track')
      .should('have.css', 'transition-duration', '0s')
      .and('have.css', 'transform', 'matrix(1, 0, 0, 1, 0, 0)');
    cy.get('.sd-number-flow').should('have.attr', 'aria-label', '097');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('animationsfinish')).to.have.length(1);
    });
  });

  it('animates sibling flows updated in the same parent event', () => {
    const integer = shallowRef(123456.78);
    const percent = shallowRef(0.42);
    const currency = shallowRef(1299);
    cy.mount(() =>
      h('div', [
        h(NumberFlow, { value: integer.value, respectMotionPreference: false }),
        h(NumberFlow, {
          value: percent.value,
          format: { style: 'percent' },
          respectMotionPreference: false,
        }),
        h(NumberFlow, {
          value: currency.value,
          locales: 'zh-CN',
          format: { style: 'currency', currency: 'CNY' },
          respectMotionPreference: false,
        }),
      ]),
    );

    cy.then(() => {
      integer.value = 654321.12;
      percent.value = 0.73;
      currency.value = 8765.43;
    });
    cy.get('.sd-number-flow-animating').should('have.length', 3);
  });

  it('renders custom prefix and suffix slots before prop content', () => {
    cy.mount(NumberFlow, {
      props: { value: 88, prefix: '$', suffix: '%' },
      slots: { prefix: () => h('strong', '收入'), suffix: () => h('em', '美元') },
    });
    cy.get('.sd-number-flow-custom-prefix').should('contain.text', '收入');
    cy.get('.sd-number-flow-custom-suffix').should('contain.text', '美元');
    cy.get('.sd-number-flow-content').should('not.contain.text', '$').and('not.contain.text', '%');
  });

  it('injects instance styles through a nonce-bearing style element', () => {
    cy.mount(NumberFlow, {
      props: {
        value: 42,
        nonce: 'number-flow-nonce',
        respectMotionPreference: false,
        spinTiming: { duration: 120, easing: 'ease-in' },
      },
    });

    cy.get('.sd-number-flow').should('not.have.attr', 'style');
    cy.get('.sd-number-flow-digit-track').should('not.have.attr', 'style');
    cy.get('.sd-number-flow > style')
      .should('have.prop', 'nonce', 'number-flow-nonce')
      .invoke('text')
      .should('include', '--sd-number-flow-spin-duration:120ms')
      .and('include', '--sd-number-flow-spin-easing:ease-in');
  });

  it('reacts to reduced-motion preference changes', () => {
    let changeListener: ((event: Pick<MediaQueryListEvent, 'matches'>) => void) | undefined;
    const mediaQuery = {
      matches: false,
      addEventListener: cy
        .stub()
        .callsFake(
          (_event: string, listener: (event: Pick<MediaQueryListEvent, 'matches'>) => void) => {
            changeListener = listener;
          },
        ),
      removeEventListener: cy.stub(),
    };
    cy.stub(window, 'matchMedia').returns(mediaQuery as unknown as MediaQueryList);

    cy.mount(NumberFlow, { props: { value: 1 } });
    cy.get('.sd-number-flow-animated').should('exist');
    cy.then(() => changeListener?.({ matches: true }));
    cy.get('.sd-number-flow-animated').should('not.exist');
  });

  it('keeps dynamic style scopes unique across separate Vue apps', () => {
    const values = [shallowRef(10), shallowRef(20)];
    const apps: ReturnType<typeof createApp>[] = [];

    cy.document().then((document) => {
      document
        .querySelectorAll('.number-flow-cross-app-test')
        .forEach((element) => element.remove());
      const container = document.createElement('div');
      container.className = 'number-flow-cross-app-test';
      document.body.append(container);
      values.forEach((current) => {
        const host = document.createElement('div');
        container.append(host);
        const app = createApp(() =>
          h(NumberFlow, { value: current.value, respectMotionPreference: false }),
        );
        apps.push(app);
        app.mount(host);
      });
    });

    cy.get('.number-flow-cross-app-test .sd-number-flow')
      .should('have.length', 2)
      .should((flows) => {
        const scopes = [...flows].map((flow) => flow.getAttribute('data-number-flow-id'));
        expect(scopes.every((scope) => typeof scope === 'string' && scope.length > 0)).to.equal(
          true,
        );
        expect(new Set(scopes).size).to.equal(2);
      });
    cy.then(() => values.forEach((current) => (current.value += 1)));
    cy.get('.number-flow-cross-app-test .sd-number-flow-animating').should('have.length', 2);
    cy.then(() => {
      apps.forEach((app) => app.unmount());
      document.querySelector('.number-flow-cross-app-test')?.remove();
    });
  });

  it('groups multiple number flows', () => {
    const first = shallowRef(1);
    const second = shallowRef(2);
    cy.mount(() =>
      h(NumberFlowGroup, null, {
        default: () => [
          h(NumberFlow, { value: first.value }),
          h(NumberFlow, { value: second.value }),
        ],
      }),
    );
    cy.get('.sd-number-flow-group .sd-number-flow').should('have.length', 2);
  });

  it('synchronizes animations across grouped flows when one value changes', () => {
    const first = shallowRef(10);
    const second = shallowRef(20);
    let yieldedBetweenStarts = false;
    let secondStartedAfterYield: boolean | undefined;
    cy.mount(() =>
      h(NumberFlowGroup, null, {
        default: () => [
          h(NumberFlow, {
            value: first.value,
            respectMotionPreference: false,
            onAnimationsstart: () => queueMicrotask(() => (yieldedBetweenStarts = true)),
          }),
          h(NumberFlow, {
            value: second.value,
            respectMotionPreference: false,
            onAnimationsstart: () => (secondStartedAfterYield = yieldedBetweenStarts),
          }),
        ],
      }),
    );
    // Change only one value — the group should trigger all to animate
    cy.then(() => {
      first.value = 11;
    });
    // Both flows should get the animating class in the same frame
    cy.get('.sd-number-flow-animating').should('have.length', 2);
    cy.then(() => expect(secondStartedAfterYield).to.equal(false));
  });

  it('renders the final value immediately without animation when animated is false', () => {
    cy.mount(NumberFlow, {
      props: { value: 5, animated: false, respectMotionPreference: false },
    });
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ value: 9 })));
    cy.get('.sd-number-flow-animating').should('not.exist');
    cy.get('.sd-number-flow-prepared').should('not.exist');
    cy.get('.sd-number-flow').should('have.attr', 'aria-label', '9');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('animationsstart')).to.equal(undefined);
      expect(wrapper.emitted('animationsfinish')).to.equal(undefined);
    });
  });

  it('parses string values for formatting and animation', () => {
    cy.clock();
    cy.mount(NumberFlow, {
      props: {
        value: '1234.5',
        locales: 'zh-CN',
        format: { minimumFractionDigits: 2 },
        respectMotionPreference: false,
        spinTiming: { duration: 100, easing: 'linear' },
      },
    });
    cy.get('.sd-number-flow').should('have.attr', 'aria-label', '1,234.50');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ value: '1235' })));
    cy.get('.sd-number-flow-animating').should('exist');
    cy.tick(151);
    cy.get('.sd-number-flow-animating').should('not.exist');
    cy.get('.sd-number-flow').should('have.attr', 'aria-label', '1,235.00');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('animationsstart')).to.have.length(1);
      expect(wrapper.emitted('animationsfinish')).to.have.length(1);
    });
  });

  it('renders negative values with a sign part and accessible label', () => {
    cy.mount(NumberFlow, { props: { value: -42 } });
    cy.get('.sd-number-flow-sign').should('contain.text', '-');
    cy.get('.sd-number-flow').should('have.attr', 'aria-label', '-42');
    cy.get('.sd-number-flow-content').should('contain.text', '-42');
  });

  it('hides decorative content from assistive tech', () => {
    cy.mount(NumberFlow, {
      props: { value: 5, prefix: '¥' },
      slots: { prefix: () => h('strong', '收入') },
    });
    cy.get('.sd-number-flow-content').should('have.attr', 'aria-hidden', 'true');
    cy.get('.sd-number-flow-custom-prefix').should('have.attr', 'aria-hidden', 'true');
  });

  it('toggles the will-change class from the willChange prop', () => {
    cy.mount(NumberFlow, { props: { value: 1, willChange: true } });
    cy.get('.sd-number-flow-will-change').should('exist');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ willChange: false })));
    cy.get('.sd-number-flow-will-change').should('not.exist');
  });

  it('reflects object-form timing props as CSS variables and sanitizes unsafe easing', () => {
    cy.mount(NumberFlow, {
      props: {
        value: 7,
        transformTiming: { duration: 2000, easing: 'ease-in-out' },
        opacityTiming: { duration: -5, easing: 'linear; } body{background:url(x)}' },
      },
    });
    cy.get('.sd-number-flow > style')
      .invoke('text')
      .should((text) => {
        expect(text).to.include('--sd-number-flow-duration:2000ms');
        expect(text).to.include('--sd-number-flow-easing:ease-in-out');
        expect(text).to.include('--sd-number-flow-opacity-duration:0ms');
        expect(text).to.not.include('url(');
        expect(text).to.not.include('background');
      });
  });

  it('honors a numeric trend override when computing digit deltas', () => {
    cy.clock();
    cy.mount(NumberFlow, {
      props: {
        value: 98,
        trend: 1,
        format: { minimumIntegerDigits: 3 },
        respectMotionPreference: false,
      },
    });
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ value: 91 })));
    cy.get('.sd-number-flow-animating').should('exist');
    cy.get('.sd-number-flow-digit-track').then((tracks) => {
      expect(tracks.eq(0).children()).to.have.length(1);
      expect(tracks.eq(1).children()).to.have.length(1);
      expect(tracks.eq(2).children()).to.have.length(4);
    });
    cy.get('.sd-number-flow > style')
      .invoke('text')
      .should(
        'match',
        /data-number-flow-part="2"[^}]*--sd-number-flow-start:0;--sd-number-flow-end:-3/,
      );
  });

  it('disables animation when reduced motion is preferred at mount time', () => {
    cy.stub(window, 'matchMedia').returns({
      matches: true,
      addEventListener: cy.stub(),
      removeEventListener: cy.stub(),
    } as unknown as MediaQueryList);
    cy.mount(NumberFlow, { props: { value: 1 } });
    cy.get('.sd-number-flow-animated').should('not.exist');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ value: 2 })));
    cy.get('.sd-number-flow-animating').should('not.exist');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('animationsstart')).to.equal(undefined);
    });
  });

  it('stops synchronizing a flow after it unmounts from the group', () => {
    const showSecond = shallowRef(true);
    const first = shallowRef(10);
    cy.clock();
    cy.mount(() =>
      h(NumberFlowGroup, null, {
        default: () => [
          h(NumberFlow, { value: first.value, respectMotionPreference: false }),
          showSecond.value ? h(NumberFlow, { value: 30, respectMotionPreference: false }) : null,
        ],
      }),
    );
    cy.get('.sd-number-flow-group .sd-number-flow').should('have.length', 2);
    cy.then(() => {
      showSecond.value = false;
    });
    cy.get('.sd-number-flow-group .sd-number-flow').should('have.length', 1);
    cy.then(() => {
      first.value = 11;
    });
    cy.get('.sd-number-flow-animating').should('have.length', 1);
  });
});
