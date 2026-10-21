export const RADIO_TYPES = ['radio', 'button'] as const;
export type RadioType = (typeof RADIO_TYPES)[number];
export type RadioValue = string | number | boolean;

export type RadioGroupChangeHandler = (value: RadioValue) => void;
