import { getValueData as sharedGetValueData } from '@sdata/web-core/input-tag/utils';

import type { InputTagFieldNames, TagData, TagDataInfo } from './interface';
export const getValueData: (
  value: Array<string | number | TagData>,
  fieldNames: Required<InputTagFieldNames>,
) => TagDataInfo[] = sharedGetValueData;
