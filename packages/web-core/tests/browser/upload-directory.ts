export function dropUploadDirectory(target: HTMLElement) {
  const win = target.ownerDocument.defaultView!;
  const entry = (name: string) => ({
    isFile: true,
    fullPath: `/folder/${name}`,
    file: (done: (file: File) => void) => done(new win.File(['payload'], name)),
  });
  const batches = [[entry('one.txt')], [entry('skip.png'), entry('two.txt')], []];
  const directory = {
    isDirectory: true,
    createReader: () => ({
      readEntries: (done: (entries: unknown[]) => void) => done(batches.shift()!),
    }),
  };
  const drop = new win.Event('drop', { bubbles: true, cancelable: true });
  Object.defineProperty(drop, 'dataTransfer', {
    value: { items: [{ webkitGetAsEntry: () => directory }] },
  });
  target.dispatchEvent(drop);
  return drop.defaultPrevented;
}
