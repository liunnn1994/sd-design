import type {
  JsonFormAdapter,
  JsonFormA2UI_0_9_1ComponentNode,
  JsonFormModel,
} from '@sdata/web-core/json-form/types';

import {
  createJsonFormFoundation,
  createJsonFormFieldFoundation,
  type JsonFormBridge,
} from '@sdata/web-core/json-form/foundation';
import { useLayoutEffect, useReducer, useRef, useState } from 'react';

export interface JsonFormStateOptions<Schema> {
  value?: JsonFormModel;
  model?: JsonFormModel;
  adapter?: JsonFormAdapter;
  schemas: Schema[] | JsonFormA2UI_0_9_1ComponentNode[];
  onValueChange?(model: JsonFormModel): void;
}

export function useJsonForm<Schema>(
  props: JsonFormStateOptions<Schema>,
  translate: JsonFormBridge<Schema>['translate'],
  globalAdapter?: JsonFormAdapter,
) {
  const current = useRef({ props, translate, globalAdapter });
  current.current = { props, translate, globalAdapter };
  const [, render] = useReducer((version: number) => version + 1, 0);
  const internal = useRef<JsonFormModel>(props.model ?? {});
  const [foundation] = useState(() =>
    createJsonFormFoundation<Schema>({
      getControlledModel: () => current.current.props.value,
      getInternalModel: () => internal.current,
      setInternalModel: (model) => {
        if (internal.current !== model) {
          internal.current = model;
          render();
        }
      },
      wrapModel: (model) => model,
      getAdapter: () => current.current.props.adapter,
      getGlobalAdapter: () => current.current.globalAdapter,
      getSchemas: () => current.current.props.schemas,
      translate: (nodes, model) => current.current.translate(nodes, model),
      onUpdate: (model) => current.current.props.onValueChange?.(model),
    }),
  );
  useLayoutEffect(() => {
    foundation.syncModel(props.model);
  }, [foundation, props.model]);
  const publish = (model: JsonFormModel) => {
    foundation.publish(model);
    render();
  };
  return {
    foundation,
    publish,
    refresh: render,
    model: foundation.getWorkingModel(),
    adapter: foundation.getAdapter(),
    schemas: foundation.getSchemas(),
  };
}

export function useJsonFormField(props: {
  model: JsonFormModel;
  field: string;
  adapter: JsonFormAdapter;
  onValueChange(model: JsonFormModel): void;
}) {
  const current = useRef(props);
  current.current = props;
  const [, render] = useReducer((version: number) => version + 1, 0);
  const [foundation] = useState(() =>
    createJsonFormFieldFoundation({
      get model() {
        return current.current.model;
      },
      get field() {
        return current.current.field;
      },
      get adapter() {
        return current.current.adapter;
      },
      onUpdate: (model) => {
        current.current.onValueChange(model);
        render();
      },
    }),
  );
  return { foundation, value: foundation.getValue(), field: foundation.getNormalizedField() };
}
