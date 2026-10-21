import type { TagData as CoreTagData } from '@sdata/web-core/input-tag/types';

import type { FieldString } from '../_utils/types';
import type { TagProps } from '../tag';
export interface TagData extends CoreTagData<TagProps> {}
export type InputTagFieldNames = FieldString<TagData>;
export interface TagDataInfo extends TagData {
  raw: Record<string, unknown>;
  value: string | number;
  label: string;
  closable: boolean;
}
