import { createContext, useContext } from 'react';

export const DatePickerContext = createContext<{ datePickerT(key: string): string } | undefined>(
  undefined,
);
export function useDatePickerTranslate() {
  return useContext(DatePickerContext)?.datePickerT ?? ((key: string) => key);
}
