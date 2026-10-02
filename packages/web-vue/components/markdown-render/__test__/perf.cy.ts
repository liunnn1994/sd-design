import { defineComponent, h, ref } from 'vue';

import type { MarkdownRenderInstance } from '..';

import { MarkdownRender, UpstreamMarkdownRender } from '../../index';

/**
 * 大数据渲染护栏。
 *
 * 上游对容器子节点（列表项里的段落等）有轻量行内路径和嵌套渲染器两条路，
 * 只要注入的节点映射表里出现对应类型的键，它就会走后者。这个文件守住
 * 「SD 默认映射不得触发嵌套渲染器」这条边界，并覆盖流式增量渲染。
 */
const LONG_DOC = Array.from(
  { length: 300 },
  (_, index) =>
    `## 标题 ${index}\n\n段落 ${index}，含 **加粗**、[链接](https://example.com/${index}) 和 \`code\`。\n\n- 项目 A\n- 项目 B\n`,
).join('\n');

interface DomStats {
  slots: number;
  elements: number;
  /** SD 默认映射不应产生嵌套渲染器；数量不为 0 即表示退化。 */
  nestedRenderers: number;
  /** 嵌套 slot 的 data-node-index 与父级索引空间冲突时的计数。 */
  nestedSlots: number;
}

function readStats(): DomStats {
  const root = document.querySelector('.markdown-renderer') as HTMLElement;
  const slots = Array.from(root.querySelectorAll('.node-slot'));
  return {
    slots: slots.length,
    elements: root.querySelectorAll('*').length,
    nestedRenderers: root.querySelectorAll('.markdown-renderer .markdown-renderer').length,
    // 顶层 slot 的父链最终也会命中根渲染器，所以要排除根节点自身才算嵌套。
    nestedSlots: slots.filter((slot) => {
      const owner = slot.parentElement?.closest('.markdown-renderer');
      return !!owner && owner !== root;
    }).length,
  };
}

function mountRenderer(props: Record<string, unknown>) {
  const instance = ref<MarkdownRenderInstance | null>(null);
  const Host = defineComponent({
    setup: () => () =>
      h(MarkdownRender as never, { ref: instance, ...props } as Record<string, never>),
  });
  cy.mount(Host);
  return instance;
}

describe('大数据渲染与虚拟化', () => {
  it('长文档不产生嵌套渲染器', () => {
    mountRenderer({ content: LONG_DOC, final: true });
    cy.wait(1500);
    cy.then(() => {
      const stats = readStats();
      expect(stats.nestedRenderers, '嵌套渲染器数量').to.equal(0);
      expect(stats.nestedSlots, '嵌套 node-slot 数量').to.equal(0);
      // 仍然要真的渲染出内容，避免用「什么都没渲染」冒充通过。
      expect(stats.slots).to.be.greaterThan(0);
      expect(document.querySelectorAll('.markdown-renderer h2').length).to.be.greaterThan(0);
    });
  });

  it('挂载的 node 数量与上游原生渲染器一致', () => {
    const results: Record<string, DomStats> = {};
    for (const [name, Comp] of [
      ['upstream', UpstreamMarkdownRender],
      ['sd', MarkdownRender],
    ] as const) {
      const Host = defineComponent({
        setup: () => () => h(Comp as never, { content: LONG_DOC, final: true } as never),
      });
      cy.mount(Host);
      cy.wait(1500);
      cy.then(() => {
        results[name] = readStats();
      });
    }
    cy.then(() => {
      // 节点预算必须一致：SD 的默认节点适配不得改变上游的挂载规模。
      expect(results.sd.slots, 'node-slot 数量').to.equal(results.upstream.slots);
      // 允许 SD 组件自身的包裹元素带来的少量增量，但不允许数量级差异。
      expect(results.sd.elements).to.be.at.most(results.upstream.elements * 1.2);
    });
  });

  it('maxLiveNodes 预算不被嵌套节点撑破', () => {
    const results: Record<string, number> = {};
    for (const [name, Comp] of [
      ['upstream', UpstreamMarkdownRender],
      ['sd', MarkdownRender],
    ] as const) {
      const Host = defineComponent({
        setup: () => () =>
          h(
            Comp as never,
            {
              content: LONG_DOC,
              final: true,
              maxLiveNodes: 60,
              liveNodeBuffer: 10,
            } as never,
          ),
      });
      cy.mount(Host);
      cy.wait(1500);
      cy.then(() => {
        results[name] = readStats().slots;
      });
    }
    cy.then(() => {
      expect(results.upstream).to.be.greaterThan(0);
      expect(results.sd, 'SD 实际挂载的 node 数量').to.equal(results.upstream);
    });
  });

  it('虚拟化仍然生效：节点预算远小于文档规模', () => {
    mountRenderer({ content: LONG_DOC, final: true, maxLiveNodes: 40, liveNodeBuffer: 5 });
    cy.wait(1500);
    cy.then(() => {
      const stats = readStats();
      // 文档有 900 个顶层节点，虚拟化后只应挂载预算内的少量节点。
      expect(stats.slots).to.be.at.most(120);
      expect(stats.slots).to.be.greaterThan(0);
    });
  });

  it('虚拟化状态可捕获并恢复', () => {
    const instance = mountRenderer({
      content: LONG_DOC,
      final: true,
      maxLiveNodes: 60,
      liveNodeBuffer: 10,
    });
    cy.wait(1500);
    cy.then(() => {
      const metrics = instance.value?.getVirtualMetrics();
      expect(metrics).to.have.property('nodeCount');
      expect(metrics?.nodeCount).to.equal(900);
      const state = instance.value?.captureVirtualState();
      expect(state).to.have.property('metrics');
      if (state) instance.value?.restoreVirtualState(state);
    });
  });
});

describe('流式增量渲染', () => {
  it('逐 chunk 追加后内容完整且无重复', () => {
    const content = ref('');
    const Host = defineComponent({
      setup: () => () => h(MarkdownRender, { content: content.value, final: false }),
    });
    cy.mount(Host);
    const chunks = [
      '## 流式标题\n\n第一段，',
      '包含 **加粗** 与 ',
      '[链接](https://example.com)。\n\n',
      '```js\nconst a = 1\n```\n',
    ];
    for (const chunk of chunks) {
      cy.then(() => {
        content.value += chunk;
      });
      cy.wait(100);
    }
    cy.wait(600);
    cy.then(() => {
      const text = document.querySelector('.markdown-renderer')!.textContent ?? '';
      expect(text).to.contain('流式标题');
      expect(text).to.contain('第一段，包含');
      expect(text).to.contain('加粗');
      // 跨 chunk 拼接的加粗不得丢字或重复。
      expect(text.match(/第一段，包含/g)?.length ?? 0).to.equal(1);
      expect(document.querySelector('.markdown-renderer h2')).not.to.equal(null);
      expect(document.querySelector('.markdown-renderer pre')).not.to.equal(null);
    });
  });

  it('final 收尾后停止继续追加 typewriter 光标', () => {
    const content = ref('未闭合的**加粗');
    const final = ref(false);
    const Host = defineComponent({
      setup: () => () =>
        h(MarkdownRender, { content: content.value, final: final.value, typewriter: 'precise' }),
    });
    cy.mount(Host);
    cy.get('.typewriter-cursor').should('exist');
    cy.then(() => {
      content.value = '未闭合的**加粗**结束';
      final.value = true;
    });
    cy.get('.markdown-renderer').should('contain.text', '结束');
    cy.get('.typewriter-cursor').should('not.exist');
    cy.get('.markdown-renderer strong').should('have.text', '加粗');
  });
});
