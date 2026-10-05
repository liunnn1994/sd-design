import { isObject } from '../_utils/is';
import { InputTagFieldNames, TagData, TagDataInfo } from './interface';

export const getValueData = (
  value: Array<string | number | TagData>,
  fieldNames: Required<InputTagFieldNames>,
): TagDataInfo[] => {
  const result: TagDataInfo[] = [];
  for (const item of value) {
    if (isObject(item)) {
      result.push({
        raw: item,
        value: item[fieldNames.value] as string | number,
        label: item[fieldNames.label] as string,
        closable: item[fieldNames.closable] as boolean,
        tagProps: item[fieldNames.tagProps] as TagDataInfo['tagProps'],
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
