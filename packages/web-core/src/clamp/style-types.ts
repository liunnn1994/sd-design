// Derived from vue-clamp v1.7.2, Copyright (c) 2018-present GU Yiling. MIT; see THIRD_PARTY_NOTICES.md.
import type { Properties, PropertiesHyphen } from 'csstype';
export type ClampStyle = Properties<string | number> &
  PropertiesHyphen<string | number> & {
    [name: `--${string}`]: string | number | undefined;
  };
