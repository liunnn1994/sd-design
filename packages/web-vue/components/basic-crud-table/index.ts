import type { App } from 'vue';

import type { SDOptions } from '../_utils/types';

import { getComponentPrefix, setGlobalConfig } from '../_utils/global-config';
import _BasicCrudTable from './basic-crud-table.vue';

const BasicCrudTable = Object.assign(_BasicCrudTable, {
  install: (app: App, options?: SDOptions) => {
    setGlobalConfig(app, options);
    app.component(getComponentPrefix(options) + _BasicCrudTable.name, _BasicCrudTable);
  },
});
export type BasicCrudTableInstance = InstanceType<typeof _BasicCrudTable>;
export type {
  BasicCrudTableActionSlotProps,
  BasicCrudTableDataResult,
  BasicCrudTableModalFormProps,
  BasicCrudTableModalProps,
  BasicCrudTableModalSlotProps,
  BasicCrudTableModalSubmitContext,
  BasicCrudTableProps,
  BasicCrudTableRowLinkProps,
  BasicCrudTableTableProps,
  BasicCrudTableToolbarProps,
  InferBasicCrudTableRow,
  InferBasicCrudTableRowFromValue,
  MaybePromise,
} from './types';
export default BasicCrudTable;
