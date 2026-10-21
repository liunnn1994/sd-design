// Derived from vue-clamp v1.7.2, Copyright (c) 2018-present GU Yiling. MIT; see THIRD_PARTY_NOTICES.md.
import type { ClampControls } from './types.js';

export function createClampControls(expanded: { value: boolean }): ClampControls {
  function expand(): void {
    expanded.value = true;
  }

  function collapse(): void {
    expanded.value = false;
  }

  function toggle(): void {
    expanded.value = !expanded.value;
  }

  return {
    expand,
    collapse,
    toggle,
  };
}
