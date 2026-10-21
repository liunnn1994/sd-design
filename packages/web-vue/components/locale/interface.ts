import type {
  SDCalendarLang as CoreCalendarLang,
  ValidateMessage as CoreValidateMessage,
  SdA11yLang as CoreA11yLang,
  SdLang as CoreLang,
} from '@sdata/web-core/locale/types';

export interface SDCalendarLang extends CoreCalendarLang {}
export interface ValidateMessage extends CoreValidateMessage {}
export interface SdA11yLang extends CoreA11yLang {}
export interface SdLang extends CoreLang {
  calendar: SDCalendarLang;
  form?: { validateMessages: ValidateMessage };
  a11y: SdA11yLang;
}
export type SdI18nMessages = Record<string, SdLang>;
