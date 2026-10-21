// Derived from vue-clamp v1.7.2, Copyright (c) 2018-present GU Yiling. MIT; see THIRD_PARTY_NOTICES.md.
import { queuePostFlushCb } from 'vue';

import { createLayoutMeasurer } from '@sdata/web-core/clamp/measure';
export { hasExplicitTextWidth } from '@sdata/web-core/clamp/measure';
export const measureLayout = createLayoutMeasurer(queuePostFlushCb);
