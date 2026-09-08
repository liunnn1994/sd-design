<template>
  <div :class="prefixCls">
    <div
      aria-hidden="true"
      :class="[
        `${prefixCls}-icon`,
        {
          [`${prefixCls}-icon-${mergedStatus}`]: mergedStatus,
          [`${prefixCls}-icon-custom`]: mergedStatus === null,
        },
      ]"
    >
      <div :class="`${prefixCls}-icon-tip`">
        <slot name="icon">
          <icon-info v-if="mergedStatus === 'info'" />
          <icon-check v-else-if="mergedStatus === 'success'" />
          <icon-exclamation v-else-if="mergedStatus === 'warning'" />
          <icon-close v-else-if="mergedStatus === 'error'" />
          <result-forbidden v-else-if="mergedStatus === '403'" />
          <result-not-found v-else-if="mergedStatus === '404'" />
          <result-server-error v-else-if="mergedStatus === '500'" />
        </slot>
      </div>
    </div>
    <div v-if="title || $slots.title" :class="`${prefixCls}-title`">
      <slot name="title">
        {{ title }}
      </slot>
    </div>
    <div v-if="subtitle || $slots.subtitle" :class="`${prefixCls}-subtitle`">
      <slot name="subtitle">
        {{ subtitle }}
      </slot>
    </div>
    <div v-if="$slots.extra" :class="`${prefixCls}-extra`">
      <slot name="extra"></slot>
    </div>
    <div v-if="$slots.default" :class="`${prefixCls}-content`">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { PropType, computed } from 'vue';

  import { getPrefixCls } from '../_utils/global-config';
  import IconCheck from '../icon/icon-check';
  import IconClose from '../icon/icon-close';
  import IconExclamation from '../icon/icon-exclamation';
  import IconInfo from '../icon/icon-info';
  import ResultForbidden from './403.vue';
  import ResultNotFound from './404.vue';
  import ResultServerError from './500.vue';
  import { RESULT_STATUS, type ResultStatus } from './utils';

  defineOptions({ name: 'Result' });

  const props = defineProps({
    /**
     * @zh 结果页显示的状态
     * @en The status displayed on the result page
     * @values 'info','success','warning','error','403','404','500', null
     */
    status: {
      type: String as PropType<ResultStatus>,
      default: 'info',
      validator: (value: any) => {
        return RESULT_STATUS.includes(value);
      },
    },
    /**
     * @zh 标题内容
     * @en Title
     */
    title: String,
    /**
     * @zh 子标题内容
     * @en Subtitle
     */
    subtitle: String,
  });

  /**
   * @zh 图标
   * @en Icon
   * @slot icon
   */
  /**
   * @zh 标题
   * @en Title
   * @slot title
   */
  /**
   * @zh 副标题
   * @en Subtitle
   * @slot subtitle
   */
  /**
   * @zh 操作区
   * @en Extra
   * @slot extra
   * @version 2.8.0
   */
  /**
   * @zh 默认插槽
   * @en Default
   * @slot default
   * @version 2.8.0
   */

  const prefixCls = getPrefixCls('result');

  // 非法 status 回退到默认的 info 分支，避免渲染空的 icon 块
  const mergedStatus = computed(() =>
    RESULT_STATUS.includes(props.status) ? props.status : 'info',
  );
</script>
