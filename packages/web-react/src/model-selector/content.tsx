import type { HTMLAttributes } from 'react';

import { usePrefix } from '../config-provider/index.js';
import { useI18n } from '../locale/index.js';
import { Modal } from '../modal/index.js';
import { useModelSelectorContext } from './context.js';
import { ModelSelector, type ModelSelectorProps } from './model-selector.js';

export interface ModelSelectorContentProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onCancel' | 'onClose' | 'draggable' | 'onSelect'
> {
  title?: string;
  width?: number | string;
  renderToBody?: boolean;
  unmountOnClose?: boolean;
  maskClosable?: boolean;
  escToClose?: boolean;
}
export function ModelSelectorContent({
  title,
  width = 640,
  renderToBody = true,
  unmountOnClose = true,
  maskClosable = true,
  escToClose = true,
  children,
  className,
  ...attrs
}: ModelSelectorContentProps) {
  const context = useModelSelectorContext('ModelSelectorContent');
  const prefix = usePrefix('model-selector');
  const { t } = useI18n();
  return (
    <Modal
      {...attrs}
      visible={context.visible}
      title={title ?? t('modelSelector.title')}
      width={width}
      renderToBody={renderToBody}
      unmountOnClose={unmountOnClose}
      maskClosable={maskClosable}
      escToClose={escToClose}
      closable={false}
      footer={false}
      className={className}
      modalClass={`${prefix}-modal`}
      bodyClass={`${prefix}-body`}
      onVisibleChange={context.foundation.setVisible}
    >
      <div className={prefix}>{children}</div>
    </Modal>
  );
}
export interface ModelSelectorDialogProps
  extends Omit<ModelSelectorProps, 'children'>, ModelSelectorContentProps {}
export function ModelSelectorDialog(props: ModelSelectorDialogProps) {
  const {
    visible,
    defaultVisible,
    defaultExpanded,
    closeOnSelect,
    resetQueryOnClose,
    onVisibleChange,
    onUpdateVisible,
    onSelect,
    children,
    ...content
  } = props;
  return (
    <ModelSelector
      {...(Object.hasOwn(props, 'visible') ? { visible } : {})}
      defaultVisible={defaultVisible}
      defaultExpanded={defaultExpanded}
      closeOnSelect={closeOnSelect}
      resetQueryOnClose={resetQueryOnClose}
      onVisibleChange={onVisibleChange}
      onUpdateVisible={onUpdateVisible}
      onSelect={onSelect}
    >
      <ModelSelectorContent {...content}>{children}</ModelSelectorContent>
    </ModelSelector>
  );
}
