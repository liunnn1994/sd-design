import type {
  JsonFormAdapter,
  JsonFormBuiltinComponentType,
  JsonFormA2UI_0_9_1ComponentNode,
  JsonFormModel,
} from '@sdata/web-core/json-form/types';
import type { ComponentProps, ElementType, HTMLAttributes, ReactNode, Ref } from 'react';
import type { SetReturnType, Simplify, UnknownRecord } from 'type-fest';

import type { FormInstance, FormItemProps, FormProps } from '../form/index.js';
import type { ColProps } from '../grid/index.js';
import type { jsonFormBuiltInComponents } from './components.js';

export {
  A2UI_0_9_1,
  JSON_FORM_ADAPTERS,
  JSON_FORM_COMPONENT_TYPES,
} from '@sdata/web-core/json-form/types';
export type * from '@sdata/web-core/json-form/types';
export type JsonFormExternalComponentMap = Record<string, ElementType>;
export type JsonFormComponentType<External extends JsonFormExternalComponentMap = {}> =
  | JsonFormBuiltinComponentType
  | Extract<keyof External, string>
  | (string & {});
type PropsOf<
  Type extends string,
  External extends JsonFormExternalComponentMap,
> = Type extends keyof typeof jsonFormBuiltInComponents
  ? ComponentProps<(typeof jsonFormBuiltInComponents)[Type]>
  : Type extends keyof External
    ? ComponentProps<External[Type]>
    : UnknownRecord;
export type JsonFormComponentProps<
  Type extends string,
  External extends JsonFormExternalComponentMap = {},
> = string extends Type
  ? object
  : Omit<HTMLAttributes<HTMLElement>, keyof PropsOf<Type, External>> & PropsOf<Type, External>;
type ModelEvent<Props> = Props extends { onValueChange?: infer Event }
  ? Event
  : Props extends { onChange?: infer Event }
    ? Event
    : (value: unknown) => void;
type EventsOf<Props> = string extends keyof Props
  ? UnknownRecord
  : Simplify<
      Pick<Props, Extract<keyof Props, `on${string}`>> & {
        [
          Key in keyof Props as Key extends `on${infer Event}` ? Uncapitalize<Event> : never
        ]: Props[Key];
      } & { 'update:modelValue'?: ModelEvent<Props>; 'update:value'?: ModelEvent<Props> }
    >;
export type JsonFormComponentEvents<
  Type extends string,
  External extends JsonFormExternalComponentMap = {},
> = string extends Type ? UnknownRecord : EventsOf<PropsOf<Type, External>>;
export type JsonFormComponentSlotRenderer = ReactNode | ((...args: never[]) => ReactNode);
export interface JsonFormSchema<
  Type extends string = JsonFormBuiltinComponentType,
  External extends JsonFormExternalComponentMap = {},
> {
  field: string;
  label?: string;
  type?: Type;
  required?: boolean;
  hidden?: boolean;
  slotName?: string;
  render?: ElementType;
  span?: number;
  colProps?: ColProps;
  formItemProps?: Omit<FormItemProps, 'field' | 'label' | 'rules'>;
  formItemRules?: FormItemProps['rules'];
  formItemEvents?: EventsOf<FormItemProps>;
  componentProps?: JsonFormComponentProps<Type, External>;
  componentEvents?: JsonFormComponentEvents<Type, External>;
  componentSlots?: Record<string, JsonFormComponentSlotRenderer>;
  children?: JsonFormSchema<string, External>[];
}
export interface JsonFormItemSlotProps<External extends JsonFormExternalComponentMap = {}> {
  [key: string]: unknown;
  record: JsonFormSchema<string, External>;
  value: unknown;
}
export type JsonFormComponentRegistry<External extends JsonFormExternalComponentMap = {}> = Partial<
  Record<JsonFormComponentType<External>, ElementType>
>;
export interface JsonFormProviderConfig<External extends JsonFormExternalComponentMap = {}> {
  adapter?: JsonFormAdapter;
  components?: JsonFormComponentRegistry<External>;
}
export type JsonFormInstance = {
  [Key in keyof FormInstance]: SetReturnType<
    FormInstance[Key],
    ReturnType<FormInstance[Key]> | undefined
  >;
};
export interface JsonFormProps<External extends JsonFormExternalComponentMap = {}> extends Omit<
  FormProps,
  'model' | 'ref'
> {
  schemas: JsonFormSchema<string, External>[] | JsonFormA2UI_0_9_1ComponentNode[];
  value?: JsonFormModel;
  modelValue?: JsonFormModel;
  model?: JsonFormModel;
  adapter?: JsonFormAdapter;
  hideLabel?: boolean;
  hideAsterisk?: boolean;
  showColon?: boolean;
  component?: ElementType;
  ref?: Ref<JsonFormInstance>;
  onValueChange?(model: JsonFormModel): void;
  slots?: Record<string, (data: JsonFormItemSlotProps<External>) => ReactNode>;
}
export const defineJsonFormComponents = <const External extends JsonFormExternalComponentMap>(
  components: External,
) => components;
export const defineJsonFormSchemas =
  <const External extends JsonFormExternalComponentMap>() =>
  <const Schemas extends JsonFormSchema<JsonFormComponentType<External>, External>[]>(
    schemas: Schemas,
  ) =>
    schemas;
