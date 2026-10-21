import type { JsonFormAdapter, JsonFormA2UI_0_9_1ComponentNode, JsonFormModel } from './types.js';

import { normalizeJsonFormField } from './field.js';
import { getJsonFormValue, setJsonFormValue } from './schema.js';
import { JSON_FORM_ADAPTERS } from './types.js';

export interface JsonFormBridge<S> {
  getControlledModel(): JsonFormModel | undefined;
  getInternalModel(): JsonFormModel;
  setInternalModel(model: JsonFormModel): void;
  wrapModel(model: JsonFormModel): JsonFormModel;
  getAdapter(): JsonFormAdapter | undefined;
  getGlobalAdapter(): JsonFormAdapter | undefined;
  getSchemas(): S[] | JsonFormA2UI_0_9_1ComponentNode[];
  translate(nodes: JsonFormA2UI_0_9_1ComponentNode[], model: JsonFormModel): S[];
  onUpdate(model: JsonFormModel): void;
}
export function createJsonFormFoundation<S>(bridge: JsonFormBridge<S>) {
  function syncModel(model: JsonFormModel | undefined) {
    if (model && bridge.getControlledModel() === undefined)
      bridge.setInternalModel(bridge.wrapModel(model));
  }
  const getWorkingModel = () => bridge.getControlledModel() ?? bridge.getInternalModel();
  const publish = (model: JsonFormModel) => {
    if (bridge.getControlledModel() !== undefined) bridge.onUpdate(model);
  };
  const getAdapter = () =>
    bridge.getAdapter() ?? bridge.getGlobalAdapter() ?? JSON_FORM_ADAPTERS.default;
  function getSchemas(): S[] {
    if (getAdapter() === JSON_FORM_ADAPTERS.a2ui_0_9_1) {
      return bridge.translate(
        bridge.getSchemas() as JsonFormA2UI_0_9_1ComponentNode[],
        getWorkingModel(),
      );
    }
    return bridge.getSchemas() as S[];
  }
  return { syncModel, getWorkingModel, publish, getAdapter, getSchemas };
}

export interface JsonFormFieldBridge {
  readonly model: JsonFormModel;
  readonly field: string;
  readonly adapter: JsonFormAdapter;
  onUpdate(model: JsonFormModel): void;
}
export function createJsonFormFieldFoundation(bridge: JsonFormFieldBridge) {
  const getValue = () => getJsonFormValue(bridge.model, bridge.field, bridge.adapter);
  const setValue = (value: unknown) => {
    setJsonFormValue(bridge.model, bridge.field, value, bridge.adapter);
    // A synchronous field setter may replace the model; publish its current value.
    bridge.onUpdate({ ...bridge.model });
  };
  const getNormalizedField = () => normalizeJsonFormField(bridge.field, bridge.adapter);
  return { getValue, setValue, getNormalizedField };
}
