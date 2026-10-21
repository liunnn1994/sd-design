import type { Ref } from 'vue';

import type { TagProps } from '../../tag';
import type { CascaderOption } from '../interface';

import { getOptionInfos, getLeafOptionInfos } from '../utils';

export function cascaderUtilityTypeContract(
  options: CascaderOption[],
  config: Parameters<typeof getOptionInfos>[1],
) {
  const totalLevel: Ref<number> = config.totalLevel;
  const modeled = getOptionInfos(options, config);
  const leaf = getLeafOptionInfos(modeled[0])[0];
  const tagProps: TagProps | undefined = leaf.tagProps;
  return { totalLevel, tagProps };
}
