import { createTransferFoundation, getTransferDataInfo } from '@sdata/web-core/transfer/foundation';
import { useRef, useState } from 'react';

import type { TransferProps } from './types.js';

import { Button } from '../button/index.js';
import { usePrefix } from '../config-provider/index.js';
import { useFormItem } from '../form/context.js';
import { IconLeft } from '../icon/icon-left.js';
import { IconRight } from '../icon/icon-right.js';
import { useI18n } from '../locale/index.js';
import { TransferView } from './view.js';

export type {
  TransferProps,
  TransferItem,
  TransferDirection,
  TransferPanelState,
  TransferTitleState,
  TransferInstance,
  DataInfo,
} from './types.js';

export function Transfer(props: TransferProps) {
  const {
    data = [],
    value: controlled,
    defaultValue = [],
    selected: controlledSelected,
    defaultSelected = [],
    disabled: _disabled,
    simple = false,
    oneWay = false,
    showSearch = false,
    showSelectAll = true,
    title = ['Source', 'Target'],
    sourceInputSearchProps,
    targetInputSearchProps,
    renderItem,
    renderSource,
    renderTarget,
    renderSourceTitle,
    renderTargetTitle,
    toSourceIcon,
    toTargetIcon,
    onValueChange: _onValueChange,
    onChange: _onChange,
    onSelectedChange: _onSelectedChange,
    onSelect: _onSelect,
    onSearch: _onSearch,
    className,
    ...attrs
  } = props;
  const prefix = usePrefix('transfer');
  const { t } = useI18n();
  const form = useFormItem(props);
  const disabled = form.mergedDisabled;
  const [innerTarget, setTarget] = useState(defaultValue);
  const [innerSelected, setSelected] = useState(defaultSelected);
  const target = controlled ?? innerTarget;
  const selected = controlledSelected ?? innerSelected;
  const live = useRef({ props, data, target, selected, form });
  live.current = { props, data, target, selected, form };
  const [foundation] = useState(() =>
    createTransferFoundation({
      getTarget: () => live.current.target,
      getDataInfo: () =>
        getTransferDataInfo(live.current.data, live.current.target, live.current.selected),
      setTarget(value) {
        if (live.current.props.value === undefined) live.current.target = value;
        setTarget(value);
      },
      setSelected(value) {
        if (live.current.props.selected === undefined) live.current.selected = value;
        setSelected(value);
      },
      onUpdateTarget: (value) => live.current.props.onValueChange?.(value),
      onChange: (value) => live.current.props.onChange?.(value),
      onFormChange: () => live.current.form.eventHandlers?.onChange?.(),
      onUpdateSelected: (value) => live.current.props.onSelectedChange?.(value),
      onSelect: (value) => live.current.props.onSelect?.(value),
      onSearch: (value, type) => live.current.props.onSearch?.(value, type),
    }),
  );
  const info = getTransferDataInfo(data, target, selected);
  const shared = {
    disabled,
    simple,
    showSearch,
    showSelectAll,
    selected,
    renderItem,
    onSelect: foundation.select,
    moveTo: foundation.moveTo,
    onSearch: foundation.search,
  };
  return (
    <div
      {...attrs}
      className={[prefix, simple && `${prefix}-simple`, disabled && `${prefix}-disabled`, className]
        .filter(Boolean)
        .join(' ')}
    >
      <TransferView
        {...shared}
        type="source"
        title={title[0]}
        dataInfo={info.sourceInfo}
        inputSearchProps={sourceInputSearchProps}
        renderContent={renderSource}
        renderTitle={renderSourceTitle}
      />
      {!simple && (
        <div className={`${prefix}-operations`}>
          <Button
            aria-label={t('a11y.moveSelectedRight')}
            size="small"
            shape="round"
            disabled={disabled || info.sourceInfo.validSelected.length === 0}
            onClick={() => foundation.moveSelected('target')}
            icon={toTargetIcon ?? <IconRight />}
          />
          {!oneWay && (
            <Button
              aria-label={t('a11y.moveSelectedLeft')}
              size="small"
              shape="round"
              disabled={disabled || info.targetInfo.validSelected.length === 0}
              onClick={() => foundation.moveSelected('source')}
              icon={toSourceIcon ?? <IconLeft />}
            />
          )}
        </div>
      )}
      <TransferView
        {...shared}
        type="target"
        title={title[1]}
        dataInfo={info.targetInfo}
        inputSearchProps={targetInputSearchProps}
        allowClear={oneWay}
        renderContent={renderTarget}
        renderTitle={renderTargetTitle}
      />
    </div>
  );
}
