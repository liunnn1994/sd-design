import { onActivate } from '@sdata/web-core/_utils/keyboard';
import { createTransferItemFoundation } from '@sdata/web-core/transfer/foundation';

import type { TransferItem, TransferViewProps } from './types.js';

import { Checkbox } from '../checkbox/index.js';
import { usePrefix } from '../config-provider/index.js';
import { IconClose } from '../icon/icon-close.js';
import { useI18n } from '../locale/index.js';

export function TransferListItem({
  data,
  type,
  selected,
  simple,
  disabled,
  allowClear,
  renderItem,
  onSelect,
  moveTo,
}: Pick<
  TransferViewProps,
  'type' | 'selected' | 'simple' | 'disabled' | 'allowClear' | 'renderItem' | 'onSelect' | 'moveTo'
> & { data: TransferItem }) {
  const prefix = usePrefix('transfer-list-item');
  const hover = usePrefix('icon-hover');
  const { t } = useI18n();
  const foundation = createTransferItemFoundation({
    isSimple: () => simple,
    isDisabled: () => disabled,
    getValue: () => data.value,
    getType: () => type,
    onSelect,
    moveTo,
  });
  const content = renderItem ? renderItem({ label: data.label, value: data.value }) : data.label;
  return (
    <div
      className={[prefix, disabled && `${prefix}-disabled`].filter(Boolean).join(' ')}
      onClick={foundation.click}
    >
      {allowClear || simple ? (
        <span className={`${prefix}-content`}>{content}</span>
      ) : (
        <Checkbox
          className={`${prefix}-content ${prefix}-checkbox`}
          modelValue={selected}
          value={data.value}
          disabled={disabled}
          uninjectGroupContext
          onChange={foundation.change}
        >
          {content}
        </Checkbox>
      )}
      {allowClear && !disabled && (
        <span
          className={`${prefix}-remove-btn`}
          role="button"
          tabIndex={0}
          aria-label={t('a11y.remove')}
          onClick={(event) => {
            event.stopPropagation();
            foundation.remove();
          }}
          onKeyDown={(event) => onActivate(foundation.remove)(event.nativeEvent)}
        >
          <span className={hover}>
            <IconClose />
          </span>
        </span>
      )}
    </div>
  );
}
