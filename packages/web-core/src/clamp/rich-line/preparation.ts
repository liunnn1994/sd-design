import type { PreparedRich } from '../rich.js';
import type { ClampBoundary } from '../types.js';

// Derived from vue-clamp v1.7.2, Copyright (c) 2018-present GU Yiling. MIT; see THIRD_PARTY_NOTICES.md.
import { prepareRich } from '../rich.js';

// Prepared source DOM is inert and only read by the patcher. Share at most one
// bounded source; connected trees, CSS inspection, and clamp results stay local.
let lastHtml = '';
let lastPrepared: PreparedRich | null = null;

export function prepareSharedRich(html: string, boundary: ClampBoundary): PreparedRich | null {
  if (lastPrepared && lastHtml === html && lastPrepared.boundary === boundary) {
    return lastPrepared;
  }

  const prepared = prepareRich(html, boundary);
  lastPrepared = html.length <= 8192 ? prepared : null;
  lastHtml = lastPrepared ? html : '';
  return prepared;
}
