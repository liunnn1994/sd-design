import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { useTableCellLoading } from '../../src/table/use-cell-loading.js';

interface Row {
  raw: { label: string };
  isLeaf?: boolean;
  children?: Row[];
}
function Cell({
  row,
  loadMore,
  onLoaded,
}: {
  row: Row;
  loadMore(raw: Row['raw'], done: (rows?: Row['raw'][]) => void): void;
  onLoaded(rows: Row['raw'][] | undefined, row: Row): void;
}) {
  const loading = useTableCellLoading(row, { loadMore, addLazyLoadData: onLoaded });
  return (
    <button data-testid="cell" onClick={loading.handleClick}>
      {row.raw.label}:{String(loading.isLoading)}
    </button>
  );
}
function Fixture() {
  const [row, setRow] = useState<Row>({ raw: { label: 'original' }, isLeaf: false });
  const [mounted, setMounted] = useState(true);
  const [calls, setCalls] = useState(0);
  const [applied, setApplied] = useState<string[]>([]);
  const [bubbles, setBubbles] = useState(0);
  const requests = useRef<((rows?: Row['raw'][]) => void)[]>([]);
  return (
    <>
      <output>
        {calls}:{applied.join('|')}:{bubbles}
      </output>
      <div onClick={() => setBubbles((count) => count + 1)}>
        {mounted && (
          <Cell
            row={row}
            loadMore={(_, done) => {
              setCalls((count) => count + 1);
              requests.current.push(done);
            }}
            onLoaded={(_, next) => setApplied((old) => [...old, next.raw.label])}
          />
        )}
      </div>
      <button onClick={() => setRow({ raw: { label: 'replacement' }, isLeaf: false })}>
        Replace
      </button>
      <button onClick={() => setRow({ ...row })}>Rewrap</button>
      <button onClick={() => setRow({ raw: { label: 'leaf' }, isLeaf: true })}>Leaf</button>
      <button onClick={() => setRow({ raw: { label: 'children' }, children: [] })}>Children</button>
      <button onClick={() => requests.current.shift()?.([{ label: 'loaded child' }])}>
        Resolve oldest
      </button>
      <button onClick={() => setMounted(!mounted)}>Toggle mount</button>
    </>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
