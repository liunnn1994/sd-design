<template>
  <Modal
    :visible="context.visible.value"
    :title="resolvedTitle"
    :width="width"
    :render-to-body="renderToBody"
    :unmount-on-close="unmountOnClose"
    :mask-closable="maskClosable"
    :esc-to-close="escToClose"
    :closable="false"
    :footer="false"
    :modal-class="`${prefixCls}-modal`"
    :body-class="`${prefixCls}-body`"
    @update:visible="context.setVisible"
  >
    <div :class="prefixCls">
      <slot />
    </div>
  </Modal>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  import { getPrefixCls } from '../_utils/global-config';
  import { useI18n } from '../locale';
  import Modal from '../modal';
  import { useModelSelectorContext } from './use-model-selector-context';

  defineOptions({ name: 'ModelSelectorContent' });

  const {
    title,
    width = 640,
    renderToBody = true,
    unmountOnClose = true,
    maskClosable = true,
    escToClose = true,
  } = defineProps<{
    /**
     * @zh 对话框的无障碍标题
     * @en Accessible dialog title
     */
    title?: string;
    /**
     * @zh 对话框宽度
     * @en Dialog width
     */
    width?: number | string;
    /**
     * @zh 是否挂载到 body
     * @en Whether to render under body
     */
    renderToBody?: boolean;
    /**
     * @zh 关闭时是否卸载内容
     * @en Whether to unmount content when closed
     */
    unmountOnClose?: boolean;
    /**
     * @zh 点击遮罩是否关闭
     * @en Whether clicking the mask closes the dialog
     */
    maskClosable?: boolean;
    /**
     * @zh 是否允许 Esc 关闭
     * @en Whether Escape closes the dialog
     */
    escToClose?: boolean;
  }>();

  const prefixCls = getPrefixCls('model-selector');
  const { t } = useI18n();
  // 弹层标题走语言包：此前硬编码中文，切换到 en-US 时仍显示中文
  const resolvedTitle = computed(() => title ?? t('modelSelector.title'));
  const context = useModelSelectorContext('ModelSelectorContent');
</script>
