import type { FilterOption, SelectOptionData, SelectOptionGroup } from '../select/types.js';

export type AutoCompleteData = Array<string | number | SelectOptionData | SelectOptionGroup>;
export type AutoCompleteFilterOption = FilterOption;
export type AutoCompleteChangeHandler = (value: string) => void;
export type AutoCompleteSearchHandler = (value: string) => void;
export type AutoCompleteSelectHandler = (value: string) => void;
export type AutoCompleteClearHandler = (event: Event) => void;
export type AutoCompleteDropdownScrollHandler = (event: Event) => void;
export type AutoCompleteDropdownReachBottomHandler = (event: Event) => void;
