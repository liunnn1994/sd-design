import { isObject } from '../_utils/is.js';
import { InputTagFieldNames, TagData, TagDataInfo } from './types.js';

export const getValueData = <P>(
  value: Array<string | number | TagData<P>>,
  fieldNames: Required<InputTagFieldNames>,
): TagDataInfo<P>[] => {
  const result: TagDataInfo<P>[] = [];
  for (const item of value) {
    if (isObject(item)) {
      result.push({
        raw: item,
        value: item[fieldNames.value] as string | number,
        label: item[fieldNames.label] as string,
        closable: item[fieldNames.closable] as boolean,
        tagProps: item[fieldNames.tagProps] as TagDataInfo<P>['tagProps'],
      });
    } else {
      const raw = {
        value: item,
        label: String(item),
        closable: true,
      };
      result.push({
        raw,
        ...raw,
      });
    }
  }
  return result;
};
