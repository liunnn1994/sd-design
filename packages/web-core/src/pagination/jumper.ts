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
      // Reset the draft without switching InputNumber to string output.
      if (!adapter.simple) adapter.setValue(undefined);
    });
  }
  function sync(value: number) {
    if (adapter.simple && value !== adapter.value) adapter.setValue(value);
  }
  return { change, sync };
}
