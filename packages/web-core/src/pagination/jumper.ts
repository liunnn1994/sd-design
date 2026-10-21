export function formatPageJumper(value: number) {
  const integer = parseInt(value.toString(), 10);
  return Number.isNaN(integer) ? undefined : String(integer);
}

export interface PageJumperAdapter {
  readonly simple: boolean;
  readonly value: number | string | undefined;
  setValue(value: number | string | undefined): void;
  onChange(value: number): void;
  defer(callback: () => void): void;
}

export function createPageJumperFoundation(adapter: PageJumperAdapter) {
  function change(value: unknown) {
    if (typeof value !== 'number') return;
    adapter.onChange(value);
    adapter.defer(() => {
      // Empty text forces the nested InputNumber to reset even after an empty draft.
      if (!adapter.simple) adapter.setValue('');
    });
  }
  function sync(value: number) {
    if (adapter.simple && value !== adapter.value) adapter.setValue(value);
  }
  return { change, sync };
}
