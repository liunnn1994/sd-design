import type { DataInfo, TransferDirection, TransferItem } from '@sdata/web-core/transfer/types';
import type { ComponentPropsWithRef, ReactNode } from 'react';

import type { InputSearchProps } from '../input/index.js';

export type { DataInfo, TransferDirection, TransferItem } from '@sdata/web-core/transfer/types';
export interface TransferPanelState {
  data: TransferItem[];
  selectedKeys: string[];
  onSelect(values: string[]): void;
}
export interface TransferTitleState {
  countTotal: number;
  countSelected: number;
  searchValue: string;
  checked: boolean;
  indeterminate: boolean;
  onSelectAllChange(checked: boolean): void;
  onClear(): void;
}
export interface TransferProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'onChange' | 'onSelect' | 'defaultValue' | 'title' | 'children'
> {
  data?: TransferItem[];
  value?: string[];
  defaultValue?: string[];
  selected?: string[];
  defaultSelected?: string[];
  disabled?: boolean;
  simple?: boolean;
  oneWay?: boolean;
  showSearch?: boolean;
  showSelectAll?: boolean;
  title?: string[];
  sourceInputSearchProps?: InputSearchProps;
  targetInputSearchProps?: InputSearchProps;
  renderItem?: (item: Pick<TransferItem, 'label' | 'value'>) => ReactNode;
  renderSource?: (state: TransferPanelState) => ReactNode;
  renderTarget?: (state: TransferPanelState) => ReactNode;
  renderSourceTitle?: (state: TransferTitleState) => ReactNode;
  renderTargetTitle?: (state: TransferTitleState) => ReactNode;
  toSourceIcon?: ReactNode;
  toTargetIcon?: ReactNode;
  onValueChange?(value: string[]): void;
  onChange?(value: string[]): void;
  onSelectedChange?(selected: string[]): void;
  onSelect?(selected: string[]): void;
  onSearch?(value: string, direction: TransferDirection): void;
}
export type TransferInstance = HTMLDivElement;

export interface TransferViewProps {
  type: TransferDirection;
  dataInfo: DataInfo;
  selected: string[];
  disabled: boolean;
  simple: boolean;
  allowClear?: boolean;
  title?: string;
  showSearch: boolean;
  showSelectAll: boolean;
  inputSearchProps?: InputSearchProps;
  renderItem?: TransferProps['renderItem'];
  renderContent?: TransferProps['renderSource'];
  renderTitle?: TransferProps['renderSourceTitle'];
  onSelect(values: string[]): void;
  onSearch(value: string, direction: TransferDirection): void;
  moveTo(values: string[], direction: TransferDirection): void;
}
