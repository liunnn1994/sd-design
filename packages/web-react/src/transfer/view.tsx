import { createTransferViewFoundation } from '@sdata/web-core/transfer/foundation';
import { useState } from 'react';

import type { TransferViewProps } from './types.js';

import { Checkbox } from '../checkbox/index.js';
import { usePrefix } from '../config-provider/index.js';
import { Empty } from '../empty/index.js';
import { IconDelete } from '../icon/icon-delete.js';
import { InputSearch } from '../input/index.js';
import { List } from '../list/index.js';
import { Scrollbar } from '../scrollbar/index.js';
import { TransferListItem } from './item.js';

export function TransferView(props: TransferViewProps) {
  const {
    type,
    dataInfo,
    selected,
    disabled,
    simple,
    allowClear,
    title,
    showSearch,
    showSelectAll,
    inputSearchProps,
    renderTitle,
    renderContent,
    onSelect,
    onSearch,
    moveTo,
  } = props;
  const prefix = usePrefix('transfer-view');
  const transfer = usePrefix('transfer');
  const hover = usePrefix('icon-hover');
  const [filter, setFilter] = useState('');
  const foundation = createTransferViewFoundation({
    getDataInfo: () => dataInfo,
    getSelected: () => selected,
    getFilter: () => filter,
    isDisabled: () => disabled,
    onSelect,
    moveTo,
  });
  const checked = foundation.isChecked();
  const indeterminate = foundation.isIndeterminate();
  const filtered = foundation.getFilteredData();
  return (
    <div className={`${prefix} ${transfer}-view-${type}`}>
      <div className={`${prefix}-header`}>
        {renderTitle ? (
          renderTitle({
            countTotal: dataInfo.data.length,
            countSelected: dataInfo.selected.length,
            searchValue: filter,
            checked,
            indeterminate,
            onSelectAllChange: foundation.selectAll,
            onClear: foundation.clear,
          })
        ) : (
          <>
            <span className={`${prefix}-header-title`}>
              {allowClear || simple || !showSelectAll ? (
                <span className={`${prefix}-header-title-simple`}>{title}</span>
              ) : (
                <Checkbox
                  modelValue={checked}
                  indeterminate={indeterminate}
                  disabled={disabled}
                  uninjectGroupContext
                  onChange={foundation.selectAll}
                >
                  {title}
                </Checkbox>
              )}
            </span>
            {allowClear ? (
              <span
                className={[hover, disabled && `${hover}-disabled`, `${prefix}-header-clear-btn`]
                  .filter(Boolean)
                  .join(' ')}
                onClick={foundation.clear}
              >
                <IconDelete />
              </span>
            ) : (
              !simple && (
                <span className={`${prefix}-header-count`}>
                  {dataInfo.selected.length} / {dataInfo.data.length}
                </span>
              )
            )}
          </>
        )}
      </div>
      {showSearch && (
        <div className={`${prefix}-search`}>
          <InputSearch
            value={filter}
            disabled={disabled}
            {...inputSearchProps}
            onValueChange={(value) => {
              setFilter(value);
              inputSearchProps?.onValueChange?.(value);
            }}
            onChange={(value, event) => {
              inputSearchProps?.onChange?.(value, event);
              onSearch(value, type);
            }}
          />
        </div>
      )}
      <div className={`${prefix}-body`}>
        {filtered.length > 0 ? (
          <Scrollbar>
            {renderContent ? (
              renderContent({ data: filtered, selectedKeys: selected, onSelect })
            ) : (
              <List className={`${prefix}-list`} bordered={false}>
                {filtered.map((data) => (
                  <TransferListItem
                    key={data.value}
                    {...props}
                    data={data}
                    disabled={disabled || !!data.disabled}
                  />
                ))}
              </List>
            )}
          </Scrollbar>
        ) : (
          <Empty className={`${prefix}-empty`} />
        )}
      </div>
    </div>
  );
}
