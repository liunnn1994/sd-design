import type { UnknownRecord } from 'type-fest';
export type MaybePromise<T> = T | Promise<T>;
export type BasicCrudTableDataResult<TData = UnknownRecord> =
  | TData[]
  | { data: TData[]; total?: number; count?: number; [key: string]: unknown };
export type BasicCrudTableModalSubmitContext<TRow = UnknownRecord> = {
  type: 'create' | 'edit';
  row?: TRow;
  model: UnknownRecord;
};
export type InferBasicCrudTableRowFromValue<TValue> = TValue extends readonly (infer TItem)[]
  ? TItem
  : TValue extends { data: infer TData }
    ? InferBasicCrudTableRowFromValue<TData>
    : TValue extends { results: infer TResults }
      ? InferBasicCrudTableRowFromValue<TResults>
      : never;

type AwaitedReturn<T> = T extends (...args: never[]) => infer TResult ? Awaited<TResult> : never;

export type InferBasicCrudTableRow<
  TFetchTableApi,
  TTableDataTransformer = undefined,
> = TTableDataTransformer extends (...args: never[]) => unknown
  ? InferBasicCrudTableRowFromValue<AwaitedReturn<TTableDataTransformer>>
  : InferBasicCrudTableRowFromValue<AwaitedReturn<TFetchTableApi>>;
