import type { KvListItem, KvListWorkingItem } from '@sdata/web-core/kv-list/types';

import { createListSort } from '@sdata/web-core/drag-sort/list';
import { getKvListFieldProps, getKvListKeyProps } from '@sdata/web-core/kv-list/fields';
import { createKvListFoundation } from '@sdata/web-core/kv-list/foundation';
import { useLayoutEffect, useRef, useState } from 'react';

import type { KvListProps } from './types.js';

import { AutoComplete } from '../auto-complete/index.js';
import { Button } from '../button/index.js';
import { usePrefix } from '../config-provider/index.js';
import { Input, InputPassword } from '../input/index.js';
import { useI18n } from '../locale/index.js';
import { Textarea } from '../textarea/index.js';
import { KvListIcon } from './icons.js';
export type * from './types.js';
export type KvListInstance = HTMLDivElement;
export function KvList({
  json,
  bulk,
  defaultJson = [],
  defaultBulk = '',
  onJsonChange,
  onBulkChange,
  type,
  keyProps,
  valueProps,
  disabled = false,
  bulkEditable,
  renderKey,
  renderValue,
  toolbarExtra,
  renderRowActions,
  className,
  ...attrs
}: KvListProps) {
  const prefix = usePrefix('kv-list');
  const { t } = useI18n();
  const live = useRef({ json, bulk, disabled, onJsonChange, onBulkChange });
  live.current = { json, bulk, disabled, onJsonChange, onBulkChange };
  const connected = useRef(false);
  const [, render] = useState(0);
  const [store] = useState(() => {
    const data = {
      rows: [] as KvListWorkingItem[],
      json: json ?? defaultJson,
      bulk: bulk ?? defaultBulk,
    };
    // Publish initialization only after React commits the connection.
    const initial: (() => void)[] = [];
    const refresh = () => {
      if (connected.current) render((value) => value + 1);
    };
    const publish = (callback: () => void) => {
      if (connected.current) callback();
      else initial.push(callback);
    };
    const setJson = (value: KvListItem[]) => {
      data.json = value;
      publish(() => live.current.onJsonChange?.(value));
      refresh();
    };
    const setBulk = (value: string) => {
      data.bulk = value;
      publish(() => live.current.onBulkChange?.(value));
      refresh();
    };
    const foundation = createKvListFoundation({
      get rows() {
        return data.rows;
      },
      set rows(value) {
        data.rows = value;
        refresh();
      },
      get json() {
        return live.current.json ?? data.json;
      },
      set json(value) {
        setJson(value);
      },
      get bulk() {
        return live.current.bulk ?? data.bulk;
      },
      set bulk(value) {
        setBulk(value);
      },
      get disabled() {
        return live.current.disabled;
      },
    });
    foundation.initialize();
    return { data, initial, foundation, setBulk };
  });
  const { foundation } = store;
  useLayoutEffect(() => {
    connected.current = true;
    store.initial.splice(0).forEach((callback) => callback());
    return () => {
      connected.current = false;
    };
  }, [store]);
  const jsonKey = JSON.stringify(json);
  const previous = useRef({ json: jsonKey, bulk });
  useLayoutEffect(() => {
    if (previous.current.json !== jsonKey) {
      previous.current.json = jsonKey;
      foundation.syncJson(json ?? store.data.json);
    }
    if (previous.current.bulk !== bulk) {
      previous.current.bulk = bulk;
      foundation.syncBulk(bulk ?? store.data.bulk);
    }
  });
  const [bulkMode, setBulkMode] = useState(false);
  const bulkAvailable = bulkEditable ?? type !== 'secret';
  useLayoutEffect(() => {
    if (!bulkAvailable) setBulkMode(false);
  }, [bulkAvailable]);
  const [rowsRoot, setRowsRoot] = useState<HTMLDivElement | null>(null);
  const sort = useRef<ReturnType<typeof createListSort> | null>(null);
  useLayoutEffect(() => {
    if (!rowsRoot) return;
    const current = createListSort(rowsRoot, {
      draggable: `.${prefix}-row`,
      handle: `.${prefix}-drag-handle`,
      ghostClass: `${prefix}-row--ghost`,
      chosenClass: `${prefix}-row--chosen`,
      move: foundation.moveItem,
    });
    sort.current = current;
    current.setDisabled(live.current.disabled);
    return () => {
      current.destroy();
      sort.current = null;
    };
  }, [rowsRoot, prefix, foundation]);
  useLayoutEffect(() => sort.current?.setDisabled(disabled), [disabled]);
  const keyOptions = getKvListKeyProps(keyProps, disabled, t('kvList.keyPlaceholder'), type);
  const valueOptions = getKvListFieldProps(valueProps, disabled, t('kvList.valuePlaceholder'));
  const bulkLabel = bulkMode ? t('kvList.switchToList') : t('kvList.switchToBulk');
  return (
    <div {...attrs} className={[prefix, className].filter(Boolean).join(' ')}>
      <div className={`${prefix}-toolbar`}>
        <div className={`${prefix}-toolbar-actions`}>
          {bulkAvailable && (
            <Button
              type="text"
              shape="circle"
              size="small"
              tooltip={bulkLabel}
              aria-label={bulkLabel}
              disabled={disabled}
              onClick={() => setBulkMode((value) => !value)}
              icon={<KvListIcon name={bulkMode ? 'list' : 'edit'} />}
              srOnly={bulkLabel}
            />
          )}
          <Button
            type="text"
            shape="circle"
            size="small"
            tooltip={t('kvList.clear')}
            aria-label={t('kvList.clear')}
            disabled={disabled}
            onClick={foundation.clearItems}
            icon={<KvListIcon name="delete" />}
            srOnly={t('kvList.clear')}
          />
          <Button
            type="text"
            shape="circle"
            size="small"
            tooltip={t('kvList.add')}
            aria-label={t('kvList.add')}
            disabled={disabled || bulkMode}
            onClick={foundation.addItem}
            icon={<KvListIcon name="plus" />}
            srOnly={t('kvList.add')}
          />
          {toolbarExtra}
        </div>
      </div>
      {bulkMode ? (
        <Textarea
          value={bulk ?? store.data.bulk}
          onValueChange={(value) => {
            store.setBulk(value);
            if (live.current.bulk === undefined) foundation.syncBulk(value);
          }}
          className={`${prefix}-bulk`}
          autoSize={{ minRows: 8, maxRows: 18 }}
          placeholder={t('kvList.bulkPlaceholder')}
          disabled={disabled}
          data-testid="kv-list-bulk"
        />
      ) : (
        <div ref={setRowsRoot} className={`${prefix}-rows`}>
          {store.data.rows.map((item, index) => {
            const publicItem = { key: item.key, value: item.value };
            const updateKey = (value: string) =>
              foundation.updateItem(index, { ...item, key: value });
            const updateValue = (value: string) => foundation.updateItem(index, { ...item, value });
            return (
              <div key={item.id} className={`${prefix}-row`} data-testid="kv-list-row">
                <span className={`${prefix}-drag-handle`}>
                  <Button
                    type="text"
                    shape="circle"
                    size="small"
                    disabled={disabled}
                    icon={<KvListIcon name="drag-dot-vertical" />}
                    srOnly={t('kvList.dragSort')}
                  />
                </span>
                <div className={`${prefix}-key`}>
                  {renderKey ? (
                    renderKey({
                      value: item.key,
                      item: publicItem,
                      index,
                      props: keyOptions,
                      update: updateKey,
                    })
                  ) : type === 'http-header' ? (
                    <AutoComplete {...keyOptions} value={item.key} onValueChange={updateKey} />
                  ) : (
                    <Input {...keyOptions} value={item.key} onValueChange={updateKey} />
                  )}
                </div>
                <div className={`${prefix}-value`}>
                  {renderValue ? (
                    renderValue({
                      value: item.value,
                      item: publicItem,
                      index,
                      props: valueOptions,
                      update: updateValue,
                    })
                  ) : type === 'secret' ? (
                    <InputPassword
                      {...valueOptions}
                      value={item.value}
                      onValueChange={updateValue}
                    />
                  ) : (
                    <Input {...valueOptions} value={item.value} onValueChange={updateValue} />
                  )}
                </div>
                <div className={`${prefix}-row-actions`}>
                  {renderRowActions?.({ item: publicItem, index })}
                  <Button
                    type="text"
                    shape="circle"
                    size="small"
                    status="danger"
                    tooltip={t('kvList.remove')}
                    aria-label={t('kvList.remove')}
                    disabled={disabled}
                    onClick={() => foundation.removeItem(index)}
                    icon={<KvListIcon name="delete" />}
                    srOnly={t('kvList.remove')}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
export default KvList;
