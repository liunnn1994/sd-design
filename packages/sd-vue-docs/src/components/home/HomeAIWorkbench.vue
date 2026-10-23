<script setup lang="ts">
  import type { SenderSlotConfig } from '@sdata/web-vue';

  import { computed, shallowRef, useTemplateRef } from 'vue';

  import { Sender, SkeletonReveal } from '@sdata/web-vue';

  const scenarios = [
    {
      name: '数据分析',
      role: '数据助手',
      verb: '分析',
      subject: '销售数据',
      choices: ['销售数据', '用户增长', '渠道转化'],
      detail: '最近 30 天',
      suffix: '，找出值得关注的变化。',
    },
    {
      name: '内容创作',
      role: '写作助手',
      verb: '为',
      subject: '产品发布',
      choices: ['产品发布', '社交媒体', '团队周报'],
      detail: '简洁、有感染力',
      suffix: '，写一份内容草稿。',
    },
    {
      name: '界面搭建',
      role: '界面助手',
      verb: '构建',
      subject: 'AI 对话界面',
      choices: ['AI 对话界面', '数据工作台', '知识库'],
      detail: '清晰、轻量',
      suffix: '，整理界面需要的组件。',
    },
  ];
  const active = shallowRef(0);
  const scenario = computed(() => scenarios[active.value]!);
  const skill = computed(() => ({ title: scenario.value.role, value: scenario.value.name }));
  const submitted = shallowRef('');
  const reveal = useTemplateRef('reveal');
  const slots = computed<SenderSlotConfig[]>(() => [
    { type: 'text', value: `${scenario.value.verb} ` },
    {
      type: 'select',
      key: 'subject',
      props: { options: scenario.value.choices, defaultValue: scenario.value.subject },
    },
    { type: 'text', value: '，' },
    {
      type: 'input',
      key: 'detail',
      props: { defaultValue: scenario.value.detail, placeholder: '补充要求' },
    },
    { type: 'text', value: scenario.value.suffix },
    { type: 'tag', key: 'format', props: { label: '结构化输出', value: ' 以结构化方式输出' } },
  ]);
  function select(index: number) {
    active.value = index;
    submitted.value = '';
  }
</script>
<template>
  <div class="home-workbench">
    <div class="home-workbench__tabs" role="group" aria-label="选择 AI 示例">
      <button
        v-for="(item, index) in scenarios"
        :key="item.name"
        type="button"
        :aria-pressed="active === index"
        @click="select(index)"
        ><span aria-hidden="true">{{ ['◈', '✎', '▦'][index] }}</span
        >{{ item.name }}</button
      >
    </div>
    <SkeletonReveal ref="reveal">
      <div class="home-workbench__body">
        <div class="home-workbench__conversation">
          <div class="home-workbench__identity"
            ><span aria-hidden="true">✳</span><strong>SD Assistant</strong></div
          >
          <Sender
            :key="active"
            :slot-config="slots"
            :skill="skill"
            :auto-size="{ minRows: 2, maxRows: 5 }"
            @submit="submitted = $event"
          />
          <p v-if="submitted" class="home-workbench__result" role="status">{{ submitted }}</p>
        </div>
      </div>
    </SkeletonReveal>
    <div class="home-workbench__caption"
      ><button type="button" @click="reveal?.replay()">重播入场 ↻</button></div
    >
  </div>
</template>
<style lang="scss" scoped>
  .home-workbench {
    text-align: left;

    &__tabs {
      display: flex;
      gap: 8px;
      align-items: center;
      padding: 12px 18px;
      background: var(--sd-color-fill-1);
      border: 1px solid var(--sd-color-border-2);
      border-bottom: 0;
      border-radius: 14px 14px 0 0;
    }

    &__tabs button {
      display: flex;
      gap: 8px;
      align-items: center;
      padding: 9px 12px;
      color: var(--sd-color-text-2);
      font: inherit;
      font-size: 13px;
      background: transparent;
      border: 0;
      border-radius: 6px;
      cursor: pointer;
    }

    &__tabs button[aria-pressed='true'] {
      color: rgb(var(--sd-primary-7));
      background: var(--sd-color-primary-light-1);
    }

    &__body {
      background: var(--sd-color-bg-2);
      border: 1px solid var(--sd-color-border-2);
      border-radius: 0 0 14px 14px;
    }

    &__conversation {
      min-width: 0;
      padding: 30px;
    }

    &__identity {
      display: flex;
      gap: 10px;
      align-items: center;
      margin-bottom: 20px;
      font-size: 13px;
    }

    &__identity > span:first-child {
      display: grid;
      place-items: center;
      width: 32px;
      height: 32px;
      color: rgb(var(--sd-primary-6));
      font-size: 26px;
    }

    &__result {
      margin-top: 20px;
      padding: 12px 16px;
      overflow-wrap: anywhere;
      background: var(--sd-color-fill-1);
      border-radius: 8px;
    }

    &__caption {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 12px;
      color: var(--sd-color-text-3);
      font-size: 12px;
    }

    &__caption button {
      flex-shrink: 0;
      padding: 0;
      color: inherit;
      font: inherit;
      background: transparent;
      border: 0;
      cursor: pointer;
    }

    button:focus-visible {
      outline: 2px solid rgb(var(--sd-primary-6));
      outline-offset: 3px;
    }

    @media (width < 50rem) {
      &__conversation {
        padding: 22px 16px;
      }

      &__tabs {
        gap: 2px;
        padding: 10px 6px;
      }

      &__tabs button {
        gap: 5px;
        padding: 8px;
      }
    }
  }
</style>
