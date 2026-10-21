import type { BloomMenuItem as CoreBloomMenuItem } from '@sdata/web-core/bloom-menu/types';

import type { Component } from 'vue';
export type { BloomMenuOffset } from '@sdata/web-core/bloom-menu/types';
export interface BloomMenuItem extends CoreBloomMenuItem<Component> {}
