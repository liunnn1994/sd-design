import { FormItem } from './form-item.js';
import { FormRoot } from './form.js';

export const Form = Object.assign(FormRoot, { Item: FormItem });
export { FormItem };
export { useFormItem } from './context.js';
export type { FormProps, FormInstance } from './form.js';
export type { FormItemProps } from './form-item.js';
export type {
  FieldData,
  FieldRule,
  ValidatedError,
  ValidateStatus,
  ValidateTrigger,
  FormItemEventHandler,
} from '@sdata/web-core/form/types';
export type { FormErrors } from '@sdata/web-core/form/foundation';
export default Form;
