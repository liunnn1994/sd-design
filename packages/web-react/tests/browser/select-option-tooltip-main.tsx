import { StrictMode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import '@sdata/web-core/styles/style/index.scss';

import '../../styles/select.scss';
import { Select } from '../../src/select';

const query = new URLSearchParams(location.search);

flushSync(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Select
        data-testid="select-option-tooltip"
        options={['Long clipped option label '.repeat(12), 'Other']}
        ellipsis={query.get('tooltip') === 'performant' ? 'performant-ellipsis' : true}
        virtualListProps={query.has('virtual') ? {} : undefined}
        triggerProps={{ duration: 600 }}
        style={{ width: 150, margin: 100 }}
      />
    </StrictMode>,
  ),
);
