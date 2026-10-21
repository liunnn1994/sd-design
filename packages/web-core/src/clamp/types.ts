// Derived from vue-clamp v1.7.2, Copyright (c) 2018-present GU Yiling. MIT; see THIRD_PARTY_NOTICES.md.
// Package-level value-domain types live here because multiple components and
// algorithms use them. Component-specific public contracts stay colocated with
// their component family.
export type ClampBoundary = 'grapheme' | 'word';

export type ClampLength = number | string;

export type LineClampLocation = 'start' | 'middle' | 'end' | number;

export interface ClampProps {
  as?: string;
  maxLines?: number;
  maxHeight?: ClampLength;
  expanded?: boolean;
  ellipsis?: string;
  boundary?: ClampBoundary;
  location?: LineClampLocation;
}

// Multiline text/rich and wrap clamps expose the same imperative shell so slot
// controls can be shared across components.
export type ClampControls = {
  expand: () => void;
  collapse: () => void;
  toggle: () => void;
};

export type ClampState = {
  clamped: boolean;
  expanded: boolean;
};

export type ClampSlotProps = ClampControls & ClampState;

export type ClampExposed = ClampControls & {
  readonly clamped: boolean;
  readonly expanded: boolean;
};

export interface ClampEmits {
  'update:expanded': [value: boolean];
  'clampchange': [value: boolean];
}
